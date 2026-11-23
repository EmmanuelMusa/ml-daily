import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERVALS, REVIEW_CAP, SET_SIZE, dayKey, addDays, emptyProgress, ensureToday, dueReviews,
  nextNew, dealMore, recordResult, overrideResult, stats,
} from '../assets/js/schedule.js';

const IDS = 'abcdefghij'.split('');
const D1 = '2026-11-01';
const ids = (p) => p.today.items.map((it) => it.id);
const kinds = (p) => p.today.items.map((it) => it.kind);

test('constants match the spec', () => {
  assert.deepEqual(INTERVALS, [1, 3, 7, 21]);
  assert.equal(REVIEW_CAP, 5);
  assert.equal(SET_SIZE, 3);
});

test('dayKey uses the local date and addDays crosses months', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2026-12-31', 21), '2027-01-21');
});

test('first day deals three new in bank order', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  assert.deepEqual(ids(p), ['a', 'b', 'c']);
  assert.deepEqual(kinds(p), ['new', 'new', 'new']);
  assert.ok(p.today.items.every((it) => it.result === null));
});

test('reload same day keeps the same set', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', true, D1);
  ensureToday(p, IDS, D1);
  assert.deepEqual(ids(p), ['a', 'b', 'c']);
  assert.equal(p.today.items[0].result, true);
});

test('a miss comes back tomorrow first', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', true, D1);
  recordResult(p, 'b', false, D1);
  recordResult(p, 'c', true, D1);
  assert.deepEqual(p.review.b, { step: 0, due: '2026-11-02' });
  ensureToday(p, IDS, '2026-11-02');
  assert.deepEqual(ids(p), ['b', 'd', 'e', 'f']);
  assert.deepEqual(kinds(p), ['review', 'new', 'new', 'new']);
});

test('review ladder 1,3,7,21 then learned', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', false, D1);
  let day = '2026-11-02';
  for (const gap of [3, 7, 21]) {
    ensureToday(p, IDS, day);
    assert.equal(p.today.items[0].id, 'a');
    recordResult(p, 'a', true, day);
    assert.equal(p.review.a.due, addDays(day, gap));
    day = p.review.a.due;
  }
  ensureToday(p, IDS, day);
  recordResult(p, 'a', true, day);
  assert.equal(p.review.a, undefined);
  assert.deepEqual(p.learned, ['a']);
});

test('miss on review resets to one day', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', false, D1);
  ensureToday(p, IDS, '2026-11-02');
  recordResult(p, 'a', true, '2026-11-02');
  ensureToday(p, IDS, '2026-11-05');
  recordResult(p, 'a', false, '2026-11-05');
  assert.deepEqual(p.review.a, { step: 0, due: '2026-11-06' });
});

test('review cap is five, rest roll over', () => {
  const p = emptyProgress();
  for (const [i, id] of ['a', 'b', 'c', 'd', 'e', 'f', 'g'].entries()) {
    p.history[id] = [{ day: D1, ok: false }];
    p.review[id] = { step: 0, due: addDays(D1, 1 + (i % 2)) };
  }
  assert.deepEqual(dueReviews(p, '2026-11-03'), ['a', 'c', 'e', 'g', 'b']);
  ensureToday(p, IDS, '2026-11-03');
  assert.equal(kinds(p).filter((k) => k === 'review').length, 5);
  assert.deepEqual(ids(p).slice(5), ['h', 'i', 'j']);
  for (const id of ids(p).slice(0, 5)) recordResult(p, id, true, '2026-11-03');
  assert.deepEqual(dueReviews(p, '2026-11-04'), ['d', 'f']);
});

test('do more adds three new each press', () => {
  const big = Array.from({ length: 20 }, (_, i) => `q${String(i).padStart(2, '0')}`);
  const p = ensureToday(emptyProgress(), big, D1);
  for (let i = 0; i < 3; i++) assert.equal(dealMore(p, big, D1), 3);
  assert.equal(p.today.items.length, 12);
  assert.equal(new Set(ids(p)).size, 12);
  assert.deepEqual(ids(p), big.slice(0, 12));
});

test('do more falls back to practice when bank is used up', () => {
  const small = ['a', 'b', 'c', 'd'];
  const p = ensureToday(emptyProgress(), small, D1);
  recordResult(p, 'a', false, D1);
  recordResult(p, 'b', true, D1);
  recordResult(p, 'c', false, D1);
  assert.equal(dealMore(p, small, D1), 1);
  recordResult(p, 'd', true, D1);
  assert.equal(dealMore(p, small, D1), 0);
  ensureToday(p, small, '2026-11-02');
  recordResult(p, 'a', true, '2026-11-02');
  recordResult(p, 'c', true, '2026-11-02');
  assert.equal(dealMore(p, small, '2026-11-02'), 0);
  ensureToday(p, small, '2026-11-03');
  assert.equal(dealMore(p, small, '2026-11-03'), 2);
  assert.deepEqual(kinds(p), ['practice', 'practice']);
  assert.equal(dealMore(p, small, '2026-11-03'), 0);
});

test('practice results do not touch the schedule', () => {
  const small = ['a', 'b', 'c'];
  const p = ensureToday(emptyProgress(), small, D1);
  recordResult(p, 'a', false, D1);
  recordResult(p, 'b', true, D1);
  recordResult(p, 'c', true, D1);
  p.review = {};
  ensureToday(p, small, '2026-11-02');
  assert.equal(dealMore(p, small, '2026-11-02'), 1);
  recordResult(p, 'a', false, '2026-11-02');
  assert.deepEqual(p.review, {});
  assert.equal(p.history.a.length, 2);
});

test('override undoes a miss', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', false, D1);
  overrideResult(p, 'a', D1);
  assert.equal(p.review.a, undefined);
  assert.deepEqual(p.history.a, [{ day: D1, ok: true }]);
  assert.equal(p.today.items[0].result, true);
});

test('override on a review miss moves it up the ladder instead', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', false, D1);
  ensureToday(p, IDS, '2026-11-02');
  recordResult(p, 'a', false, '2026-11-02');
  overrideResult(p, 'a', '2026-11-02');
  assert.deepEqual(p.review.a, { step: 1, due: '2026-11-05' });
});

test('new day after midnight rebuilds the set', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', false, D1);
  ensureToday(p, IDS, '2026-11-02');
  assert.deepEqual(ids(p), ['a', 'b', 'c', 'd']);
  recordResult(p, 'b', true, '2026-11-02');
  ensureToday(p, IDS, '2026-11-03');
  assert.deepEqual(ids(p), ['a', 'c', 'd', 'e']);
  assert.deepEqual(kinds(p), ['review', 'new', 'new', 'new']);
});

test('nextNew skips seen and already dealt ids', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, 'a', true, D1);
  assert.deepEqual(nextNew(p, IDS, 2), ['d', 'e']);
});

test('stats skip unknown ids and count streak', () => {
  const p = emptyProgress();
  p.history = {
    a: [{ day: '2026-11-01', ok: true }, { day: '2026-11-04', ok: false }],
    b: [{ day: '2026-11-03', ok: true }],
    c: [{ day: '2026-11-04', ok: true }],
    gone: [{ day: '2026-11-04', ok: false }],
  };
  p.review = { a: { step: 0, due: '2026-11-05' } };
  p.learned = ['b'];
  const bank = { questions: [{ id: 'a', topic: 'evaluation' }, { id: 'b', topic: 'math' }, { id: 'c', topic: 'math' }] };
  const s = stats(p, bank, '2026-11-04');
  assert.equal(s.answered, 4);
  assert.equal(s.accuracy, 0.75);
  assert.deepEqual(s.byTopic, { evaluation: { answered: 2, right: 1 }, math: { answered: 2, right: 2 } });
  assert.equal(s.streak, 2);
  assert.equal(s.day, 3);
  assert.equal(s.learned, 1);
  assert.equal(s.dueTomorrow, 1);
  assert.equal(stats(p, bank, '2026-11-05').streak, 2);
  assert.equal(stats(p, bank, '2026-11-06').streak, 0);
  assert.equal(stats(p, bank, '2026-11-05').day, 4);
});
