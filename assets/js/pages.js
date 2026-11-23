// Concepts, concept card, Progress and Settings views.
// Each render function gets the shared app context:
//   { S, main, save, today, icon, ICONS, setDayLabel, afterProgressChange }
import { renderMarkup, escapeHtml } from './markup.js';
import { stats } from './schedule.js';
import { exportCode, importCode, pruneUnknown } from './store.js';
import { isSaved, saveConcept, saveTerm, removeSaved, savedItems } from './saved.js';
import { activityByDay, coverage, dueForecast, byDifficulty, topicMastery } from './insights.js';
import { normalizeFill } from './grade.js';
import { INTERVALS } from './schedule.js';

const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const pct = (r, n) => (n ? Math.round((100 * r) / n) : 0);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function shortDate(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function weekdayShort(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' });
}

// ------------------------------------------------------------------ concept chips (used on Today)

export function conceptChipsHtml(ctx, q) {
  const G = ctx.S.glossary;
  if (!G || !q.concepts?.length) return '';
  const chips = q.concepts.filter((id) => G.byId.has(id)).map((id) => {
    const c = G.byId.get(id);
    const saved = isSaved(ctx.S.progress, id);
    return `<li><a class="chip${saved ? ' saved' : ''}" href="#concept/${encodeURIComponent(id)}">${saved ? `<span class="chip-ico" aria-hidden="true">${ctx.ICONS.bookmarkFilled}</span>` : ''}${escapeHtml(c.name)}${saved ? '<span class="sr"> (saved)</span>' : ''}</a></li>`;
  });
  if (!chips.length) return '';
  return `<div class="concepts-block"><h3>Key concepts</h3><p class="hint">Open one to read more or save it for later.</p><ul class="chips">${chips.join('')}</ul></div>`;
}

// ------------------------------------------------------------------ concept card

export function renderConcept(ctx, id) {
  const { S, main } = ctx;
  const G = S.glossary;
  const c = G?.byId.get(id);
  const back = S.cameFromQuestion ? 'Back to the question' : 'All concepts';
  if (!c) {
    main.innerHTML = `<section class="page concept">
      <a class="back" href="#concepts">${ctx.icon('back')}All concepts</a>
      <h2 tabindex="-1">Not found</h2>
      <p class="lede">This concept is not in the glossary yet.</p></section>`;
    return;
  }
  const saved = isSaved(S.progress, id);
  const topic = S.titles[c.topic] ?? c.topic;
  const used = G.usage.get(id) ?? 0;
  const related = (c.related ?? []).filter((r) => G.byId.has(r))
    .map((r) => `<li><a class="chip" href="#concept/${encodeURIComponent(r)}">${escapeHtml(G.byId.get(r).name)}</a></li>`).join('');
  main.innerHTML = `<article class="page concept" aria-labelledby="concept-name">
    <a class="back" href="${S.cameFromQuestion ? '#today' : '#concepts'}" data-act="back">${ctx.icon('back')}${back}</a>
    <header class="concept-head">
      <p class="concept-topic">${escapeHtml(topic)}</p>
      <h2 id="concept-name" tabindex="-1">${escapeHtml(c.name)}</h2>
      ${c.aka?.length ? `<p class="aka">Also called ${c.aka.map(escapeHtml).join(', ')}</p>` : ''}
      <button type="button" class="btn ${saved ? '' : 'quiet'} save-btn" data-act="save-concept" aria-pressed="${saved}">
        ${ctx.icon(saved ? 'bookmarkFilled' : 'bookmark')}<span>${saved ? 'Saved' : 'Save for later'}</span></button>
    </header>
    <p class="concept-summary">${escapeHtml(c.summary)}</p>
    ${c.svg ? `<figure class="diagram">${c.svg}</figure>` : ''}
    <div class="explain">${renderMarkup(c.body)}</div>
    ${c.mixup ? `<div class="deeper mixup"><h3>Common mix-up</h3>${renderMarkup(c.mixup)}</div>` : ''}
    ${related ? `<h3 class="sub-head">Related</h3><ul class="chips">${related}</ul>` : ''}
    <p class="used">${used ? `Comes up in ${plural(used, 'question')} in the bank.` : 'Not used by a question yet.'}</p>
  </article>`;
  main.querySelector('[data-act="save-concept"]').addEventListener('click', () => {
    if (isSaved(S.progress, id)) removeSaved(S.progress, { concept: id });
    else saveConcept(S.progress, id, S.cameFromQuestion ? S.ui.id : null, ctx.today());
    ctx.save();
    renderConcept(ctx, id);
    main.querySelector('[data-act="save-concept"]').focus();
  });
  main.querySelector('[data-act="back"]').addEventListener('click', (e) => {
    if (S.cameFromQuestion || history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}

// ------------------------------------------------------------------ concepts tab

function glossaryListHtml(ctx, query) {
  const G = ctx.S.glossary;
  const q = normalizeFill(query);
  const groups = new Map();
  for (const c of G.list) {
    if (q) {
      const hay = [c.name, ...(c.aka ?? []), c.summary].map(normalizeFill).join(' | ');
      if (!hay.includes(q)) continue;
    }
    if (!groups.has(c.topic)) groups.set(c.topic, []);
    groups.get(c.topic).push(c);
  }
  if (!groups.size) return `<p class="empty">No concept matches "${escapeHtml(query)}". You can save it as your own term above.</p>`;
  return [...groups].map(([topic, list]) => `<section class="g-group">
      <h4>${escapeHtml(ctx.S.titles[topic] ?? topic)} <span class="count">${list.length}</span></h4>
      <ul class="g-list">${list.map((c) => `<li><a href="#concept/${encodeURIComponent(c.id)}">
        <span class="g-name">${escapeHtml(c.name)}${c.svg ? `<span class="g-fig" title="Has a diagram">${ctx.ICONS.diagram}</span>` : ''}${isSaved(ctx.S.progress, c.id) ? `<span class="g-saved" title="Saved">${ctx.ICONS.bookmarkFilled}</span>` : ''}</span>
        <span class="g-sum">${escapeHtml(c.summary)}</span></a></li>`).join('')}</ul>
    </section>`).join('');
}

function myListHtml(ctx) {
  const { S } = ctx;
  const items = savedItems(S.progress);
  if (!items.length) {
    return '<p class="empty">Nothing saved yet. After you check an answer, open a key concept and press Save for later, or type a term above.</p>';
  }
  return `<ul class="saved-list">${items.map((s) => {
    const from = s.from && S.byId.has(s.from) ? `From a ${S.titles[S.byId.get(s.from).topic] ?? ''} question, ` : '';
    const when = `${from}${shortDate(s.day)}`;
    if (s.concept) {
      const c = S.glossary?.byId.get(s.concept);
      const name = c ? c.name : s.concept;
      return `<li><a class="s-main" href="#concept/${encodeURIComponent(s.concept)}"><span class="s-name">${escapeHtml(name)}</span>
        <span class="s-sum">${escapeHtml(c?.summary ?? '')}</span><span class="s-meta">${escapeHtml(when)}</span></a>
        <button type="button" class="icon-btn" data-remove-concept="${escapeHtml(s.concept)}" aria-label="Remove ${escapeHtml(name)}">${ctx.ICONS.cross}</button></li>`;
    }
    return `<li><div class="s-main"><span class="s-name">${escapeHtml(s.term)}</span>
      <span class="s-sum">Your own term. Not in the glossary yet.</span><span class="s-meta">${escapeHtml(when)}</span></div>
      <button type="button" class="icon-btn" data-remove-term="${escapeHtml(s.term)}" aria-label="Remove ${escapeHtml(s.term)}">${ctx.ICONS.cross}</button></li>`;
  }).join('')}</ul>`;
}

export function renderConcepts(ctx, state = {}) {
  const { S, main } = ctx;
  const G = S.glossary;
  if (!G) {
    main.innerHTML = '<section class="page"><h2 tabindex="-1">Concepts</h2><p class="empty">The glossary could not be loaded. Check your connection and reload the page.</p></section>';
    return;
  }
  const query = state.query ?? S.conceptQuery ?? '';
  const count = savedItems(S.progress).length;
  main.innerHTML = `<section class="page concepts-page">
    <h2 tabindex="-1">Concepts</h2>
    <p class="lede">${G.list.length} concepts explained in plain words. Save the ones you want to read up on.</p>
    <form class="save-term" autocomplete="off">
      <label for="term">Save a word or idea</label>
      <div class="inline">
        <input id="term" type="text" maxlength="80" placeholder="For example, Platt scaling" spellcheck="false">
        <button type="submit" class="btn">Save</button>
      </div>
      <p class="msg ${state.msgGood ? 'good' : ''}" role="status">${escapeHtml(state.msg ?? '')}</p>
    </form>
    <h3 class="sub-head">My list <span class="count">${count}</span></h3>
    ${myListHtml(ctx)}
    <h3 class="sub-head">Glossary</h3>
    <div class="field search"><label for="g-search" class="sr">Search the glossary</label>
      <span class="search-ico" aria-hidden="true">${ctx.ICONS.search}</span>
      <input id="g-search" type="search" placeholder="Search concepts" value="${escapeHtml(query)}" spellcheck="false" autocomplete="off"></div>
    <div id="g-results">${glossaryListHtml(ctx, query)}</div>
  </section>`;

  main.querySelector('.save-term').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = main.querySelector('#term');
    const result = saveTerm(S.progress, input.value, null, ctx.today(), G.lookup);
    let msg;
    if (!input.value.trim()) msg = 'Type a word or idea first.';
    else if (!result) msg = 'That is already in your list.';
    else if (result.concept) msg = `Saved. ${G.byId.get(result.concept).name} is in the glossary, so you can read it now.`;
    else msg = 'Saved to your list.';
    ctx.save();
    renderConcepts(ctx, { msg, msgGood: Boolean(result), query: main.querySelector('#g-search').value });
    main.querySelector('#term').focus();
  });
  main.querySelectorAll('[data-remove-concept]').forEach((b) => b.addEventListener('click', () => {
    removeSaved(S.progress, { concept: b.dataset.removeConcept });
    ctx.save();
    renderConcepts(ctx, { query: main.querySelector('#g-search').value });
  }));
  main.querySelectorAll('[data-remove-term]').forEach((b) => b.addEventListener('click', () => {
    removeSaved(S.progress, { term: b.dataset.removeTerm });
    ctx.save();
    renderConcepts(ctx, { query: main.querySelector('#g-search').value });
  }));
  const search = main.querySelector('#g-search');
  search.addEventListener('input', () => {
    S.conceptQuery = search.value;
    main.querySelector('#g-results').innerHTML = glossaryListHtml(ctx, search.value);
  });
}

// ------------------------------------------------------------------ progress

export function renderProgress(ctx) {
  const { S, main } = ctx;
  const t = ctx.today();
  const st = stats(S.progress, S.bank, t);
  const cov = coverage(S.progress, S.bank);
  const days = activityByDay(S.progress, S.bank, t, 12);
  const forecast = dueForecast(S.progress, S.bank, t, 7);
  const diff = byDifficulty(S.progress, S.bank);
  const mastery = topicMastery(S.progress, S.bank);
  const activeDays = days.filter((d) => d.answered).length;

  const level = (n) => (n === 0 ? 0 : n <= 3 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : 4);
  const cells = days.map((d) => `<li class="l${level(d.answered)}${d.day === t ? ' today' : ''}" title="${shortDate(d.day)}: ${d.answered ? `${d.answered} answered, ${d.right} right` : 'no practice'}"></li>`).join('');
  const maxDue = Math.max(1, ...forecast.map((f) => f.count));
  const bars = forecast.map((f, i) => `<li style="--h:${Math.round((100 * f.count) / maxDue)}%; --i:${i}">
      <span class="f-count">${f.count}</span><span class="f-bar"><i></i></span><span class="f-day">${i === 0 ? 'Today' : weekdayShort(f.day)}</span></li>`).join('');
  const topics = mastery.map((m, n) => {
    const acc = m.accuracy === null ? null : Math.round(m.accuracy * 100);
    return `<li class="${m.answered ? '' : 'idle'}" style="--i:${n}">
      <div class="row"><span class="t-name">${escapeHtml(m.title)}</span><span class="t-acc">${acc === null ? 'Not started' : `${acc}%`}</span></div>
      <div class="bar" role="img" aria-label="${escapeHtml(m.title)}: ${acc === null ? 'not started' : `${acc}% right`}"><i style="width:${acc ?? 0}%"></i></div>
      <div class="t-meta">${m.seen} of ${m.total} seen${m.answered ? `, ${m.right} of ${m.answered} answers right` : ''}</div></li>`;
  }).join('');
  const diffRows = [1, 2, 3].map((k) => `<li><span>${LEVEL[k]}</span><span class="bar"><i style="width:${pct(diff[k].right, diff[k].answered)}%"></i></span><span class="d-num">${diff[k].answered ? `${pct(diff[k].right, diff[k].answered)}%` : 'None yet'}</span></li>`).join('');

  main.innerHTML = `<section class="page progress-page">
    <h2 tabindex="-1">Progress</h2>
    <div class="headline">
      <div><span class="h-num">${st.streak}</span><span class="h-label">day streak</span></div>
      <div><span class="h-num">${st.answered ? `${Math.round(st.accuracy * 100)}%` : 'None'}</span><span class="h-label">accuracy</span></div>
      <div><span class="h-num">${st.answered}</span><span class="h-label">answers</span></div>
    </div>

    <section class="card">
      <h3>Last 12 weeks</h3>
      <p class="card-sub">${activeDays ? `You practised on ${plural(activeDays, 'day')}.` : 'Your practice days will fill in here.'}</p>
      <div class="cal-wrap"><ol class="calendar" aria-label="Practice by day, last 12 weeks">${cells}</ol></div>
      <div class="legend" aria-hidden="true"><span>Less</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>More</span></div>
    </section>

    <section class="card">
      <h3>The bank</h3>
      <div class="coverage" role="img" aria-label="${cov.seen} of ${cov.total} questions seen, ${cov.learned} learned">
        <i class="cov-learned" style="width:${pct(cov.learned, cov.total)}%"></i><i class="cov-seen" style="width:${pct(cov.seen - cov.learned, cov.total)}%"></i>
      </div>
      <dl class="cov-key">
        <div><dt><i class="k-learned"></i>Learned</dt><dd>${cov.learned}</dd></div>
        <div><dt><i class="k-seen"></i>Seen</dt><dd>${cov.seen}</dd></div>
        <div><dt><i class="k-total"></i>In the bank</dt><dd>${cov.total}</dd></div>
      </dl>
    </section>

    <section class="card">
      <h3>Reviews coming up</h3>
      <p class="card-sub">${cov.inReview ? `${plural(cov.inReview, 'question')} in review.` : 'Nothing in review. Misses show up here.'}</p>
      <ol class="forecast">${bars}</ol>
    </section>

    <section class="card">
      <h3>Topics, weakest first</h3>
      <ul class="topics">${topics}</ul>
    </section>

    <section class="card">
      <h3>By difficulty</h3>
      <ul class="diff">${diffRows}</ul>
    </section>
  </section>`;
}

// ------------------------------------------------------------------ settings

export function renderSettings(ctx, msg = null) {
  const { S, main } = ctx;
  const theme = S.progress.settings.theme === 'dark' ? 'dark' : 'light';
  const savedCount = savedItems(S.progress).length;
  main.innerHTML = `<section class="page settings-page">
    <h2 tabindex="-1">Settings</h2>

    <section class="card">
      <h3>Appearance</h3>
      <div class="setting-row">
        <div><p class="s-title">Theme</p><p class="s-desc">Light is easier in daylight, dark at night.</p></div>
        <div class="switch" role="group" aria-label="Theme">
          <button type="button" data-theme-choice="light" aria-pressed="${theme === 'light'}">Light</button>
          <button type="button" data-theme-choice="dark" aria-pressed="${theme === 'dark'}">Dark</button>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>Your data</h3>
      <p class="s-desc">Progress stays in this browser. It includes your answers, reviews and ${plural(savedCount, 'saved concept')}. Use a progress code to move it to another device.</p>
      <div class="setting-block">
        <p class="s-title">Copy my progress code</p>
        <div class="actions"><button type="button" class="btn quiet" data-act="export">Show my progress code</button></div>
        <div id="export-area"></div>
      </div>
      <div class="setting-block">
        <p class="s-title">Load a progress code</p>
        <p class="s-desc">This replaces the progress saved on this device.</p>
        <div class="field"><label for="import-code" class="sr">Progress code</label>
          <textarea id="import-code" class="code-box" spellcheck="false" autocomplete="off" placeholder="Paste a code that starts with MLD1.">${escapeHtml(msg?.keep ?? '')}</textarea></div>
        <div class="actions"><button type="button" class="btn quiet" data-act="import">Load this code</button></div>
        ${msg?.where === 'import' ? `<p class="msg ${msg.good ? 'good' : 'bad'}" role="status">${escapeHtml(msg.text)}</p>` : ''}
      </div>
    </section>

    <section class="card">
      <h3>About</h3>
      <dl class="about">
        <div><dt>Questions</dt><dd>${S.bank.questions.length}</dd></div>
        <div><dt>Concepts</dt><dd>${S.glossary ? S.glossary.list.length : 0}</dd></div>
        <div><dt>Bank built</dt><dd>${escapeHtml(S.bank.built ?? '')}</dd></div>
      </dl>
      <p class="s-desc">Each day brings 3 new questions and up to 5 reviews. A miss comes back after ${INTERVALS[0]} day. Each right answer on review pushes it out to ${INTERVALS.slice(1).join(', then ')} days, and after that it counts as learned.</p>
    </section>

    <section class="card danger-zone">
      <h3>Start over</h3>
      <p class="s-desc">Clears your history, reviews, streak and saved concepts on this device. Your theme stays.</p>
      <div class="actions"><button type="button" class="btn quiet danger" data-act="reset">Clear my progress</button></div>
      ${msg?.where === 'reset' ? `<p class="msg good" role="status">${escapeHtml(msg.text)}</p>` : ''}
    </section>
  </section>`;

  main.querySelectorAll('[data-theme-choice]').forEach((b) => b.addEventListener('click', () => {
    S.progress.settings.theme = b.dataset.themeChoice;
    ctx.applyTheme(S.progress.settings.theme);
    ctx.save();
    renderSettings(ctx);
    main.querySelector(`[data-theme-choice="${b.dataset.themeChoice}"]`).focus();
  }));
  main.querySelector('[data-act="export"]').addEventListener('click', () => {
    const area = main.querySelector('#export-area');
    area.innerHTML = `<textarea class="code-box" readonly aria-label="Your progress code">${escapeHtml(exportCode(S.progress))}</textarea>
      <div class="actions"><button type="button" class="btn quiet" data-act="copy">Copy code</button></div>
      <p class="msg good" id="copy-msg" role="status"></p>`;
    const box = area.querySelector('textarea');
    box.select();
    area.querySelector('[data-act="copy"]').addEventListener('click', async () => {
      const msgEl = area.querySelector('#copy-msg');
      try {
        await navigator.clipboard.writeText(box.value);
        msgEl.textContent = 'Copied.';
      } catch {
        box.select();
        msgEl.textContent = 'Select the code and copy it.';
      }
    });
  });
  main.querySelector('[data-act="import"]').addEventListener('click', () => {
    const code = main.querySelector('#import-code').value;
    let incoming;
    try {
      incoming = importCode(code);
    } catch (e) {
      renderSettings(ctx, { where: 'import', good: false, text: e.message, keep: code });
      return;
    }
    if (!window.confirm('Replace the progress on this device with this code?')) return;
    ctx.replaceProgress(pruneUnknown(incoming, S.ids));
    renderSettings(ctx, { where: 'import', good: true, text: 'Progress loaded.' });
  });
  main.querySelector('[data-act="reset"]').addEventListener('click', () => {
    if (!window.confirm('Clear all progress and saved concepts on this device? This cannot be undone.')) return;
    ctx.resetProgress();
    renderSettings(ctx, { where: 'reset', text: 'Progress cleared.' });
  });
}
