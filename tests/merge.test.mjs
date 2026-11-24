import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeProgress, mergeCode, touch, stableStringify } from '../assets/js/merge.js';
import { emptyProgress, ensureToday, recordResult, overrideResult } from '../assets/js/schedule.js';
import { saveConcept, saveTerm, removeSaved } from '../assets/js/saved.js';
import { isProgress } from '../assets/js/store.js';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f'];
const D1 = '2026-11-01';
const D2 = '2026-11-02';

// Answers a question the way the app does: record it, then stamp the time.
function answer(p, id, ok, day, at) {
  recordResult(p, id, ok, day);
  touch(p, id, at);
  return p;
}

const copy = (p) => JSON.parse(JSON.stringify(p));

test('merging with itself changes nothing', () => {
  const p = ensureToday(emptyProgress(), IDS, D1);
  answer(p, 'a', true, D1, 100);
  answer(p, 'b', false, D1, 200);
  assert.equal(stableStringify(mergeProgress(p, copy(p))), stableStringify(p));
});

test('the inputs are left untouched', () => {
  const a = answer(ensureToday(emptyProgress(), IDS, D1), 'a', true, D1, 100);
  const b = answer(ensureToday(emptyProgress(), IDS, D1), 'b', false, D1, 200);
  const before = [stableStringify(a), stableStringify(b)];
  mergeProgress(a, b);
  assert.deepEqual([stableStringify(a), stableStringify(b)], before);
});

test('questions answered on only one side are all kept', () => {
  const a = answer(emptyProgress(), 'a', true, D1, 100);
  const b = answer(emptyProgress(), 'b', false, D2, 200);
  const m = mergeProgress(a, b);
  assert.deepEqual(m.history.a, [{ day: D1, ok: true }]);
  assert.deepEqual(m.history.b, [{ day: D2, ok: false }]);
  assert.ok(m.review.b, 'the miss is scheduled');
  assert.deepEqual(m.touched, { a: 100, b: 200 });
  assert.equal(isProgress(m), true);
});

test('for a question answered on both sides, the later answer wins', () => {
  const base = answer(emptyProgress(), 'a', false, D1, 100);
  const phone = answer(copy(base), 'a', false, D2, 300);
  const laptop = answer(copy(base), 'a', true, D2, 400);
  const m = mergeProgress(phone, laptop);
  assert.deepEqual(m.history.a, laptop.history.a);
  assert.deepEqual(m.review.a, laptop.review.a);
  assert.equal(mergeProgress(laptop, phone).history.a.at(-1).ok, true);
});

test('an override made later beats the miss it corrected', () => {
  const day = ensureToday(emptyProgress(), IDS, D1);
  const synced = answer(day, 'a', false, D1, 100);
  const fixed = copy(synced);
  overrideResult(fixed, 'a', D1);
  touch(fixed, 'a', 150);
  const m = mergeProgress(synced, fixed);
  assert.deepEqual(m.history.a, [{ day: D1, ok: true }]);
  assert.equal(m.today.items.find((it) => it.id === 'a').result, true);
});

test('without times, the longer history wins when one extends the other', () => {
  const a = emptyProgress();
  recordResult(a, 'a', false, D1);
  const b = copy(a);
  recordResult(b, 'a', true, D2);
  assert.equal(mergeProgress(a, b).history.a.length, 2);
  assert.equal(mergeProgress(b, a).history.a.length, 2);
});

test('learned follows the winning side for that question', () => {
  const a = emptyProgress();
  a.learned = ['a'];
  touch(a, 'a', 500);
  const b = emptyProgress();
  b.review.a = { step: 2, due: D2 };
  touch(b, 'a', 100);
  const m = mergeProgress(b, a);
  assert.deepEqual(m.learned, ['a']);
  assert.equal(m.review.a, undefined);
});

test('the later day keeps its set and an older set is dropped', () => {
  const a = ensureToday(emptyProgress(), IDS, D1);
  const b = ensureToday(emptyProgress(), IDS, D2);
  assert.equal(mergeProgress(a, b).today.day, D2);
  assert.equal(mergeProgress(b, a).today.day, D2);
  assert.equal(mergeProgress(emptyProgress(), a).today.day, D1);
});

test('the same day combines answers and extra questions from both sides', () => {
  const base = ensureToday(emptyProgress(), IDS, D1);
  const phone = answer(copy(base), 'a', true, D1, 100);
  const laptop = answer(copy(base), 'b', false, D1, 200);
  laptop.today.items.push({ id: 'd', kind: 'new', result: null, before: null });
  const m = mergeProgress(phone, laptop);
  assert.deepEqual(m.today.items.map((it) => it.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(m.today.items.map((it) => it.result), [true, false, null, null]);
});

test('settings always stay with this device', () => {
  const a = emptyProgress();
  a.settings.theme = 'dark';
  const b = emptyProgress();
  b.settings.theme = 'light';
  assert.equal(mergeProgress(a, b).settings.theme, 'dark');
});

test('saved concepts and terms from both sides are combined once each', () => {
  const a = emptyProgress();
  saveConcept(a, 'precision', null, D1, 100);
  saveTerm(a, 'Platt scaling', null, D1, null, 110);
  const b = emptyProgress();
  saveConcept(b, 'precision', 'q1', D2, 120);
  saveConcept(b, 'recall', null, D2, 130);
  saveTerm(b, 'platt  SCALING', null, D2, null, 140);
  const m = mergeProgress(a, b);
  assert.deepEqual(m.saved.map((s) => s.concept ?? s.term), ['precision', 'Platt scaling', 'recall']);
});

test('a removal on one side wins over an older save on the other', () => {
  const a = emptyProgress();
  saveConcept(a, 'precision', null, D1, 100);
  const b = copy(a);
  removeSaved(b, { concept: 'precision' }, 200);
  assert.deepEqual(mergeProgress(a, b).saved, []);
  assert.deepEqual(mergeProgress(b, a).saved, []);
});

test('saving again after a removal brings it back', () => {
  const a = emptyProgress();
  saveConcept(a, 'precision', null, D1, 100);
  removeSaved(a, { concept: 'precision' }, 200);
  const b = copy(a);
  saveConcept(b, 'precision', null, D2, 300);
  assert.deepEqual(mergeProgress(a, b).saved.map((s) => s.concept), ['precision']);
  assert.deepEqual(mergeProgress(b, a).saved.map((s) => s.concept), ['precision']);
});

test('a reset on one side wins over everything older on the other', () => {
  const old = answer(ensureToday(emptyProgress(), IDS, D1), 'a', true, D1, 100);
  saveConcept(old, 'precision', null, D1, 100);
  const fresh = emptyProgress();
  fresh.epoch = 500;
  answer(fresh, 'b', true, D2, 600);
  for (const m of [mergeProgress(old, fresh), mergeProgress(fresh, old)]) {
    assert.deepEqual(Object.keys(m.history), ['b']);
    assert.equal(m.saved, undefined);
    assert.equal(m.epoch, 500);
    assert.equal(m.today, null);
  }
});

test('stableStringify ignores key order', () => {
  assert.equal(stableStringify({ b: 1, a: [{ y: 2, x: 1 }] }), stableStringify({ a: [{ x: 1, y: 2 }], b: 1 }));
});

test('a progress code loaded by hand is added even when either side was reset', () => {
  const old = answer(emptyProgress(), 'a', true, D1, 100);
  const fresh = emptyProgress();
  fresh.epoch = 500;
  answer(fresh, 'b', true, D2, 600);
  for (const m of [mergeCode(fresh, old), mergeCode(old, fresh)]) {
    assert.deepEqual(Object.keys(m.history).sort(), ['a', 'b']);
    assert.equal(m.epoch, 500);
  }
});
