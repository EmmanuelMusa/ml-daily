// Small checks on the state of the question on screen.

// True when the person has started or finished answering the current question,
// so a day change must not swap the screen out from under them.
export function isMidAnswer(ui) {
  if (ui.checked || ui.revealed) return true;
  if (ui.notes && ui.notes.trim() !== '') return true;
  const r = ui.response;
  if (Array.isArray(r)) return r.length > 0;
  if (typeof r === 'string') return r.trim() !== '';
  return r !== null && r !== undefined;
}
