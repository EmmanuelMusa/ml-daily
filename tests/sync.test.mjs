import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FILE_NAME, SYNC_KEY, SyncError, syncOnce, loadSyncConfig, saveSyncConfig, clearSyncConfig, syncMessage,
} from '../assets/js/sync.js';
import { emptyProgress, ensureToday, recordResult } from '../assets/js/schedule.js';
import { touch } from '../assets/js/merge.js';
import { isProgress } from '../assets/js/store.js';

const IDS = ['a', 'b', 'c', 'd'];
const D1 = '2026-11-01';

function answered(id, ok, at) {
  const p = ensureToday(emptyProgress(), IDS, D1);
  recordResult(p, id, ok, D1);
  return touch(p, id, at);
}

// A small stand-in for the GitHub Gist API.
function fakeGitHub({ token = 'good' } = {}) {
  const gists = new Map();
  const calls = [];
  let next = 1;
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const view = (g) => ({
    id: g.id,
    updated_at: g.updated,
    files: Object.fromEntries(Object.entries(g.files).map(([name, f]) => [name, {
      filename: name,
      content: f.truncated ? f.content.slice(0, 10) : f.content,
      truncated: Boolean(f.truncated),
      raw_url: `https://gist.githubusercontent.com/raw/${g.id}/${name}`,
    }])),
  });
  async function fetchFn(url, init = {}) {
    const method = init.method ?? 'GET';
    calls.push({ url, method, init });
    const u = new URL(url);
    if (u.host === 'gist.githubusercontent.com') {
      const [, , id, name] = u.pathname.split('/');
      return new Response(gists.get(id).files[name].content, { status: 200 });
    }
    if (init.headers?.Authorization !== `Bearer ${token}`) return json(401, { message: 'Bad credentials' });
    if (u.pathname === '/gists' && method === 'GET') {
      const page = Number(u.searchParams.get('page') ?? 1);
      return json(200, page === 1 ? [...gists.values()].map(view) : []);
    }
    if (u.pathname === '/gists' && method === 'POST') {
      const body = JSON.parse(init.body);
      const g = { id: `g${next++}`, public: body.public, description: body.description, updated: '2026-11-01T00:00:00Z', files: {} };
      for (const [name, f] of Object.entries(body.files)) g.files[name] = { content: f.content };
      gists.set(g.id, g);
      return json(201, view(g));
    }
    const m = u.pathname.match(/^\/gists\/(\w+)$/);
    if (m) {
      const g = gists.get(m[1]);
      if (!g) return json(404, { message: 'Not Found' });
      if (method === 'GET') return json(200, view(g));
      if (method === 'PATCH') {
        for (const [name, f] of Object.entries(JSON.parse(init.body).files)) g.files[name] = { content: f.content };
        return json(200, view(g));
      }
    }
    return json(404, { message: 'Not Found' });
  }
  const stored = (id) => JSON.parse(gists.get(id).files[FILE_NAME].content);
  return { gists, calls, fetchFn, stored };
}

test('the first sync makes a secret gist with this device\'s progress, without settings', async () => {
  const gh = fakeGitHub();
  const local = answered('a', true, 100);
  local.settings.theme = 'dark';
  const r = await syncOnce({ local, token: 'good', gistId: null, fetchFn: gh.fetchFn });
  assert.equal(r.pushed, true);
  assert.equal(gh.gists.get(r.gistId).public, false);
  const up = gh.stored(r.gistId);
  assert.equal(isProgress(up), true);
  assert.deepEqual(up.settings, {});
  assert.deepEqual(up.history, local.history);
  assert.equal(r.progress.settings.theme, 'dark');
});

test('a second device finds the gist and gets the other device\'s answers', async () => {
  const gh = fakeGitHub();
  const first = await syncOnce({ local: answered('a', true, 100), token: 'good', gistId: null, fetchFn: gh.fetchFn });
  const phone = answered('b', false, 200);
  phone.settings.theme = 'light';
  const r = await syncOnce({ local: phone, token: 'good', gistId: null, fetchFn: gh.fetchFn });
  assert.equal(r.gistId, first.gistId);
  assert.deepEqual(Object.keys(r.progress.history).sort(), ['a', 'b']);
  assert.equal(r.progress.settings.theme, 'light');
  assert.deepEqual(Object.keys(gh.stored(r.gistId).history).sort(), ['a', 'b']);
  assert.equal(gh.gists.size, 1);
});

test('nothing is written when both copies already match', async () => {
  const gh = fakeGitHub();
  const first = await syncOnce({ local: answered('a', true, 100), token: 'good', gistId: null, fetchFn: gh.fetchFn });
  gh.calls.length = 0;
  const r = await syncOnce({ local: first.progress, token: 'good', gistId: first.gistId, fetchFn: gh.fetchFn });
  assert.equal(r.pushed, false);
  assert.deepEqual(gh.calls.map((c) => c.method), ['GET']);
});

test('every API call sends the token and skips the browser cache', async () => {
  const gh = fakeGitHub();
  await syncOnce({ local: emptyProgress(), token: 'good', gistId: null, fetchFn: gh.fetchFn });
  for (const c of gh.calls) {
    assert.equal(c.init.headers.Authorization, 'Bearer good');
    assert.equal(c.init.cache, 'no-store');
  }
});

test('a rejected token gives an auth error', async () => {
  const gh = fakeGitHub();
  await assert.rejects(
    syncOnce({ local: emptyProgress(), token: 'wrong', gistId: null, fetchFn: gh.fetchFn }),
    (e) => e instanceof SyncError && e.code === 'auth',
  );
});

test('no connection gives an offline error', async () => {
  const fetchFn = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(
    syncOnce({ local: emptyProgress(), token: 'good', gistId: 'g1', fetchFn }),
    (e) => e instanceof SyncError && e.code === 'offline',
  );
});

test('a deleted gist is replaced with a new one', async () => {
  const gh = fakeGitHub();
  const r = await syncOnce({ local: answered('a', true, 100), token: 'good', gistId: 'gone', fetchFn: gh.fetchFn });
  assert.notEqual(r.gistId, 'gone');
  assert.equal(gh.stored(r.gistId).history.a.length, 1);
});

test('a gist file that is not progress is left alone and reported', async () => {
  const gh = fakeGitHub();
  const first = await syncOnce({ local: emptyProgress(), token: 'good', gistId: null, fetchFn: gh.fetchFn });
  gh.gists.get(first.gistId).files[FILE_NAME].content = '{"hello":1}';
  await assert.rejects(
    syncOnce({ local: answered('a', true, 100), token: 'good', gistId: first.gistId, fetchFn: gh.fetchFn }),
    (e) => e instanceof SyncError && e.code === 'bad-remote',
  );
  assert.equal(gh.gists.get(first.gistId).files[FILE_NAME].content, '{"hello":1}');
});

test('a large file cut short by the API is read in full from its raw address', async () => {
  const gh = fakeGitHub();
  const first = await syncOnce({ local: answered('a', true, 100), token: 'good', gistId: null, fetchFn: gh.fetchFn });
  gh.gists.get(first.gistId).files[FILE_NAME].truncated = true;
  const r = await syncOnce({ local: emptyProgress(), token: 'good', gistId: first.gistId, fetchFn: gh.fetchFn });
  assert.equal(r.progress.history.a.length, 1);
  const raw = gh.calls.find((c) => c.url.includes('gist.githubusercontent.com'));
  assert.equal(raw.init.headers?.Authorization, undefined, 'the token is not sent to the raw host');
});

test('sync settings are kept apart from progress and survive a reload', () => {
  const m = new Map();
  const storage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  assert.equal(loadSyncConfig(storage), null);
  saveSyncConfig({ token: 'good', gistId: 'g1', last: 5 }, storage);
  assert.deepEqual(loadSyncConfig(storage), { token: 'good', gistId: 'g1', last: 5 });
  assert.notEqual(SYNC_KEY, 'ml-daily:v1');
  clearSyncConfig(storage);
  assert.equal(loadSyncConfig(storage), null);
  m.set(SYNC_KEY, '{broken');
  assert.equal(loadSyncConfig(storage), null);
});

test('each error has a plain message', () => {
  for (const code of ['auth', 'offline', 'limit', 'bad-remote', 'http']) {
    const text = syncMessage(new SyncError(code));
    assert.ok(text.length > 10 && !text.includes('undefined'), code);
  }
});
