import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityByDay, coverage, dueForecast, byDifficulty, topicMastery } from '../assets/js/insights.js';
import { emptyProgress } from '../assets/js/schedule.js';

const bank = {
  topics: [{ key: 'evaluation', title: 'Evaluation' }, { key: 'math', title: 'Math' }, { key: 'data', title: 'Data' }],
  questions: [
    { id: 'a', topic: 'evaluation', difficulty: 1 },
    { id: 'b', topic: 'evaluation', difficulty: 2 },
    { id: 'c', topic: 'math', difficulty: 3 },
    { id: 'd', topic: 'math', difficulty: 2 },
    { id: 'e', topic: 'data', difficulty: 1 },
  ],
};

function sample() {
  const p = emptyProgress();
  p.history = {
    a: [{ day: '2026-11-20', ok: true }, { day: '2026-11-23', ok: true }],
    b: [{ day: '2026-11-23', ok: false }],
    c: [{ day: '2026-11-22', ok: false }],
    d: [{ day: '2026-11-22', ok: true }],
    gone: [{ day: '2026-11-23', ok: true }],
  };
  p.review = { b: { step: 0, due: '2026-11-24' }, c: { step: 1, due: '2026-11-22' }, gone: { step: 0, due: '2026-11-24' } };
  p.learned = ['d'];
  return p;
}

test('activity covers whole weeks from Monday through today', () => {
  const days = activityByDay(sample(), bank, '2026-11-23', 12);
  assert.equal(days[0].day, '2026-09-07');
  assert.equal(days.at(-1).day, '2026-11-23');
  assert.equal(days.length, 11 * 7 + 1);
  const d23 = days.at(-1);
  assert.deepEqual([d23.answered, d23.right], [2, 1]);
  const d22 = days.find((d) => d.day === '2026-11-22');
  assert.deepEqual([d22.answered, d22.right], [2, 1]);
});

test('coverage counts seen, learned and in review, skipping unknown ids', () => {
  assert.deepEqual(coverage(sample(), bank), { total: 5, seen: 4, learned: 1, inReview: 2 });
});

test('due forecast puts overdue reviews on today', () => {
  const f = dueForecast(sample(), bank, '2026-11-23', 7);
  assert.equal(f.length, 7);
  assert.deepEqual(f.slice(0, 2), [{ day: '2026-11-23', count: 1 }, { day: '2026-11-24', count: 1 }]);
  assert.equal(f.reduce((s, x) => s + x.count, 0), 2);
});

test('accuracy by difficulty', () => {
  assert.deepEqual(byDifficulty(sample(), bank), {
    1: { answered: 2, right: 2 },
    2: { answered: 2, right: 1 },
    3: { answered: 1, right: 0 },
  });
});

test('topic mastery lists weakest started topics first, then unstarted', () => {
  const m = topicMastery(sample(), bank);
  assert.deepEqual(m.map((t) => t.key), ['math', 'evaluation', 'data']);
  assert.deepEqual(m[0], { key: 'math', title: 'Math', total: 2, seen: 2, answered: 2, right: 1, accuracy: 0.5 });
  assert.deepEqual(m[2], { key: 'data', title: 'Data', total: 1, seen: 0, answered: 0, right: 0, accuracy: null });
});
