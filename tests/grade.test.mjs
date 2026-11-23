import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeFill, parseNumber, hasResponse, grade, optionOrder } from '../assets/js/grade.js';

const mcq = { format: 'mcq', options: ['a', 'b', 'c', 'd'], answer: 2 };
const multi = { format: 'multi', options: ['a', 'b', 'c', 'd'], answer: [0, 2] };
const fill = { format: 'fill', answer: 'cross-entropy', accept: ['log loss'] };
const numeric = { format: 'numeric', answer: 0.5, tolerance: 0.005 };
const open = { format: 'open', answer: 'x', points: ['a', 'b', 'c'] };

test('parseNumber variants', () => {
  for (const [s, v] of [['.5', 0.5], ['0.50', 0.5], ['1,000', 1000], ['75%', 75], ['3/4', 0.75], [' 2 ', 2], ['-1.5', -1.5]]) {
    assert.ok(Math.abs(parseNumber(s) - v) < 1e-12, s);
  }
  for (const s of ['', 'abc', '1/0', '1.2.3', '5x']) assert.equal(parseNumber(s), null, s);
});

test('normalizeFill', () => {
  assert.equal(normalizeFill('  Cross-Entropy. '), 'cross entropy');
  assert.equal(normalizeFill('k_means'), 'k means');
});

test('hasResponse is false for empty or unparseable numeric', () => {
  assert.equal(hasResponse(numeric, ''), false);
  assert.equal(hasResponse(numeric, 'abc'), false);
  assert.equal(hasResponse(numeric, '.5'), true);
  assert.equal(hasResponse(fill, '   '), false);
  assert.equal(hasResponse(mcq, null), false);
  assert.equal(hasResponse(mcq, 0), true);
  assert.equal(hasResponse(multi, []), false);
  assert.equal(hasResponse(open, 'partly'), true);
});

test('mcq grades the original index', () => {
  assert.equal(grade(mcq, 2), true);
  assert.equal(grade(mcq, 1), false);
});

test('multi needs the exact set', () => {
  assert.equal(grade(multi, [2, 0]), true);
  assert.equal(grade(multi, [0]), false);
  assert.equal(grade(multi, [0, 1, 2]), false);
});

test('fill uses accept list', () => {
  assert.equal(grade(fill, 'Log Loss'), true);
  assert.equal(grade(fill, 'cross entropy'), true);
  assert.equal(grade(fill, 'hinge'), false);
});

test('numeric respects tolerance', () => {
  assert.equal(grade(numeric, '0.504'), true);
  assert.equal(grade(numeric, '.5'), true);
  assert.equal(grade(numeric, '0.51'), false);
  assert.equal(grade(numeric, '50%'), false);
});

test('open counts only got', () => {
  assert.equal(grade(open, 'got'), true);
  assert.equal(grade(open, 'partly'), false);
  assert.equal(grade(open, 'missed'), false);
});

test('optionOrder is a stable permutation', () => {
  const ids = Array.from({ length: 10 }, (_, i) => `eval-000${i}`);
  for (const id of ids) {
    const a = optionOrder(id, 4);
    assert.deepEqual(a, optionOrder(id, 4));
    assert.deepEqual([...a].sort(), [0, 1, 2, 3]);
  }
  const distinct = new Set(ids.map((id) => optionOrder(id, 4).join(',')));
  assert.ok(distinct.size > 1);
});

test('optionOrder matches the shared vector', () => {
  const vec = JSON.parse(readFileSync(new URL('./fixtures/option-order.json', import.meta.url), 'utf8'));
  assert.deepEqual(vec, { 'eval-0007': optionOrder('eval-0007', 4), 'py-0003': optionOrder('py-0003', 6) });
});
