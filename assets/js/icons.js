// Inline SVG icons, stroked with currentColor.
// Result marks carry pathLength="1" so CSS can draw them in with a dash offset.
const svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  today: svg('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4"/><path d="m9 15 2 2 4-4"/>'),
  progress: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  settings: svg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  check: svg('<path pathLength="1" d="m5 12.5 4.5 4.5L19 7.5"/>'),
  cross: svg('<path pathLength="1" d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  minus: svg('<path pathLength="1" d="M6 12h12"/>'),
};
