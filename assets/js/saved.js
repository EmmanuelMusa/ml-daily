// Concepts and terms the person saves to read up on later.
// Items live in progress.saved as { concept, from, day, at } or { term, from, day, at }.
// at is when it was saved, in milliseconds. Removals are kept in progress.unsaved
// as { key: when } so a removal on one device also wins on the others.
import { normalizeFill } from './grade.js';

const MAX_TERM = 80;
const key = (s) => normalizeFill(s);

// Returns a function that maps typed text to a glossary concept id, or null.
export function makeLookup(concepts) {
  const map = new Map();
  for (const c of concepts) {
    for (const name of [c.id, c.name, ...(c.aka ?? [])]) map.set(key(name), c.id);
  }
  return (text) => map.get(key(text)) ?? null;
}

// One key per saved thing, the same however the term was typed.
export function savedKey(item) {
  return item.concept !== undefined ? `c:${item.concept}` : `t:${key(item.term)}`;
}

function stamp(p, entry, at) {
  if (at === undefined) return entry;
  entry.at = at;
  if (p.unsaved) delete p.unsaved[savedKey(entry)];
  return entry;
}

export function savedItems(p) {
  return [...(p.saved ?? [])].reverse();
}

export function isSaved(p, conceptId) {
  return (p.saved ?? []).some((s) => s.concept === conceptId);
}

export function saveConcept(p, conceptId, from, day, at) {
  p.saved ??= [];
  if (!isSaved(p, conceptId)) p.saved.push(stamp(p, { concept: conceptId, from: from ?? null, day }, at));
  return p;
}

// Saves typed text. A glossary match saves the concept. Returns what was saved, or null.
export function saveTerm(p, text, from, day, lookup, at) {
  const term = String(text ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_TERM);
  if (!term) return null;
  const id = lookup ? lookup(term) : null;
  if (id) {
    const had = isSaved(p, id);
    saveConcept(p, id, from, day, at);
    return had ? null : { concept: id };
  }
  p.saved ??= [];
  if (p.saved.some((s) => s.term && key(s.term) === key(term))) return null;
  p.saved.push(stamp(p, { term, from: from ?? null, day }, at));
  return { term };
}

export function removeSaved(p, item, at) {
  if (!p.saved) return p;
  if (at !== undefined) (p.unsaved ??= {})[savedKey(item)] = at;
  p.saved = p.saved.filter((s) =>
    item.concept ? s.concept !== item.concept : !(s.term && key(s.term) === key(item.term)));
  return p;
}
