import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeLookup, isSaved, saveConcept, saveTerm, removeSaved, savedItems } from '../assets/js/saved.js';
import { emptyProgress } from '../assets/js/schedule.js';
import { isProgress, importCode, exportCode } from '../assets/js/store.js';

const concepts = [
  { id: 'precision', name: 'Precision', aka: ['positive predictive value', 'PPV'] },
  { id: 'kv-cache', name: 'KV cache', aka: ['key-value cache'] },
];
const lookup = makeLookup(concepts);

test('lookup matches name, other names and id, ignoring case and hyphens', () => {
  assert.equal(lookup('precision'), 'precision');
  assert.equal(lookup('  PPV '), 'precision');
  assert.equal(lookup('Key value cache'), 'kv-cache');
  assert.equal(lookup('kv-cache'), 'kv-cache');
  assert.equal(lookup('dropout'), null);
});

test('saving a concept once, with where it came from', () => {
  const p = emptyProgress();
  saveConcept(p, 'precision', 'eval-0003', '2026-11-23');
  saveConcept(p, 'precision', 'eval-0004', '2026-11-24');
  assert.equal(isSaved(p, 'precision'), true);
  assert.deepEqual(p.saved, [{ concept: 'precision', from: 'eval-0003', day: '2026-11-23' }]);
});

test('a free term that matches the glossary saves the concept', () => {
  const p = emptyProgress();
  assert.deepEqual(saveTerm(p, 'ppv', null, '2026-11-23', lookup), { concept: 'precision' });
  assert.equal(isSaved(p, 'precision'), true);
});

test('an unknown term is kept as typed, once, and blank input is ignored', () => {
  const p = emptyProgress();
  assert.deepEqual(saveTerm(p, '  Platt scaling ', null, '2026-11-23', lookup), { term: 'Platt scaling' });
  assert.equal(saveTerm(p, 'platt SCALING', null, '2026-11-23', lookup), null);
  assert.equal(saveTerm(p, '   ', null, '2026-11-23', lookup), null);
  assert.deepEqual(p.saved, [{ term: 'Platt scaling', from: null, day: '2026-11-23' }]);
});

test('long terms are cut to 80 characters', () => {
  const p = emptyProgress();
  saveTerm(p, 'x'.repeat(200), null, '2026-11-23', lookup);
  assert.equal(p.saved[0].term.length, 80);
});

test('remove by concept or by term', () => {
  const p = emptyProgress();
  saveConcept(p, 'precision', null, '2026-11-23');
  saveTerm(p, 'Platt scaling', null, '2026-11-23', lookup);
  removeSaved(p, { concept: 'precision' });
  assert.equal(isSaved(p, 'precision'), false);
  removeSaved(p, { term: 'PLATT scaling' });
  assert.deepEqual(p.saved, []);
});

test('savedItems lists newest first and works on progress without the field', () => {
  const p = emptyProgress();
  delete p.saved;
  assert.deepEqual(savedItems(p), []);
  saveConcept(p, 'precision', null, '2026-11-20');
  saveTerm(p, 'Platt scaling', null, '2026-11-23', lookup);
  assert.deepEqual(savedItems(p).map((s) => s.concept ?? s.term), ['Platt scaling', 'precision']);
});

test('progress with saved items is valid and survives a progress code', () => {
  const p = emptyProgress();
  saveConcept(p, 'precision', 'eval-0003', '2026-11-23');
  assert.equal(isProgress(p), true);
  assert.deepEqual(importCode(exportCode(p)), p);
  assert.equal(isProgress({ ...p, saved: 'x' }), false);
  assert.equal(isProgress({ ...p, saved: [{ day: '2026-11-23' }] }), false);
});
