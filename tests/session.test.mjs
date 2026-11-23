import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMidAnswer } from '../assets/js/session.js';

const fresh = { id: 'a', response: null, checked: false, revealed: false, ok: null, notes: '' };

test('a fresh question is not mid-answer', () => {
  assert.equal(isMidAnswer(fresh), false);
  assert.equal(isMidAnswer({ ...fresh, response: '' }), false);
  assert.equal(isMidAnswer({ ...fresh, response: [] }), false);
});

test('a checked answer, a typed answer or an open reveal is mid-answer', () => {
  assert.equal(isMidAnswer({ ...fresh, checked: true }), true);
  assert.equal(isMidAnswer({ ...fresh, response: '0.5' }), true);
  assert.equal(isMidAnswer({ ...fresh, response: 2 }), true);
  assert.equal(isMidAnswer({ ...fresh, response: [1] }), true);
  assert.equal(isMidAnswer({ ...fresh, notes: 'draft' }), true);
  assert.equal(isMidAnswer({ ...fresh, revealed: true }), true);
});
