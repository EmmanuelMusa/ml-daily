// Answer parsing and grading. Rules mirror tools/build.py.

const NUM = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

export function normalizeFill(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .trim();
}

const GROUPED = /^[+-]?\d{1,3}(,\d{3})+(\.\d*)?%?$/;

export function parseNumber(s) {
  let t = String(s ?? '').replace(/\s/g, '');
  if (t.includes(',')) {
    if (!GROUPED.test(t)) return null; // a decimal comma or stray comma, refuse rather than misread
    t = t.replace(/,/g, '');
  }
  if (t.endsWith('%')) t = t.slice(0, -1);
  if (!t) return null;
  const parts = t.split('/');
  if (parts.length > 2 || !parts.every((p) => NUM.test(p))) return null;
  if (parts.length === 2) {
    const b = Number(parts[1]);
    return b === 0 ? null : Number(parts[0]) / b;
  }
  return Number(t);
}

export function hasResponse(q, r) {
  switch (q.format) {
    case 'mcq': return Number.isInteger(r);
    case 'multi': return Array.isArray(r) && r.length > 0;
    case 'fill': return normalizeFill(r) !== '';
    case 'numeric': return parseNumber(r) !== null;
    case 'open': return r === 'got' || r === 'partly' || r === 'missed';
    default: return false;
  }
}

export function grade(q, r) {
  if (!hasResponse(q, r)) return false;
  switch (q.format) {
    case 'mcq': return r === q.answer;
    case 'multi': {
      const want = new Set(q.answer);
      const got = new Set(r);
      return got.size === want.size && [...got].every((x) => want.has(x));
    }
    case 'fill':
      return [q.answer, ...(q.accept ?? [])].map(normalizeFill).includes(normalizeFill(r));
    case 'numeric':
      return Math.abs(parseNumber(r) - q.answer) <= q.tolerance + 1e-12;
    case 'open': return r === 'got';
    default: return false;
  }
}

function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A fixed shuffle of option positions for one question.
export function optionOrder(id, n) {
  const rand = mulberry32(fnv1a(String(id)));
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
