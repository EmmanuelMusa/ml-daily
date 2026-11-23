import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, renderMarkup } from '../assets/js/markup.js';

test('escapeHtml escapes the five characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('escapes html in plain text', () => {
  assert.equal(renderMarkup('a <b> & c'), '<p>a &lt;b&gt; &amp; c</p>');
});

test('fenced code keeps semicolons and escapes', () => {
  assert.equal(renderMarkup('```\nx<1; y\n```'), '<pre><code>x&lt;1; y</code></pre>');
  assert.equal(renderMarkup('```python\nx = 1\n\ny = 2\n```'), '<pre><code>x = 1\n\ny = 2</code></pre>');
});

test('inline code, bold, list', () => {
  assert.equal(renderMarkup('Use `a*b` and **this**'), '<p>Use <code>a*b</code> and <strong>this</strong></p>');
  assert.equal(renderMarkup('Steps:\n- one\n- two `x`'), '<p>Steps:</p><ul><li>one</li><li>two <code>x</code></li></ul>');
});

test('blank lines split paragraphs and single newlines become breaks', () => {
  assert.equal(renderMarkup('one\ntwo\n\nthree'), '<p>one<br>two</p><p>three</p>');
});

test('bold markers inside inline code are left alone', () => {
  assert.equal(renderMarkup('`**x**`'), '<p><code>**x**</code></p>');
});
