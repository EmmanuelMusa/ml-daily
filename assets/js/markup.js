// Tiny markup renderer for question text.
// Supports: blank-line paragraphs, single newlines as <br>, ``` fenced code,
// `inline code`, **bold**, and "- " list lines. Everything is escaped first.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

function inline(text) {
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`\n]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function renderBlock(lines) {
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const isList = lines[i].startsWith('- ');
    const group = [];
    while (i < lines.length && lines[i].startsWith('- ') === isList) group.push(lines[i++]);
    html += isList
      ? `<ul>${group.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`
      : `<p>${group.map(inline).join('<br>')}</p>`;
  }
  return html;
}

export function renderMarkup(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let block = [];
  const flush = () => {
    if (block.length) html += renderBlock(block);
    block = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('```')) {
      flush();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) code.push(lines[i++]);
      html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`;
    } else if (line.trim() === '') {
      flush();
    } else {
      block.push(line);
    }
  }
  flush();
  return html;
}
