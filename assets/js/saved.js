// Concepts and terms the person saves to read up on later.
// Items live in progress.saved as { concept, from, day } or { term, from, day }.
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

export function savedItems(p) {
  return [...(p.saved ?? [])].reverse();
}

export function isSaved(p, conceptId) {
  return (p.saved ?? []).some((s) => s.concept === conceptId);
}

export function saveConcept(p, conceptId, from, day) {
  p.saved ??= [];
  if (!isSaved(p, conceptId)) p.saved.push({ concept: conceptId, from: from ?? null, day });
  return p;
}

// Saves typed text. A glossary match saves the concept. Returns what was saved, or null.
export function saveTerm(p, text, from, day, lookup) {
  const term = String(text ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_TERM);
  if (!term) return null;
  const id = lookup ? lookup(term) : null;
  if (id) {
    const had = isSaved(p, id);
    saveConcept(p, id, from, day);
    return had ? null : { concept: id };
  }
  p.saved ??= [];
  if (p.saved.some((s) => s.term && key(s.term) === key(term))) return null;
  p.saved.push({ term, from: from ?? null, day });
  return { term };
}

export function removeSaved(p, item) {
  if (!p.saved) return p;
  p.saved = p.saved.filter((s) =>
    item.concept ? s.concept !== item.concept : !(s.term && key(s.term) === key(item.term)));
  return p;
}
