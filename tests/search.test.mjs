import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, searchGlossary } from '../assets/js/search.js';

const list = [
  { id: 'precision', name: 'Precision', aka: ['positive predictive value'], summary: 'Share of predicted positives that are right.' },
  { id: 'recall', name: 'Recall', aka: ['sensitivity'], summary: 'Share of real positives the model finds.' },
  { id: 'kv-cache', name: 'KV cache', aka: ['key-value cache'], summary: 'Stored keys and values so decoding skips recomputation.' },
];
const index = buildSearchIndex(list);

test('an empty query lists everything as name matches', () => {
  const r = searchGlossary(index, '   ');
  assert.deepEqual(r.byName.map((c) => c.id), ['precision', 'recall', 'kv-cache']);
  assert.deepEqual(r.bySummary, []);
});

test('name and other names match, ignoring case and hyphens', () => {
  assert.deepEqual(searchGlossary(index, 'SENSITIVITY').byName.map((c) => c.id), ['recall']);
  assert.deepEqual(searchGlossary(index, 'key value').byName.map((c) => c.id), ['kv-cache']);
});

test('summary-only matches come after name matches and are not repeated', () => {
  const r = searchGlossary(index, 'positive');
  assert.deepEqual(r.byName.map((c) => c.id), ['precision']);
  assert.deepEqual(r.bySummary.map((c) => c.id), ['recall']);
});

test('no match gives two empty lists', () => {
  const r = searchGlossary(index, 'dropout');
  assert.equal(r.byName.length + r.bySummary.length, 0);
});
