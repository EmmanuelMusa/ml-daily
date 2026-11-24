// Combining the progress from two devices into one.
//
// Each question is settled on its own. The side that touched it last wins its
// history, review step and learned state. Progress from before touch times
// existed falls back to the longer history. Saved concepts are combined, and
// a removal beats any save made before it. A reset (epoch) beats everything
// older. Settings never travel: they stay with the device that runs the merge.
import { savedKey } from './saved.js?v=8';

const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

// Records when a question was last answered or changed on this device.
export function touch(p, id, at) {
  (p.touched ??= {})[id] = at;
  return p;
}

// JSON with object keys sorted, so two copies of the same progress compare equal.
export function stableStringify(x) {
  if (Array.isArray(x)) return `[${x.map(stableStringify).join(',')}]`;
  if (x && typeof x === 'object') {
    return `{${Object.keys(x).sort().filter((k) => x[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stableStringify(x[k])}`).join(',')}}`;
  }
  return JSON.stringify(x ?? null);
}

const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const sameEntry = (e, f) => e.day === f.day && e.ok === f.ok;
const isPrefix = (short, long) => short.length <= long.length && short.every((e, i) => sameEntry(e, long[i]));

// Which side wins question id: 'a' or 'b'. Ties go to a, the device running the merge.
function winner(a, b, id) {
  const ta = a.touched?.[id] ?? 0;
  const tb = b.touched?.[id] ?? 0;
  if (ta !== tb) return ta > tb ? 'a' : 'b';
  const ha = a.history[id] ?? [];
  const hb = b.history[id] ?? [];
  if (isPrefix(ha, hb)) return hb.length > ha.length ? 'b' : 'a';
  if (isPrefix(hb, ha)) return 'a';
  return hb.length > ha.length ? 'b' : 'a';
}

const knows = (p, id) => id in p.history || id in p.review || p.learned.includes(id)
  || (p.touched !== undefined && id in p.touched);

function mergeToday(a, b, win) {
  if (!a.today || !b.today) return clone(a.today ?? b.today);
  if (a.today.day !== b.today.day) return clone(a.today.day > b.today.day ? a.today : b.today);
  const fromB = new Map(b.today.items.map((it) => [it.id, it]));
  const items = a.today.items.map((it) => clone(fromB.has(it.id) && win(it.id) === 'b' ? fromB.get(it.id) : it));
  const inA = new Set(a.today.items.map((it) => it.id));
  for (const it of b.today.items) if (!inA.has(it.id)) items.push(clone(it));
  return { day: a.today.day, items };
}

function mergeSaved(a, b) {
  if (!a.saved && !b.saved && !a.unsaved && !b.unsaved) return {};
  const unsaved = { ...(a.unsaved ?? {}) };
  for (const [k, at] of Object.entries(b.unsaved ?? {})) unsaved[k] = Math.max(unsaved[k] ?? 0, at);
  const seen = new Set();
  const saved = [];
  for (const s of [...(a.saved ?? []), ...(b.saved ?? [])]) {
    const k = savedKey(s);
    if (seen.has(k)) continue;
    seen.add(k);
    if (k in unsaved && unsaved[k] >= (s.at ?? 0)) continue;
    saved.push(clone(s));
  }
  // A fixed order, so two devices holding the same items agree they match.
  saved.sort((x, y) => (x.at ?? 0) - (y.at ?? 0) || cmp(x.day, y.day) || cmp(savedKey(x), savedKey(y)));
  const out = {};
  if (a.saved || b.saved) out.saved = saved;
  if (Object.keys(unsaved).length) out.unsaved = unsaved;
  return out;
}

// Returns a new progress object. a is this device, b is the other copy.
export function mergeProgress(a, b) {
  const ea = a.epoch ?? 0;
  const eb = b.epoch ?? 0;
  const settings = clone(a.settings);
  // Anything from before the most recent reset is dropped.
  if (ea !== eb) {
    const out = clone(ea > eb ? a : b);
    out.settings = settings;
    return out;
  }

  const ids = new Set([
    ...Object.keys(a.history), ...Object.keys(b.history),
    ...Object.keys(a.review), ...Object.keys(b.review),
    ...a.learned, ...b.learned,
    ...Object.keys(a.touched ?? {}), ...Object.keys(b.touched ?? {}),
  ]);
  const wins = new Map();
  const win = (id) => {
    if (!wins.has(id)) wins.set(id, winner(a, b, id));
    return wins.get(id);
  };

  const history = {};
  const review = {};
  const learned = [];
  const touched = {};
  for (const id of ids) {
    // Take the winner's state for this question, or the other side's if the winner never saw it.
    let src = win(id) === 'a' ? a : b;
    if (!knows(src, id)) src = src === a ? b : a;
    if (src.history[id]) history[id] = clone(src.history[id]);
    if (src.review[id]) review[id] = clone(src.review[id]);
    if (src.learned.includes(id)) learned.push(id);
    const t = Math.max(a.touched?.[id] ?? 0, b.touched?.[id] ?? 0);
    if (t) touched[id] = t;
  }

  learned.sort(cmp);
  const out = { v: 1, history, review, learned, today: mergeToday(a, b, win), settings, ...mergeSaved(a, b) };
  if (Object.keys(touched).length) out.touched = touched;
  if (ea) out.epoch = ea;
  return out;
}

// A progress code the person pasted in on purpose is always added, so a
// reset on either side does not drop it. The newer reset time is kept.
export function mergeCode(a, b) {
  const epoch = Math.max(a.epoch ?? 0, b.epoch ?? 0);
  const out = mergeProgress({ ...a, epoch }, { ...b, epoch });
  if (!epoch) delete out.epoch;
  return out;
}
