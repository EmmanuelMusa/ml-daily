import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY, loadProgress, saveProgress, isProgress, exportCode, importCode, pruneUnknown,
} from '../assets/js/store.js';
import { emptyProgress, ensureToday, recordResult } from '../assets/js/schedule.js';

const BAD = 'That code is not an ML Daily progress code.';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
}

function sample() {
  const p = ensureToday(emptyProgress(), ['a', 'b', 'c', 'd'], '2026-11-01');
  recordResult(p, 'a', false, '2026-11-01');
  recordResult(p, 'b', true, '2026-11-01');
  p.settings.theme = 'dark';
  return p;
}

const b64url = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

test('storage key', () => assert.equal(STORAGE_KEY, 'ml-daily:v1'));

test('round trip through storage', () => {
  const s = memoryStorage();
  assert.equal(saveProgress(sample(), s), true);
  const { progress, persistent } = loadProgress(s);
  assert.equal(persistent, true);
  assert.deepEqual(progress, sample());
});

test('empty storage gives fresh progress that is persistent', () => {
  const { progress, persistent } = loadProgress(memoryStorage());
  assert.deepEqual(progress, emptyProgress());
  assert.equal(persistent, true);
});

test('storage that throws gives persistent false', () => {
  const s = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const { progress, persistent } = loadProgress(s);
  assert.deepEqual(progress, emptyProgress());
  assert.equal(persistent, false);
  assert.equal(saveProgress(sample(), s), false);
  assert.equal(loadProgress(undefined).persistent, false);
});

test('broken stored value is set aside', () => {
  const s = memoryStorage();
  s.setItem(STORAGE_KEY, '{not json');
  const { progress, persistent } = loadProgress(s);
  assert.deepEqual(progress, emptyProgress());
  assert.equal(persistent, true);
  assert.equal(s.getItem(STORAGE_KEY + ':broken'), '{not json');
});

test('isProgress checks the shape', () => {
  assert.equal(isProgress(sample()), true);
  assert.equal(isProgress({ v: 2 }), false);
  assert.equal(isProgress(null), false);
  assert.equal(isProgress({ ...emptyProgress(), learned: 'x' }), false);
});

test('export then import gives the same progress', () => {
  const code = exportCode(sample());
  assert.ok(code.startsWith('MLD1.'));
  assert.match(code.slice(5), /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(importCode(`  ${code}\n`), sample());
});

test('export handles non-ascii text', () => {
  const p = sample();
  p.settings.note = 'σ² café';
  assert.deepEqual(importCode(exportCode(p)), p);
});

test('import rejects junk and leaves nothing changed', () => {
  for (const code of ['hello', 'MLD1.%%%', 'MLD1.' + b64url('{"v":2}'), 'MLD1.' + b64url('not json'), '']) {
    assert.throws(() => importCode(code), { message: BAD }, code);
  }
});

test('prune drops unknown ids', () => {
  const p = sample();
  p.learned = ['b', 'gone'];
  p.review.gone = { step: 0, due: '2026-11-02' };
  p.today.items.push({ id: 'gone', kind: 'new', result: null, before: null });
  pruneUnknown(p, ['a', 'b', 'c', 'd']);
  assert.deepEqual(p.learned, ['b']);
  assert.equal(p.review.gone, undefined);
  assert.ok(p.review.a);
  assert.deepEqual(p.today.items.map((it) => it.id), ['a', 'b', 'c']);
});
