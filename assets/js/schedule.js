// Daily set, Do more and the review schedule.
// Functions mutate the progress object they are given and return it,
// unless they say otherwise.

export const INTERVALS = [1, 3, 7, 21];
export const REVIEW_CAP = 5;
export const SET_SIZE = 3;

const pad = (n) => String(n).padStart(2, '0');

export function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(day, n) {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function emptyProgress() {
  return { v: 1, history: {}, review: {}, learned: [], today: null, settings: { theme: 'light' } };
}

const todayIds = (p) => new Set((p.today?.items ?? []).map((it) => it.id));
const item = (id, kind) => ({ id, kind, result: null, before: null });

export function dueReviews(p, today, cap = REVIEW_CAP) {
  return Object.entries(p.review)
    .filter(([, r]) => r.due <= today)
    .sort(([a, ra], [b, rb]) => (ra.due < rb.due ? -1 : ra.due > rb.due ? 1 : a < b ? -1 : a > b ? 1 : 0))
    .slice(0, cap)
    .map(([id]) => id);
}

export function nextNew(p, bankIds, n) {
  const dealt = todayIds(p);
  const out = [];
  for (const id of bankIds) {
    if (out.length >= n) break;
    if (!p.history[id] && !dealt.has(id)) out.push(id);
  }
  return out;
}

export function ensureToday(p, bankIds, today) {
  if (p.today?.day === today) return p;
  p.today = { day: today, items: dueReviews(p, today).map((id) => item(id, 'review')) };
  p.today.items.push(...nextNew(p, bankIds, SET_SIZE).map((id) => item(id, 'new')));
  return p;
}

// Adds up to three new questions, or past misses to redo when the bank is used up.
// Returns how many were added.
export function dealMore(p, bankIds, today) {
  ensureToday(p, bankIds, today);
  const fresh = nextNew(p, bankIds, SET_SIZE);
  if (fresh.length) {
    p.today.items.push(...fresh.map((id) => item(id, 'new')));
    return fresh.length;
  }
  const dealt = todayIds(p);
  const known = new Set(bankIds);
  const missed = Object.entries(p.history)
    .filter(([id, h]) => known.has(id) && !dealt.has(id) && h.some((e) => !e.ok))
    .map(([id, h]) => [id, h[h.length - 1].day])
    .sort(([a, da], [b, db]) => (da < db ? -1 : da > db ? 1 : a < b ? -1 : a > b ? 1 : 0))
    .slice(0, SET_SIZE)
    .map(([id]) => id);
  p.today.items.push(...missed.map((id) => item(id, 'practice')));
  return missed.length;
}

function findItem(p, id) {
  return (p.today?.items ?? []).find((it) => it.id === id) ?? null;
}

function applyRule(p, id, kind, ok, today) {
  if (kind === 'practice') return;
  const r = p.review[id];
  if (!ok) {
    p.review[id] = { step: 0, due: addDays(today, INTERVALS[0]) };
  } else if (kind === 'review' && r) {
    if (r.step >= INTERVALS.length - 1) {
      delete p.review[id];
      if (!p.learned.includes(id)) p.learned.push(id);
    } else {
      p.review[id] = { step: r.step + 1, due: addDays(today, INTERVALS[r.step + 1]) };
    }
  }
}

export function recordResult(p, id, ok, today) {
  const it = findItem(p, id);
  const kind = it?.kind ?? (p.review[id] ? 'review' : 'new');
  (p.history[id] ??= []).push({ day: today, ok });
  const before = p.review[id] ? { ...p.review[id] } : null;
  if (it) {
    it.result = ok;
    it.before = before;
  }
  applyRule(p, id, kind, ok, today);
  return p;
}

// Turns a wrong answer into a right one, as if it had been right all along.
export function overrideResult(p, id, today) {
  const it = findItem(p, id);
  if (!it || it.result !== false) return p;
  if (it.before) p.review[id] = { ...it.before };
  else delete p.review[id];
  const h = p.history[id];
  if (h?.length) h[h.length - 1].ok = true;
  it.result = true;
  applyRule(p, id, it.kind, true, today);
  return p;
}

// Returns a new stats object. Ids not in the bank are skipped.
export function stats(p, bank, today) {
  const topicOf = new Map(bank.questions.map((q) => [q.id, q.topic]));
  const days = new Set([today]);
  const practiced = new Set();
  const byTopic = {};
  let answered = 0;
  let right = 0;
  for (const [id, h] of Object.entries(p.history)) {
    const topic = topicOf.get(id);
    if (!topic) continue;
    const t = (byTopic[topic] ??= { answered: 0, right: 0 });
    for (const e of h) {
      days.add(e.day);
      practiced.add(e.day);
      answered++;
      t.answered++;
      if (e.ok) {
        right++;
        t.right++;
      }
    }
  }
  let cursor = practiced.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (practiced.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  const tomorrow = addDays(today, 1);
  return {
    day: days.size,
    streak,
    answered,
    accuracy: answered ? right / answered : 0,
    byTopic,
    learned: p.learned.filter((id) => topicOf.has(id)).length,
    dueTomorrow: Object.entries(p.review).filter(([id, r]) => topicOf.has(id) && r.due <= tomorrow).length,
  };
}
