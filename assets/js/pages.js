// Concepts, concept card, Progress and Settings views.
// Each render function gets the shared app context:
//   { S, main, save, today, icon, ICONS, setDayLabel, afterProgressChange }
import { renderMarkup, escapeHtml } from './markup.js';
import { stats } from './schedule.js';
import { exportCode, importCode } from './store.js?v=8';
import { TOKEN_URL, FILE_NAME, syncMessage } from './sync.js?v=8';
import { isSaved, saveConcept, saveTerm, removeSaved, savedItems } from './saved.js?v=8';
import { activityByDay, coverage, dueForecast, byDifficulty, topicMastery } from './insights.js';
import { searchGlossary } from './search.js?v=7';
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
      <p class="lede">${G ? 'This concept is not in the glossary yet.' : 'The glossary could not be loaded. Check your connection and reload the page.'}</p></section>`;
    return;
  }
  const saved = isSaved(S.progress, id);
  const topic = S.titles[c.topic] ?? c.topic;
  const used = G.usage.get(id) ?? 0;
  const related = (c.related ?? []).filter((r) => G.byId.has(r))
    .map((r) => `<li><a class="chip" href="#concept/${encodeURIComponent(r)}">${escapeHtml(G.byId.get(r).name)}</a></li>`).join('');
  main.innerHTML = `<article class="page concept" aria-labelledby="concept-name">
    <a class="back" href="${S.cameFromQuestion ? '#today' : '#concepts'}" data-act="back">${ctx.icon('back')}${back}</a>
    <div class="concept-grid">
      <div class="concept-main">
        <header class="concept-head">
          <p class="concept-topic">${escapeHtml(topic)}</p>
          <h2 id="concept-name" tabindex="-1">${escapeHtml(c.name)}</h2>
          ${c.aka?.length ? `<p class="aka">Other names and variants: ${c.aka.map(escapeHtml).join(', ')}</p>` : ''}
          <button type="button" class="btn ${saved ? '' : 'quiet'} save-btn" data-act="save-concept">
            ${ctx.icon(saved ? 'bookmarkFilled' : 'bookmark')}<span>${saved ? 'Saved' : 'Save for later'}</span></button>
        </header>
        <p class="concept-summary">${escapeHtml(c.summary)}</p>
        ${c.svg ? `<figure class="diagram">${c.svg}</figure>` : ''}
        <div class="explain concept-body">${renderMarkup(c.body)}</div>
        ${c.mixup ? `<div class="deeper mixup"><h3>Common mix-up</h3>${renderMarkup(c.mixup)}</div>` : ''}
      </div>
      <aside class="concept-side" aria-label="Related">
        ${related ? `<h3 class="sub-head">Related</h3><ul class="chips">${related}</ul>` : ''}
        <p class="used">${used ? `Comes up in ${plural(used, 'question')} in the bank.` : 'Not used by a question yet.'}</p>
      </aside>
    </div>
  </article>`;
  main.querySelector('[data-act="save-concept"]').addEventListener('click', () => {
    if (isSaved(S.progress, id)) removeSaved(S.progress, { concept: id }, Date.now());
    else saveConcept(S.progress, id, S.cameFromQuestion ? S.ui.id : null, ctx.today(), Date.now());
    ctx.save();
    main.className = 'fx-save'; // one-shot cue: the bookmark settles in, the page does not fade again
    renderConcept(ctx, id);
    main.querySelector('[data-act="save-concept"]').focus();
    ctx.announce(isSaved(S.progress, id) ? `${c.name} saved to your list.` : `${c.name} removed from your list.`);
  });
  main.querySelector('[data-act="back"]').addEventListener('click', (e) => {
    // Back to the question unwinds every concept card opened from it. Otherwise the link's own href applies.
    if (S.cameFromQuestion && S.conceptDepth > 0) {
      e.preventDefault();
      history.go(-S.conceptDepth);
    }
  });
}

// ------------------------------------------------------------------ concepts tab

function glossaryItemsHtml(ctx, list) {
  return `<ul class="g-list">${list.map((c) => `<li><a href="#concept/${encodeURIComponent(c.id)}">
        <span class="g-name"><span class="g-title">${escapeHtml(c.name)}</span>${c.svg ? `<span class="g-fig" title="Has a diagram" aria-hidden="true">${ctx.ICONS.diagram}</span><span class="sr">, has a diagram</span>` : ''}${isSaved(ctx.S.progress, c.id) ? `<span class="g-saved" title="Saved" aria-hidden="true">${ctx.ICONS.bookmarkFilled}</span><span class="sr">, saved</span>` : ''}</span>
        <span class="g-sum">${escapeHtml(c.summary)}</span></a></li>`).join('')}</ul>`;
}

// Name matches are grouped by topic. Matches found only in a summary follow
// in one group of their own.
function glossaryListHtml(ctx, query) {
  const G = ctx.S.glossary;
  const { byName, bySummary } = searchGlossary(G.index, query);
  const count = byName.length + bySummary.length;
  if (!count) return { count, html: `<p class="empty g-none">No concept matches "${escapeHtml(query.trim())}". You can save it as your own term.</p>` };
  const groups = new Map();
  for (const c of byName) {
    if (!groups.has(c.topic)) groups.set(c.topic, []);
    groups.get(c.topic).push(c);
  }
  const head = (title, n) => `<h4>${title} <span class="count">${n}</span></h4>`;
  let html = [...groups].map(([topic, list]) => `<section class="g-group" data-topic="${escapeHtml(topic)}">
      ${head(escapeHtml(ctx.S.titles[topic] ?? topic), list.length)}
      ${glossaryItemsHtml(ctx, list)}
    </section>`).join('');
  if (bySummary.length) {
    html += `<section class="g-group g-also">${head('Mentioned in the meaning', bySummary.length)}${glossaryItemsHtml(ctx, bySummary)}</section>`;
  }
  return { count, html };
}

function myListHtml(ctx) {
  const { S } = ctx;
  const items = savedItems(S.progress);
  if (!items.length) {
    return `<div class="empty-box"><span class="empty-ico" aria-hidden="true">${ctx.ICONS.bookmark}</span>
      <p><strong>Nothing saved yet.</strong> After you check an answer, open a key concept and press Save for later, or type a term above.</p></div>`;
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
    return `<li class="is-term"><div class="s-main"><span class="s-name">${escapeHtml(s.term)}</span>
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
    <div class="concepts-layout">
      <div class="c-side">
        <form class="save-term" autocomplete="off">
          <label for="term">Save a word or idea</label>
          <div class="inline">
            <input id="term" type="text" maxlength="80" placeholder="For example, Platt scaling" spellcheck="false">
            <button type="submit" class="btn">Save</button>
          </div>
          <p class="msg ${state.msgGood ? 'good' : ''}">${escapeHtml(state.msg ?? '')}</p>
        </form>
        <h3 class="sub-head" id="my-list" tabindex="-1">My list <span class="count">${count}</span></h3>
        ${myListHtml(ctx)}
        <nav class="c-topics" aria-label="Jump to a topic">
          <h3 class="sub-head">Topics</h3>
          <ul>${topicCounts(G.list).map(([topic, n]) => `<li><button type="button" data-jump="${escapeHtml(topic)}"><span>${escapeHtml(S.titles[topic] ?? topic)}</span><span class="count">${n}</span></button></li>`).join('')}</ul>
        </nav>
      </div>
      <div class="c-main">
        <h3 class="sub-head g-head">Glossary <span class="count">${G.list.length}</span></h3>
        <div class="field search"><label for="g-search" class="sr">Search the glossary</label>
          <span class="search-ico" aria-hidden="true">${ctx.ICONS.search}</span>
          <input id="g-search" type="search" placeholder="Search concepts" value="${escapeHtml(query)}" spellcheck="false" autocomplete="off"></div>
        <div id="g-results">${glossaryListHtml(ctx, query).html}</div>
      </div>
    </div>
  </section>`;
  if (state.msg) ctx.announce(state.msg);

  main.querySelector('.save-term').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = main.querySelector('#term');
    const result = saveTerm(S.progress, input.value, null, ctx.today(), G.lookup, Date.now());
    let msg;
    if (!input.value.trim()) msg = 'Type a word or idea first.';
    else if (!result) msg = 'That is already in your list.';
    else if (result.concept) msg = `Saved. ${G.byId.get(result.concept).name} is in the glossary, so you can read it now.`;
    else msg = 'Saved to your list.';
    ctx.save();
    main.className = '';
    renderConcepts(ctx, { msg, msgGood: Boolean(result), query: main.querySelector('#g-search').value });
    main.querySelector('#term').focus();
  });
  // After a removal, focus moves to the row that took its place, or to the
  // row above when the last one went, or to the heading when the list is empty.
  const removeAt = (button, what, name) => {
    const rows = [...main.querySelectorAll('.saved-list li')];
    const at = rows.indexOf(button.closest('li'));
    removeSaved(S.progress, what, Date.now());
    ctx.save();
    main.className = '';
    renderConcepts(ctx, { query: main.querySelector('#g-search').value });
    const left = main.querySelectorAll('.saved-list li');
    const row = left[Math.min(at, left.length - 1)];
    (row?.querySelector('a.s-main, .icon-btn') ?? main.querySelector('#my-list')).focus();
    ctx.announce(`${name} removed from your list.`);
  };
  main.querySelectorAll('[data-remove-concept]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.removeConcept;
    removeAt(b, { concept: id }, G.byId.get(id)?.name ?? id);
  }));
  main.querySelectorAll('[data-remove-term]').forEach((b) => b.addEventListener('click', () => {
    removeAt(b, { term: b.dataset.removeTerm }, b.dataset.removeTerm);
  }));

  // Typing redraws the list at most once a frame. The match count is read out
  // once the person pauses.
  const search = main.querySelector('#g-search');
  const results = main.querySelector('#g-results');
  let frame = 0;
  let pause = 0;
  search.addEventListener('input', () => {
    S.conceptQuery = search.value;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const { html, count: n } = glossaryListHtml(ctx, search.value);
      results.innerHTML = html;
      clearTimeout(pause);
      pause = setTimeout(() => {
        if (main.contains(search)) ctx.announce(search.value.trim() ? `${plural(n, 'concept')} ${n === 1 ? 'matches' : 'match'}.` : `Showing all ${n} concepts.`);
      }, 500);
    });
  });

  // Topic list on wide screens: scrolls to that topic, clearing a search that hides it.
  const groupOf = (topic) => [...results.querySelectorAll('.g-group[data-topic]')].find((g) => g.dataset.topic === topic);
  main.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
    let group = groupOf(b.dataset.jump);
    if (!group) {
      search.value = '';
      S.conceptQuery = '';
      results.innerHTML = glossaryListHtml(ctx, '').html;
      group = groupOf(b.dataset.jump);
    }
    group?.scrollIntoView({ block: 'start' });
    group?.querySelector('a')?.focus({ preventScroll: true });
  }));
}

function topicCounts(list) {
  const counts = new Map();
  for (const c of list) counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1);
  return [...counts];
}

// ------------------------------------------------------------------ progress

// Wide screens show half a year of practice, phones a quarter.
const calWeeks = () => (window.matchMedia?.('(min-width: 1024px)').matches ? 26 : 12);

function dayDetail(d, t) {
  const when = d.day === t ? 'Today' : shortDate(d.day);
  return `${when}: ${d.answered ? `${d.answered} answered, ${d.right} right` : 'no practice'}`;
}

export function renderProgress(ctx) {
  const { S, main } = ctx;
  const t = ctx.today();
  const st = stats(S.progress, S.bank, t);
  const cov = coverage(S.progress, S.bank);
  const span = calWeeks();
  const days = activityByDay(S.progress, S.bank, t, span);
  const forecast = dueForecast(S.progress, S.bank, t, 7);
  const diff = byDifficulty(S.progress, S.bank);
  const mastery = topicMastery(S.progress, S.bank);
  const activeDays = days.filter((d) => d.answered).length;

  const level = (n) => (n === 0 ? 0 : n <= 3 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : 4);
  // Week grid: one column per week, Monday at the top. --w drives the entrance stagger.
  const weeks = Math.ceil(days.length / 7);
  const cells = days.map((d, n) => `<li class="l${level(d.answered)}${d.day === t ? ' today' : ''}" style="--w:${Math.floor(n / 7)}" data-n="${n}"></li>`).join('');
  const practised = days.filter((d) => d.answered).map((d) => `<li>${dayDetail(d, t)}</li>`).join('');
  const monthOf = (day) => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: 'short' });
  const months = Array.from({ length: weeks }, (_, w) => {
    const m = monthOf(days[w * 7].day);
    const prev = w ? monthOf(days[(w - 1) * 7].day) : null;
    const next = days[(w + 1) * 7] ? monthOf(days[(w + 1) * 7].day) : null;
    const show = w === 0 ? m === next : m !== prev;
    return show ? `<span style="grid-column:${w + 1}">${m}</span>` : '';
  }).join('');
  const weekAnswers = days.slice(-(((days.length - 1) % 7) + 1)).reduce((s, d) => s + d.answered, 0);
  const totalAnswers = days.reduce((s, d) => s + d.answered, 0);
  const calLabel = `Practice by day, last ${span} weeks. ${activeDays ? `You practised on ${plural(activeDays, 'day')}, listed below.` : 'No practice yet.'}`;

  const maxDue = Math.max(1, ...forecast.map((f) => f.count));
  const dueTotal = forecast.reduce((s, f) => s + f.count, 0);
  const bars = forecast.map((f, i) => `<li class="${f.count ? '' : 'zero'}${i === 0 ? ' f-today' : ''}" style="--h:${Math.round((100 * f.count) / maxDue)}%; --i:${i}">
      <span class="f-count">${f.count}</span><span class="f-bar"><i></i></span><span class="f-day">${i === 0 ? 'Today' : weekdayShort(f.day)}</span></li>`).join('');
  const topics = mastery.map((m, n) => {
    const acc = m.accuracy === null ? null : Math.round(m.accuracy * 100);
    return `<li class="${m.answered ? '' : 'idle'}" style="--i:${n}">
      <div class="row"><span class="t-name">${escapeHtml(m.title)}</span><span class="t-acc">${acc === null ? 'Not started' : `${acc}%`}</span></div>
      <div class="bar" role="img" aria-label="${escapeHtml(m.title)}: ${acc === null ? 'not started' : `${acc}% right`}"><i style="width:${acc ?? 0}%"></i></div>
      <div class="t-meta">${m.seen} of ${m.total} seen${m.answered ? `, ${m.right} of ${m.answered} answers right` : ''}</div></li>`;
  }).join('');
  const pips = (k) => `<span class="pips" aria-hidden="true">${[1, 2, 3].map((n) => `<i class="${n <= k ? 'on' : ''}"></i>`).join('')}</span>`;
  const diffRows = [1, 2, 3].map((k) => `<li class="${diff[k].answered ? '' : 'idle'}" style="--i:${k - 1}"><span class="d-name">${pips(k)}${LEVEL[k]}</span><span class="bar"><i style="width:${pct(diff[k].right, diff[k].answered)}%"></i></span><span class="d-num">${diff[k].answered ? `${pct(diff[k].right, diff[k].answered)}%` : 'None yet'}</span>
      <span class="d-meta">${diff[k].answered ? `${diff[k].right} of ${diff[k].answered} right` : ''}</span></li>`).join('');
  const fresh = !st.answered;

  main.innerHTML = `<section class="page progress-page${fresh ? ' is-fresh' : ''}">
    <h2 tabindex="-1">Progress</h2>
    <div class="dash">
    <div class="headline">
      <div><span class="h-num">${st.streak}</span><span class="h-label">day streak</span></div>
      <div><span class="h-num">${st.answered ? `${Math.round(st.accuracy * 100)}%` : 'None'}</span><span class="h-label">accuracy</span></div>
      <div><span class="h-num">${st.answered}</span><span class="h-label">answers</span></div>
    </div>
    ${fresh ? `<div class="first-run"><p><strong>This page fills in as you practise.</strong> Answer today's questions and your streak, calendar and topics start here.</p>
      <a class="btn quiet first-go" href="#today">Go to today's questions</a></div>` : ''}

    <section class="card card-cal">
      <div class="card-head"><h3>Last ${span} weeks</h3>${activeDays ? `<span class="card-fig">${activeDays} <span>${activeDays === 1 ? 'day' : 'days'} practised</span></span>` : ''}</div>
      <p class="card-sub">${activeDays ? `${plural(totalAnswers, 'answer')} in that time${weekAnswers ? `, ${weekAnswers} of them this week` : ''}.` : 'Each day you practise fills a square.'}</p>
      <div class="cal" role="img" aria-label="${calLabel}" style="--weeks:${weeks}">
        <div class="cal-months" aria-hidden="true">${months}</div>
        <div class="cal-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div>
        <ol class="calendar" aria-hidden="true">${cells}</ol>
      </div>
      ${practised ? `<ul class="sr">${practised}</ul>` : ''}
      <p class="cal-read" aria-hidden="true">${dayDetail(days[days.length - 1], t)}</p>
      <div class="legend" aria-hidden="true"><span>Less</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>More</span><span class="lg-today"><i class="l0 today"></i>Today</span></div>
    </section>

    <section class="card card-bank">
      <div class="card-head"><h3>The bank</h3><span class="card-fig">${pct(cov.seen, cov.total)}% <span>seen</span></span></div>
      <div class="coverage" role="img" aria-label="${cov.seen} of ${cov.total} questions seen, ${cov.learned} learned">
        <i class="cov-learned" style="width:${pct(cov.learned, cov.total)}%"></i><i class="cov-seen" style="width:${pct(cov.seen - cov.learned, cov.total)}%"></i>
      </div>
      <dl class="cov-key">
        <div><dt><i class="k-learned"></i>Learned</dt><dd>${cov.learned}</dd></div>
        <div><dt><i class="k-seen"></i>Seen</dt><dd>${cov.seen}</dd></div>
        <div><dt><i class="k-total"></i>In the bank</dt><dd>${cov.total}</dd></div>
      </dl>
    </section>

    <section class="card card-due">
      <div class="card-head"><h3>Reviews coming up</h3>${dueTotal ? `<span class="card-fig">${dueTotal} <span>due in 7 days</span></span>` : ''}</div>
      <p class="card-sub">${cov.inReview ? `${plural(cov.inReview, 'question')} in review. Each one comes back on the day shown.` : 'Nothing in review. A miss comes back here the next day.'}</p>
      <ol class="forecast${dueTotal ? '' : ' is-empty'}" aria-label="Reviews due over the next 7 days">${bars}</ol>
    </section>

    <section class="card card-topics">
      <h3>Topics, weakest first</h3>
      ${fresh ? '<p class="card-sub">Each topic gets a bar once you answer a question from it.</p>' : ''}
      <ul class="topics">${topics}</ul>
    </section>

    <section class="card card-diff">
      <h3>By difficulty</h3>
      <ul class="diff">${diffRows}</ul>
    </section>
    </div>
  </section>`;

  // Pointing at or tapping a square shows that day under the calendar.
  const read = main.querySelector('.cal-read');
  const show = (e) => {
    const cell = e.target.closest?.('.calendar li');
    if (cell) read.textContent = dayDetail(days[Number(cell.dataset.n)], t);
  };
  const cal = main.querySelector('.calendar');
  cal.addEventListener('pointerover', show);
  cal.addEventListener('click', show);
  cal.addEventListener('pointerleave', () => { read.textContent = dayDetail(days[days.length - 1], t); });
}

// ------------------------------------------------------------------ settings

function when(at) {
  const d = new Date(at);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return `at ${time}`;
  return `on ${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} at ${time}`;
}

const SHORT_ERRORS = { offline: 'Offline. Sync resumes when you reconnect.', limit: 'Sync will try again soon.', http: 'Sync will try again soon.' };

// What the sync line says. Short is for the desktop sidebar.
export function syncStatusText(status, short = false) {
  if (status.state === 'off') return 'Sync is off.';
  if (status.state === 'working') return 'Syncing now.';
  if (status.state === 'error') {
    if (!short) return syncMessage(status.error);
    return SHORT_ERRORS[status.error?.code] ?? 'Sync needs a look in Settings.';
  }
  if (!status.at) return 'Waiting to sync.';
  return `${short ? 'Synced' : 'Last synced'} ${when(status.at)}.`;
}

// Updates the sync line in Settings without redrawing the page.
export function updateSyncStatus(ctx) {
  const el = ctx.main.querySelector('#sync-status');
  if (!el) return;
  const status = ctx.sync.status();
  el.textContent = syncStatusText(status);
  el.classList.toggle('bad', status.state === 'error');
  const now = ctx.main.querySelector('[data-act="sync-now"]');
  if (now) now.disabled = status.state === 'working';
}

function syncCardHtml(ctx, msg) {
  const cfg = ctx.sync.config();
  const note = msg?.where === 'sync' ? `<p class="msg ${msg.good ? 'good' : 'bad'}">${escapeHtml(msg.text)}</p>` : '';
  if (cfg) {
    const status = ctx.sync.status();
    const gist = cfg.gistId ? `<a href="https://gist.github.com/${encodeURIComponent(cfg.gistId)}" target="_blank" rel="noopener noreferrer">a secret Gist</a>` : 'a secret Gist';
    return `<section class="card sync-card">
      <h3>Sync between devices</h3>
      <p class="sync-line${status.state === 'error' ? ' bad' : ''}" id="sync-status">${escapeHtml(syncStatusText(status))}</p>
      <p class="s-desc">Changes go up a few seconds after you make them, and this device checks for news whenever you come back to it. Your progress is kept in ${gist} named ${FILE_NAME} on your GitHub account.</p>
      <div class="actions">
        <button type="button" class="btn quiet" data-act="sync-now"${status.state === 'working' ? ' disabled' : ''}>Sync now</button>
        <button type="button" class="btn quiet" data-act="sync-off">Turn off sync here</button>
      </div>
      ${note}
    </section>`;
  }
  return `<section class="card sync-card">
    <h3>Sync between devices</h3>
    <p class="s-desc">Keep the same progress on your phone and computer without copying codes. It is saved to a secret Gist in your own GitHub account and nowhere else. You need a free GitHub account.</p>
    <ol class="steps">
      <li><a href="${TOKEN_URL}" target="_blank" rel="noopener noreferrer">Open the new token page on GitHub</a>. The gist box is already ticked, and nothing else is needed.</li>
      <li>Under Expiration, pick No expiration or a date far ahead. Then press Generate token at the bottom.</li>
      <li>Copy the token and paste it below. On your other device, paste the same token, or make a second one the same way.</li>
    </ol>
    <form class="sync-form">
      <div class="field"><label for="sync-token">GitHub token</label>
        <input id="sync-token" type="password" autocomplete="off" spellcheck="false" autocapitalize="off"></div>
      <div class="actions"><button type="submit" class="btn">Turn on sync</button></div>
    </form>
    <p class="s-desc">The token stays in this browser. It can read and write your Gists and nothing else.</p>
    ${note}
  </section>`;
}

export function renderSettings(ctx, msg = null) {
  const { S, main } = ctx;
  const theme = S.progress.settings.theme === 'dark' ? 'dark' : 'light';
  const savedCount = savedItems(S.progress).length;
  main.innerHTML = `<section class="page settings-page">
    <h2 tabindex="-1">Settings</h2>
    <div class="cols">
    <div class="col">
    <section class="card">
      <h3>Appearance</h3>
      <div class="setting-row">
        <div><p class="s-title">Theme</p><p class="s-desc">Light is easier in daylight, dark at night.</p></div>
        <div class="switch" role="group" aria-label="Theme">
          <button type="button" data-theme-choice="light" aria-pressed="${theme === 'light'}">${ctx.icon('sun')}<span>Light</span></button>
          <button type="button" data-theme-choice="dark" aria-pressed="${theme === 'dark'}">${ctx.icon('moon')}<span>Dark</span></button>
        </div>
      </div>
    </section>

    ${syncCardHtml(ctx, msg)}

    <section class="card">
      <h3>Your data</h3>
      <p class="s-desc">Progress is saved in this browser. It includes your answers, reviews and ${plural(savedCount, 'saved concept')}. Without sync, a progress code moves it to another device.</p>
      <div class="setting-block">
        <p class="s-title">Copy my progress code</p>
        <p class="s-desc">Shows a code you can paste on your other device.</p>
        <div class="actions"><button type="button" class="btn quiet" data-act="export">Show my progress code</button></div>
        <div id="export-area"></div>
      </div>
      <div class="setting-block">
        <p class="s-title">Load a progress code</p>
        <p class="s-desc">Adds the code's progress to this device, and nothing here is lost. Where both answered the same question, the later answer counts.</p>
        <div class="field"><label for="import-code" class="sr">Progress code</label>
          <textarea id="import-code" class="code-box" spellcheck="false" autocomplete="off" placeholder="Paste a code that starts with MLD1.">${escapeHtml(msg?.keep ?? '')}</textarea></div>
        <div class="actions"><button type="button" class="btn quiet" data-act="import">Add this progress</button></div>
        ${msg?.where === 'import' ? `<p class="msg ${msg.good ? 'good' : 'bad'}">${escapeHtml(msg.text)}</p>` : ''}
      </div>
    </section>
    </div>
    <div class="col">
    <section class="card">
      <h3>About</h3>
      <dl class="about">
        <div><dt>Questions</dt><dd>${S.bank.questions.length}</dd></div>
        <div><dt>Concepts</dt><dd>${S.glossary ? S.glossary.list.length : 0}</dd></div>
        <div><dt>Bank built</dt><dd>${escapeHtml(S.bank.built ?? '')}</dd></div>
      </dl>
      <p class="s-title about-sub">How reviews work</p>
      <p class="s-desc">Each day brings 3 new questions and up to 5 reviews. A miss comes back after ${INTERVALS[0]} day. Each right answer on review pushes it out to ${INTERVALS.slice(1).join(', then ')} days, and after that it counts as learned.</p>
      <ol class="ladder" aria-hidden="true"><li class="lad-miss">Miss</li>${INTERVALS.map((d) => `<li>${plural(d, 'day')}</li>`).join('')}<li class="lad-done">Learned</li></ol>
    </section>

    <section class="card danger-zone">
      <h3>Start over</h3>
      <p class="s-desc">Clears your history, reviews, streak and saved concepts on this device${ctx.sync.config() ? ' and on every device that syncs with it' : ''}. Your theme stays.</p>
      <div class="actions"><button type="button" class="btn quiet danger" data-act="reset">Clear my progress</button></div>
      ${msg?.where === 'reset' ? `<p class="msg good">${escapeHtml(msg.text)}</p>` : ''}
    </section>
    </div>
    </div>
  </section>`;
  if (msg?.text) ctx.announce(msg.text);

  main.querySelectorAll('[data-theme-choice]').forEach((b) => b.addEventListener('click', () => {
    S.progress.settings.theme = b.dataset.themeChoice;
    ctx.applyTheme(S.progress.settings.theme);
    ctx.save();
    main.className = '';
    renderSettings(ctx);
    main.querySelector(`[data-theme-choice="${b.dataset.themeChoice}"]`).focus();
    ctx.announce(`${b.dataset.themeChoice === 'dark' ? 'Dark' : 'Light'} theme on.`);
  }));
  main.querySelector('[data-act="export"]').addEventListener('click', () => {
    const area = main.querySelector('#export-area');
    area.innerHTML = `<textarea class="code-box" readonly aria-label="Your progress code">${escapeHtml(exportCode(S.progress))}</textarea>
      <div class="actions"><button type="button" class="btn quiet" data-act="copy">Copy code</button></div>
      <p class="msg good" id="copy-msg"></p>`;
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
      ctx.announce(msgEl.textContent);
    });
  });
  main.querySelector('[data-act="import"]').addEventListener('click', () => {
    const code = main.querySelector('#import-code').value;
    let incoming;
    try {
      incoming = importCode(code);
    } catch (e) {
      main.className = '';
      renderSettings(ctx, { where: 'import', good: false, text: e.message, keep: code });
      return;
    }
    ctx.mergeIn(incoming);
    main.className = '';
    renderSettings(ctx, { where: 'import', good: true, text: 'Progress added.' });
  });
  main.querySelector('[data-act="reset"]').addEventListener('click', () => {
    const where = ctx.sync.config() ? 'on this device and on every device that syncs with it' : 'on this device';
    if (!window.confirm(`Clear all progress and saved concepts ${where}? This cannot be undone.`)) return;
    ctx.resetProgress();
    main.className = '';
    renderSettings(ctx, { where: 'reset', text: 'Progress cleared.' });
  });

  const form = main.querySelector('.sync-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('#sync-token');
    const token = input.value.trim();
    if (!token) {
      renderSettings(ctx, { where: 'sync', good: false, text: 'Paste your GitHub token first.' });
      main.querySelector('#sync-token').focus();
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Connecting to GitHub';
    const r = await ctx.sync.connect(token);
    if (S.view !== 'settings') return;
    main.className = '';
    if (r.ok) {
      renderSettings(ctx, { where: 'sync', good: true, text: 'Sync is on. This device and GitHub now hold the same progress.' });
      main.querySelector('[data-act="sync-now"]')?.focus();
    } else {
      renderSettings(ctx, { where: 'sync', good: false, text: r.error ? syncMessage(r.error) : 'Sync could not start. Try again.' });
      main.querySelector('#sync-token')?.focus();
    }
  });
  main.querySelector('[data-act="sync-now"]')?.addEventListener('click', async () => {
    const r = await ctx.sync.now();
    if (r.ok) ctx.announce('Synced.');
    else if (r.error) ctx.announce(syncMessage(r.error));
  });
  main.querySelector('[data-act="sync-off"]')?.addEventListener('click', () => {
    ctx.sync.disconnect();
    main.className = '';
    renderSettings(ctx, { where: 'sync', good: true, text: 'Sync is off on this device. Your progress here and the copy on GitHub are both kept.' });
    main.querySelector('#sync-token')?.focus();
  });
}
