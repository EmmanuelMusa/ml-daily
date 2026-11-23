// Numbers for the Progress page. Pure functions over progress and the bank.
// Ids that are no longer in the bank are skipped everywhere.
import { addDays } from './schedule.js';

function known(bank) {
  return new Map(bank.questions.map((q) => [q.id, q]));
}

function weekday(day) {
  const [y, m, d] = day.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // Monday is 0
}

// Every day from the Monday `weeks - 1` weeks before this week, through today.
export function activityByDay(p, bank, today, weeks = 12) {
  const byId = known(bank);
  const counts = new Map();
  for (const [id, h] of Object.entries(p.history)) {
    if (!byId.has(id)) continue;
    for (const e of h) {
      const c = counts.get(e.day) ?? { answered: 0, right: 0 };
      c.answered++;
      if (e.ok) c.right++;
      counts.set(e.day, c);
    }
  }
  const start = addDays(today, -(weekday(today) + 7 * (weeks - 1)));
  const out = [];
  for (let day = start; day <= today; day = addDays(day, 1)) {
    out.push({ day, ...(counts.get(day) ?? { answered: 0, right: 0 }) });
  }
  return out;
}

export function coverage(p, bank) {
  const byId = known(bank);
  return {
    total: bank.questions.length,
    seen: Object.keys(p.history).filter((id) => byId.has(id)).length,
    learned: p.learned.filter((id) => byId.has(id)).length,
    inReview: Object.keys(p.review).filter((id) => byId.has(id)).length,
  };
}

// Reviews due on each of the next `days` days. Overdue ones count on today.
export function dueForecast(p, bank, today, days = 7) {
  const byId = known(bank);
  const out = Array.from({ length: days }, (_, i) => ({ day: addDays(today, i), count: 0 }));
  for (const [id, r] of Object.entries(p.review)) {
    if (!byId.has(id)) continue;
    const slot = r.due <= today ? out[0] : out.find((d) => d.day === r.due);
    if (slot) slot.count++;
  }
  return out;
}

export function byDifficulty(p, bank) {
  const byId = known(bank);
  const out = { 1: { answered: 0, right: 0 }, 2: { answered: 0, right: 0 }, 3: { answered: 0, right: 0 } };
  for (const [id, h] of Object.entries(p.history)) {
    const q = byId.get(id);
    if (!q) continue;
    for (const e of h) {
      out[q.difficulty].answered++;
      if (e.ok) out[q.difficulty].right++;
    }
  }
  return out;
}

// One row per topic with questions. Started topics come first, weakest accuracy first.
export function topicMastery(p, bank) {
  const rows = new Map(bank.topics.map((t) => [t.key, { key: t.key, title: t.title, total: 0, seen: 0, answered: 0, right: 0, accuracy: null }]));
  for (const q of bank.questions) {
    const r = rows.get(q.topic);
    if (!r) continue;
    r.total++;
    const h = p.history[q.id];
    if (!h) continue;
    r.seen++;
    r.answered += h.length;
    r.right += h.filter((e) => e.ok).length;
  }
  const list = [...rows.values()].filter((r) => r.total > 0);
  for (const r of list) r.accuracy = r.answered ? r.right / r.answered : null;
  const order = new Map(list.map((r, i) => [r.key, i]));
  return list.sort((a, b) => {
    if ((a.accuracy === null) !== (b.accuracy === null)) return a.accuracy === null ? 1 : -1;
    if (a.accuracy !== null && a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return order.get(a.key) - order.get(b.key);
  });
}
