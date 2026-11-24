// Glossary search. The index is built once when the glossary loads, so a
// keystroke only compares prepared strings.
import { normalizeFill } from './grade.js';

export function buildSearchIndex(list) {
  return list.map((c) => ({
    c,
    names: [c.name, ...(c.aka ?? [])].map(normalizeFill).join(' | '),
    summary: normalizeFill(c.summary ?? ''),
  }));
}

// Concepts whose name or other names match come first. Concepts that match
// only in their one line summary follow, so a search for an idea still finds
// the terms that explain it.
export function searchGlossary(index, query) {
  const q = normalizeFill(query);
  if (!q) return { byName: index.map((e) => e.c), bySummary: [] };
  const byName = [];
  const bySummary = [];
  for (const e of index) {
    if (e.names.includes(q)) byName.push(e.c);
    else if (e.summary.includes(q)) bySummary.push(e.c);
  }
  return { byName, bySummary };
}
