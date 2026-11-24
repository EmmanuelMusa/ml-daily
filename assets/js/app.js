// ML Daily: views and event wiring. Logic lives in the other modules.
import { renderMarkup, escapeHtml } from './markup.js';
import { grade, hasResponse, optionOrder } from './grade.js';
import { dayKey, ensureToday, dealMore, nextNew, recordResult, overrideResult, stats, emptyProgress } from './schedule.js';
import { loadProgress, saveProgress, pruneUnknown } from './store.js';
import { ICONS } from './icons.js?v=7';
import { isMidAnswer } from './session.js';
import { makeLookup, savedItems } from './saved.js';
import { buildSearchIndex } from './search.js?v=7';
import { conceptChipsHtml, renderConcept, renderConcepts, renderProgress, renderSettings } from './pages.js?v=7';

const main = document.getElementById('main');
const dayLabel = document.getElementById('day-label');
const sidePanel = document.getElementById('side-panel');
const announcer = document.getElementById('announce');

const FORMAT = {
  mcq: 'Multiple choice',
  multi: 'Select all that apply',
  fill: 'Fill in the blank',
  numeric: 'Work it out',
  open: 'Explain',
};
const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const KIND = { review: 'Review', new: 'New', practice: 'Redo' };

const S = {
  bank: null,
  byId: new Map(),
  ids: [],
  titles: {},
  progress: emptyProgress(),
  persistent: true,
  view: 'today',
  ui: freshUi(),
  fx: null, // one-shot motion cue for the next render: answer, override, reveal, enter, page
  glossary: null, // { list, byId, lookup, usage } once loaded
  cameFromQuestion: false, // a concept card opened from the answer screen
  conceptQuery: '',
};

// Shared context for the views in pages.js.
const ctx = {
  S,
  main,
  ICONS,
  icon: (name) => icon(name),
  today: () => today(),
  save: () => save(),
  applyTheme: (t) => applyTheme(t),
  announce: (text) => announce(text),
  replaceProgress(p) {
    S.progress = p;
    S.ui = freshUi();
    applyTheme(S.progress.settings.theme === 'dark' ? 'dark' : 'light');
    rollover();
    save();
    setDayLabel();
  },
  resetProgress() {
    const theme = S.progress.settings.theme;
    S.progress = emptyProgress();
    S.progress.settings.theme = theme;
    S.ui = freshUi();
    rollover();
    save();
    setDayLabel();
  },
};

function freshUi() {
  return { id: null, response: null, checked: false, revealed: false, ok: null, notes: '', flash: '' };
}

const today = () => dayKey(new Date());
const icon = (name) => `<span class="ico">${ICONS[name]}</span>`;

// Reads and clears the motion cue, and puts it on <main> so CSS can play the
// matching entrance once. Re-renders without a cue get no motion.
function takeFx() {
  const fx = S.fx;
  S.fx = null;
  main.className = fx ? `fx-${fx}` : '';
  return fx;
}

function save() {
  if (S.persistent) S.persistent = saveProgress(S.progress);
  document.getElementById('notice').hidden = S.persistent;
  renderSide();
}

// One live region that stays in the page. Views put their visible messages
// in place and also pass them here, so screen readers hear each one once.
let announceTimer = 0;
function announce(text) {
  clearTimeout(announceTimer);
  announcer.textContent = '';
  if (text) announceTimer = setTimeout(() => { announcer.textContent = text; }, 60);
}

// Builds the new day's set, unless the person is partway through a question.
function rollover() {
  const t = today();
  if (S.progress.today?.day === t) return false;
  if (S.progress.today && isMidAnswer(S.ui)) return false;
  ensureToday(S.progress, S.ids, t);
  S.ui = freshUi();
  save();
  return true;
}

function setDayLabel() {
  dayLabel.textContent = `Day ${stats(S.progress, S.bank, today()).day}`;
  renderSide();
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Desktop sidebar: today's set and a few running figures. CSS hides it on
// narrow screens, where the same figures live on Progress.
function renderSide() {
  if (!S.bank || !S.progress.today) return;
  const st = stats(S.progress, S.bank, today());
  const items = S.progress.today.items.filter((it) => S.byId.has(it.id));
  const done = items.filter((it) => it.result !== null).length;
  const cells = items.map((it) => {
    const cls = it.result === true ? 'right' : it.result === false ? 'wrong' : '';
    return `<i class="${cls}"></i>`;
  }).join('');
  const saved = savedItems(S.progress).length;
  const row = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  sidePanel.innerHTML = `<p class="sp-title">Today</p>
    <p class="sp-set">${items.length ? `${done} of ${items.length} answered` : 'Nothing due'}</p>
    ${items.length ? `<p class="sp-cells" aria-hidden="true">${cells}</p>` : ''}
    <dl class="sp-figs">
      ${row('Streak', plural(st.streak, 'day'))}
      ${row('Accuracy', st.answered ? `${Math.round(st.accuracy * 100)}%` : 'None yet')}
      ${row('Due tomorrow', st.dueTomorrow)}
      ${row('Saved concepts', saved)}
    </dl>`;
}

// Plain text of a prompt for the summary list. CSS clamps it to two lines,
// so the cut here only keeps very long prompts out of the DOM.
function snippet(text) {
  const plain = String(text).replace(/```[\s\S]*?```/g, ' ').replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 240 ? `${plain.slice(0, 238).trimEnd()}...` : plain;
}

// ------------------------------------------------------------------ today

function renderToday() {
  rollover();
  const items = S.progress.today.items;
  let current = S.ui.checked ? items.find((it) => it.id === S.ui.id) : null;
  if (!current) {
    current = items.find((it) => it.result === null && S.byId.has(it.id)) ?? null;
    if (current && current.id !== S.ui.id) S.ui = freshUi();
    if (current) S.ui.id = current.id;
  }
  setDayLabel();
  if (!current) return renderSummary();
  renderQuestion(S.byId.get(current.id), current, items);
}

function railHtml(items, current) {
  const reviews = items.filter((it) => it.kind === 'review').length;
  const fresh = items.length - reviews;
  const parts = [];
  if (reviews) parts.push(`${reviews} review${reviews === 1 ? '' : 's'}`);
  if (fresh) parts.push(`${fresh} ${items.some((it) => it.kind === 'practice') ? 'more' : 'new'}`);
  const pos = current ? `${items.indexOf(current) + 1} of ${items.length}` : 'Done';
  const cells = items.map((it, n) => {
    const cls = [it.kind === 'review' ? 'review' : ''];
    if (it === current) cls.push('cur');
    if (it.result === true) cls.push('right');
    else if (it.result === false) cls.push('wrong');
    else if (it === current) cls.push('now');
    const state = it.result === true ? 'right' : it.result === false ? 'wrong' : it === current ? 'current' : 'not answered';
    const glyph = it.result === true ? ICONS.check : it.result === false ? ICONS.cross : '';
    return `<li class="${cls.join(' ').trim()}" style="--i:${n}" title="${KIND[it.kind]}, ${state}">${glyph}<span class="sr">Question ${n + 1}, ${KIND[it.kind].toLowerCase()}, ${state}</span></li>`;
  });
  return `<div class="rail-wrap">
    <div class="rail-label"><span>Today: ${parts.join(' and ')}</span><span>${pos}</span></div>
    <ol class="rail" aria-label="Today's questions">${cells.join('')}</ol>
  </div>`;
}

function pipsHtml(level) {
  return `<span class="pips" aria-hidden="true">${[1, 2, 3].map((n) => `<i class="${n <= level ? 'on' : ''}"></i>`).join('')}</span>`;
}

// Desktop only: what the format expects and the keys that work. CSS hides it
// on narrow screens. After Check the explanation takes its place.
const HOW = {
  mcq: 'Pick one option, then check it.',
  multi: 'Pick every option that applies. It counts as right only when the picks match exactly.',
  fill: 'Type a word or short phrase. Capitals, hyphens and extra spaces do not matter.',
  numeric: 'Type a number. Forms such as 0.5, .5, 1,000, 75% and 3/4 all work.',
  open: 'Write an answer if you like, then compare it with the model answer and mark how you did.',
};

function helpHtml(q) {
  const keys = [];
  if (q.format === 'mcq' || q.format === 'multi') keys.push(`<li><span><kbd>1</kbd> to <kbd>${q.options.length}</kbd></span><span>${q.format === 'multi' ? 'Pick or unpick' : 'Pick'} an option</span></li>`);
  if (q.format === 'open') keys.push('<li><span><kbd>Enter</kbd></span><span>Show the model answer</span></li>');
  else keys.push('<li><span><kbd>Enter</kbd></span><span>Check, then go to the next question</span></li>');
  return `<aside class="q-help" aria-label="How to answer">
    <p class="qh-title">${FORMAT[q.format]}</p>
    <p class="qh-how">${HOW[q.format]}</p>
    <ul class="qh-keys">${keys.join('')}</ul>
    <p class="qh-wait">The explanation appears here once you check.</p>
  </aside>`;
}

function optionsHtml(q) {
  const order = optionOrder(q.id, q.options.length);
  const multi = q.format === 'multi';
  const key = new Set(multi ? q.answer : [q.answer]);
  const picked = new Set(multi ? (S.ui.response ?? []) : S.ui.response === null ? [] : [S.ui.response]);
  const rows = order.map((orig, n) => {
    const cls = ['opt'];
    if (multi) cls.push('multi');
    if (picked.has(orig)) cls.push('picked');
    let flag = '';
    if (S.ui.checked) {
      cls.push('locked');
      if (key.has(orig)) {
        cls.push('is-key');
        flag = `<span class="flag" aria-label="Correct answer">${ICONS.check}</span>`;
      } else if (picked.has(orig)) {
        cls.push('is-wrong');
        flag = `<span class="flag" aria-label="Your pick, wrong">${ICONS.cross}</span>`;
      }
    }
    const type = multi ? 'checkbox' : 'radio';
    return `<li><label class="${cls.join(' ')}">
      <input type="${type}" name="opt" value="${orig}" ${picked.has(orig) ? 'checked' : ''} ${S.ui.checked ? 'disabled' : ''}>
      <span class="mark"></span><span class="txt">${renderMarkup(q.options[orig])}</span>${flag}${S.ui.checked ? '' : `<kbd class="opt-key" aria-hidden="true">${n + 1}</kbd>`}
    </label></li>`;
  });
  return `<ul class="options" role="${multi ? 'group' : 'radiogroup'}" aria-label="Options">${rows.join('')}</ul>`;
}

function answerHtml(q) {
  if (q.format === 'mcq' || q.format === 'multi') return optionsHtml(q);
  if (q.format === 'fill' || q.format === 'numeric') {
    const v = escapeHtml(S.ui.response ?? '');
    const state = S.ui.checked ? (S.ui.ok ? 'right' : 'wrong') : '';
    const extra = q.format === 'numeric'
      ? 'inputmode="decimal" autocomplete="off"'
      : 'autocomplete="off" autocapitalize="off" spellcheck="false"';
    return `<div class="field">
      <label for="answer">Your answer</label>
      <input id="answer" type="text" ${extra} value="${v}" class="${state}" ${S.ui.checked ? 'readonly' : ''}>
    </div>`;
  }
  // open
  const notes = `<div class="field">
      <label for="notes">Your answer (optional, only you see it)</label>
      <textarea id="notes" ${S.ui.revealed ? 'readonly' : ''}>${escapeHtml(S.ui.notes)}</textarea>
    </div>`;
  if (!S.ui.revealed) return notes;
  return `${notes}<div class="model">
      <h3>Model answer</h3>
      <div class="explain">${renderMarkup(q.answer)}</div>
      <h3>Key points</h3>
      <ul>${q.points.map((p) => `<li>${renderMarkup(p).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>
    </div>`;
}

function keyLine(q) {
  if (q.format === 'fill') return `<p class="key-line">Answer: <strong>${escapeHtml(q.answer)}</strong></p>`;
  if (q.format === 'numeric') return `<p class="key-line">Answer: <strong>${escapeHtml(String(q.answer))}</strong></p>`;
  return '';
}

function feedbackHtml(q) {
  const ok = S.ui.ok;
  const override = !ok && (q.format === 'fill' || q.format === 'numeric')
    ? '<button type="button" class="linkish" data-act="override">I was right, count it</button>'
    : '';
  const verdict = q.format === 'open'
    ? (ok ? 'Marked as got it' : 'Marked for review')
    : (ok ? 'Right' : 'Not quite');
  return `<section class="feedback" aria-labelledby="verdict">
    <p class="verdict ${ok ? 'right' : 'wrong'}" id="verdict" tabindex="-1"><span class="badge">${icon(ok ? 'check' : q.format === 'open' ? 'minus' : 'cross')}</span>${verdict}</p>
    ${keyLine(q)}
    ${override}
    <div class="explain">${renderMarkup(q.explanation)}</div>
    <div class="deeper"><h3>Going deeper</h3>${renderMarkup(q.deeper)}</div>
    ${conceptChipsHtml(ctx, q)}
  </section>`;
}

function actionsHtml(q) {
  if (S.ui.checked) return '<div class="actions"><button type="button" class="btn" data-act="next">Next</button></div>';
  if (q.format === 'open') {
    if (!S.ui.revealed) return '<div class="actions"><button type="button" class="btn" data-act="reveal">Show model answer</button></div>';
    return `<div class="actions selfgrade" role="group" aria-label="How did you do?">
      <button type="button" class="btn" data-act="self" data-val="got">Got it</button>
      <button type="button" class="btn quiet" data-act="self" data-val="partly">Partly</button>
      <button type="button" class="btn quiet" data-act="self" data-val="missed">Missed</button>
    </div>`;
  }
  const ready = hasResponse(q, S.ui.response);
  return `<div class="actions"><button type="button" class="btn" data-act="check" ${ready ? '' : 'disabled'}>Check</button></div>`;
}

function renderQuestion(q, item, items) {
  const review = item.kind === 'review' ? '<span class="tag-review">Review</span>' : '';
  const redo = item.kind === 'practice' ? '<span class="tag-review">Redo</span>' : '';
  takeFx();
  main.innerHTML = `${railHtml(items, item)}
    <article class="question${S.ui.checked ? ' is-answered' : ''}" aria-labelledby="prompt">
      <div class="meta">
        <span class="topic">${escapeHtml(S.titles[q.topic] ?? q.topic)}</span>
        <span>${pipsHtml(q.difficulty)}${LEVEL[q.difficulty]}</span>
        <span>${FORMAT[q.format]}</span>
        ${review}${redo}
      </div>
      <div class="prompt" id="prompt" tabindex="-1">${renderMarkup(q.prompt)}</div>
      ${answerHtml(q)}
      ${S.ui.checked ? feedbackHtml(q) : helpHtml(q)}
      ${actionsHtml(q)}
    </article>`;
  bindQuestion(q);
}

function refreshCheck(q) {
  const btn = main.querySelector('[data-act="check"]');
  if (btn) btn.disabled = !hasResponse(q, S.ui.response);
}

function bindQuestion(q) {
  main.querySelectorAll('input[name="opt"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (q.format === 'mcq') {
        S.ui.response = Number(input.value);
      } else {
        S.ui.response = [...main.querySelectorAll('input[name="opt"]:checked')].map((i) => Number(i.value));
      }
      main.querySelectorAll('.opt').forEach((label) => {
        label.classList.toggle('picked', label.querySelector('input').checked);
      });
      refreshCheck(q);
    });
  });
  const answer = main.querySelector('#answer');
  if (answer && !S.ui.checked) {
    answer.addEventListener('input', () => {
      S.ui.response = answer.value;
      refreshCheck(q);
    });
    answer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && hasResponse(q, S.ui.response)) check(q);
    });
  }
  const notes = main.querySelector('#notes');
  if (notes && !S.ui.revealed) notes.addEventListener('input', () => { S.ui.notes = notes.value; });

  main.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'check') check(q);
      if (act === 'reveal') {
        S.ui.revealed = true;
        S.fx = 'reveal';
        renderToday();
        main.querySelector('.model h3')?.scrollIntoView({ block: 'nearest' });
      }
      if (act === 'self') {
        S.ui.response = el.dataset.val;
        check(q);
      }
      if (act === 'override') {
        overrideResult(S.progress, q.id, today());
        S.ui.ok = true;
        save();
        S.fx = 'override';
        renderToday();
        main.querySelector('#verdict')?.focus();
      }
      if (act === 'next') next();
    });
  });
}

function check(q) {
  if (S.ui.checked || !hasResponse(q, S.ui.response)) return;
  const ok = grade(q, S.ui.response);
  recordResult(S.progress, q.id, ok, today());
  S.ui.checked = true;
  S.ui.ok = ok;
  save();
  S.fx = 'answer';
  renderToday();
  main.querySelector('#verdict')?.focus();
}

function next() {
  S.ui = freshUi();
  rollover();
  S.fx = 'enter';
  renderToday();
  window.scrollTo(0, 0);
  (main.querySelector('#prompt') ?? main.querySelector('h2'))?.focus();
}

// ------------------------------------------------------------------ summary

function renderSummary() {
  const items = S.progress.today.items.filter((it) => S.byId.has(it.id));
  const answered = items.filter((it) => it.result !== null);
  const right = answered.filter((it) => it.result).length;
  const bankLeft = nextNew(S.progress, S.ids, 1).length > 0;
  const st = stats(S.progress, S.bank, today());

  const title = items.length ? 'Today\'s set is done' : 'Nothing due today';
  const lede = items.length
    ? `<p class="score"><span class="score-num">${right}</span> <span class="score-of">of ${answered.length} right today</span></p>`
    : '<p class="lede">No reviews are due and no new questions are left.</p>';
  const list = answered.map((it) => {
    const q = S.byId.get(it.id);
    return `<li>
      <span class="${it.result ? 'ok' : 'no'}">${icon(it.result ? 'check' : 'cross')}<span class="sr">${it.result ? 'Right' : 'Missed'}</span></span>
      <span class="what"><span class="clip">${escapeHtml(snippet(q.prompt))}</span><span class="sub">${escapeHtml(S.titles[q.topic] ?? q.topic)}, ${KIND[it.kind].toLowerCase()}</span></span>
    </li>`;
  });
  const canRedo = !bankLeft && dealMore(structuredClone(S.progress), S.ids, today()) > 0;
  let button = '';
  let note = '';
  if (bankLeft) {
    button = '<button type="button" class="btn" data-act="more">Do 3 more</button>';
  } else if (canRedo) {
    button = '<button type="button" class="btn" data-act="more">Redo past misses</button>';
    note = '<p class="lede">You have seen every question. You can redo ones you missed before.</p>';
  } else {
    note = '<p class="lede">You have seen every question. Your misses come back here when they are due for review.</p>';
  }
  const due = st.dueTomorrow ? `<p class="lede">${st.dueTomorrow} review${st.dueTomorrow === 1 ? '' : 's'} due tomorrow.</p>` : '';

  // Arriving from the last Next replays the rail once. Other visits only fade in.
  if (takeFx() === 'enter') main.className = 'fx-done';
  main.innerHTML = `${items.length ? railHtml(S.progress.today.items, null) : ''}
    <section class="summary${answered.length ? ' has-list' : ''}">
      <h2 tabindex="-1">${title}</h2>
      ${lede}
      ${answered.length ? `<ul class="done-list" aria-label="Today's answers">${list.join('')}</ul>` : ''}
      ${note}
      ${due}
      ${button ? `<div class="actions">${button}</div>` : ''}
      <p class="msg" id="more-msg">${escapeHtml(S.ui.flash)}</p>
    </section>`;
  announce(S.ui.flash);
  S.ui.flash = '';
  main.querySelector('[data-act="more"]')?.addEventListener('click', () => {
    const added = dealMore(S.progress, S.ids, today());
    save();
    if (!added) {
      S.ui.flash = 'You have seen every question. Nothing to redo right now.';
      renderSummary();
      return;
    }
    next();
  });
}

// ------------------------------------------------------------------ theme

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#0f1729' : '#ffffff');
}

// ------------------------------------------------------------------ routing

const VIEWS = ['today', 'concepts', 'progress', 'settings'];

function parseHash() {
  const raw = (location.hash || '#today').slice(1);
  if (raw.startsWith('concept/')) {
    let id = raw.slice('concept/'.length);
    try { id = decodeURIComponent(id); } catch { /* keep raw */ }
    return { view: 'concept', id };
  }
  return { view: VIEWS.includes(raw) ? raw : null };
}

function route(atBoot = false) {
  let { view, id } = parseHash();
  if (!view) {
    if (!atBoot) return; // a hash such as #main from the skip link, not a view
    view = 'today';
  }
  const tab = view === 'concept' ? 'concepts' : view;
  S.view = view;
  document.querySelectorAll('.tabs a').forEach((a) => {
    if (a.dataset.view === tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  setDayLabel();
  if ((view === 'concept' || view === 'concepts') && !S.glossary && !S.glossaryFailed) {
    main.innerHTML = '<p class="loading">Loading concepts</p>';
    ensureGlossary().then(() => { if (S.view === view) route(); });
    return;
  }
  if (view !== 'today') takeFx();
  if (view === 'concept') renderConcept(ctx, id);
  else if (view === 'concepts') renderConcepts(ctx);
  else if (view === 'progress') renderProgress(ctx);
  else if (view === 'settings') renderSettings(ctx);
  else renderToday();
}

function buildGlossary(data) {
  const list = data.concepts ?? [];
  const usage = new Map();
  for (const q of S.bank.questions) for (const c of q.concepts ?? []) usage.set(c, (usage.get(c) ?? 0) + 1);
  return { list, byId: new Map(list.map((c) => [c.id, c])), lookup: makeLookup(list), usage, index: buildSearchIndex(list) };
}

// The glossary is fetched after the first screen is up, or straight away when a concept view needs it.
let glossaryLoad = null;
function ensureGlossary() {
  glossaryLoad ??= fetch('data/glossary.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data) => {
      S.glossary = buildGlossary(data);
      // An answer screen that is already showing gains its concept buttons.
      if (S.view === 'today' && S.ui.checked) renderToday();
    })
    .catch(() => { S.glossaryFailed = true; });
  return glossaryLoad;
}

// Remembers how many concept cards deep the person is, so "Back to the question" can return in one step.
function trackConceptVisit(prevView) {
  const st = history.state;
  if (st && typeof st.conceptDepth === 'number') {
    S.conceptDepth = st.conceptDepth;
    S.cameFromQuestion = Boolean(st.fromQuestion);
    return;
  }
  const fromQuestion = prevView === 'today' && S.ui.checked;
  const chained = prevView === 'concept';
  S.cameFromQuestion = fromQuestion || (chained && S.cameFromQuestion);
  S.conceptDepth = chained ? (S.conceptDepth || 0) + 1 : 1;
  history.replaceState({ conceptDepth: S.conceptDepth, fromQuestion: S.cameFromQuestion }, '');
}

// Keys on Today: a number picks an option, Enter presses the main button.
// They stay out of the way while the person types in a box, holds a modifier
// or has focus on a button or link, which Enter already presses.
function onKey(e) {
  if (S.view !== 'today' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target;
  if (t instanceof HTMLElement && (t.isContentEditable || t.matches('textarea, input[type="text"], input[type="search"], button, a, select'))) return;
  if (/^[1-9]$/.test(e.key)) {
    const input = main.querySelectorAll('input[name="opt"]:not(:disabled)')[Number(e.key) - 1];
    if (!input) return;
    e.preventDefault();
    input.click();
    input.focus({ preventScroll: true });
    return;
  }
  if (e.key === 'Enter') {
    const btn = main.querySelector('[data-act="check"]:not(:disabled), [data-act="next"], [data-act="reveal"], [data-act="more"]');
    if (!btn) return;
    e.preventDefault();
    btn.click();
  }
}

async function boot() {
  document.querySelectorAll('.ico[data-icon]').forEach((el) => { el.innerHTML = ICONS[el.dataset.icon]; });
  try {
    const res = await fetch('data/bank.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    S.bank = await res.json();
  } catch {
    main.innerHTML = '<p class="empty">The questions could not be loaded. Check your connection and reload the page.</p>';
    return;
  }
  S.byId = new Map(S.bank.questions.map((q) => [q.id, q]));
  S.ids = S.bank.questions.map((q) => q.id);
  S.titles = Object.fromEntries(S.bank.topics.map((t) => [t.key, t.title]));
  const loaded = loadProgress();
  S.progress = pruneUnknown(loaded.progress, S.ids);
  S.persistent = loaded.persistent;
  applyTheme(S.progress.settings.theme === 'dark' ? 'dark' : 'light');
  rollover();
  save();
  window.addEventListener('hashchange', () => {
    const prev = S.view;
    const next = parseHash();
    if (next.view === 'concept') trackConceptVisit(prev);
    else if (next.view) S.cameFromQuestion = false;
    if (!next.view) return;
    S.fx = 'page';
    route();
    if (prev === 'concept' && next.view === 'today' && S.ui.checked) {
      // Back from a concept card: return to the concept buttons, not the top of the question.
      const block = main.querySelector('.concepts-block');
      if (block) {
        block.setAttribute('tabindex', '-1');
        block.scrollIntoView({ block: 'center' });
        block.focus({ preventScroll: true });
        return;
      }
    }
    main.querySelector('h2, #prompt')?.focus();
  });
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && rollover() && S.view === 'today') renderToday();
  });
  S.fx = 'page';
  if (parseHash().view === 'concept') trackConceptVisit(null);
  route(true);
  const later = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 800));
  later(() => ensureGlossary());
}

boot();
