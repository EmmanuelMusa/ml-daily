// Sync through a secret Gist in the person's own GitHub account.
//
// The browser talks straight to api.github.com with a token the person made
// themselves. There is no server of ours in between. The token is kept in its
// own storage key, never inside progress, so a progress code never carries it.
import { isProgress } from './store.js?v=8';
import { mergeProgress, stableStringify } from './merge.js?v=8';

export const FILE_NAME = 'ml-daily-progress.json';
export const SYNC_KEY = 'ml-daily:sync';
export const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=ML%20Daily%20sync';
const API = 'https://api.github.com';
const DESCRIPTION = 'ML Daily progress. The ML Daily app keeps this file in step between your devices.';

export class SyncError extends Error {
  constructor(code, status = 0) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

const MESSAGES = {
  auth: 'GitHub did not accept the token. It may have expired or been deleted. Make a new one and paste it here again.',
  scope: 'This token cannot save Gists. Make a new token with the gist box ticked.',
  offline: 'No connection right now. Your progress is safe on this device and will sync once you are back online.',
  limit: 'GitHub is limiting requests for a while. Sync will try again later.',
  'bad-remote': `The ${FILE_NAME} file on GitHub is not ML Daily progress, so nothing was changed. Delete that gist on GitHub, then press Sync now.`,
  http: 'GitHub could not be reached properly just now. Sync will try again later.',
};

export function syncMessage(err) {
  return MESSAGES[err?.code] ?? MESSAGES.http;
}

// What goes up to GitHub: the progress without this device's settings.
const forUpload = (p) => ({ ...p, settings: {} });

async function call(fetchFn, token, path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetchFn(API + path, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new SyncError('offline');
  }
  if (res.ok) return res.json();
  if (res.status === 401) throw new SyncError('auth', 401);
  if (res.status === 429 || (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')) {
    throw new SyncError('limit', res.status);
  }
  if (res.status === 403) throw new SyncError('scope', 403);
  if (res.status === 404) return null;
  throw new SyncError('http', res.status);
}

// The newest of the person's gists that holds our file, or null.
async function findGist(fetchFn, token) {
  let best = null;
  for (let page = 1; page <= 10; page++) {
    const list = await call(fetchFn, token, `/gists?per_page=100&page=${page}`);
    if (!Array.isArray(list) || list.length === 0) break;
    for (const g of list) {
      if (g.files?.[FILE_NAME] && (!best || g.updated_at > best.updated_at)) best = g;
    }
    if (list.length < 100) break;
  }
  return best?.id ?? null;
}

async function createGist(fetchFn, token, progress) {
  const g = await call(fetchFn, token, '/gists', {
    method: 'POST',
    body: { description: DESCRIPTION, public: false, files: { [FILE_NAME]: { content: JSON.stringify(forUpload(progress)) } } },
  });
  // Creating needs the gist permission. Without it GitHub answers Not Found.
  if (!g) throw new SyncError('scope', 404);
  return g.id;
}

async function readFile(fetchFn, file) {
  if (!file.truncated) return file.content;
  // Large files come back cut short. The raw address holds the full text and needs no token.
  let res;
  try {
    res = await fetchFn(file.raw_url, { cache: 'no-store' });
  } catch {
    throw new SyncError('offline');
  }
  if (!res.ok) throw new SyncError('http', res.status);
  return res.text();
}

// One round: read the gist, combine it with this device, write back if anything is new.
// Returns { progress, gistId, pushed }. Throws SyncError.
export async function syncOnce({ local, token, gistId, fetchFn = globalThis.fetch }) {
  let id = gistId;
  let gist = id ? await call(fetchFn, token, `/gists/${encodeURIComponent(id)}`) : null;
  if (!gist) {
    id = await findGist(fetchFn, token);
    gist = id ? await call(fetchFn, token, `/gists/${encodeURIComponent(id)}`) : null;
  }
  // The first device to sync starts the gist.
  if (!gist) {
    const merged = mergeProgress(local, local);
    return { progress: merged, gistId: await createGist(fetchFn, token, merged), pushed: true };
  }

  const file = gist.files?.[FILE_NAME];
  let remote = null;
  if (file) {
    try {
      remote = JSON.parse(await readFile(fetchFn, file));
    } catch (e) {
      if (e instanceof SyncError) throw e;
      throw new SyncError('bad-remote');
    }
    if (!isProgress(remote)) throw new SyncError('bad-remote');
  }

  const merged = remote ? mergeProgress(local, remote) : mergeProgress(local, local);
  const changed = !remote || stableStringify(forUpload(merged)) !== stableStringify(forUpload(remote));
  if (changed) {
    const done = await call(fetchFn, token, `/gists/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { files: { [FILE_NAME]: { content: JSON.stringify(forUpload(merged)) } } },
    });
    if (!done) throw new SyncError('http', 404);
  }
  return { progress: merged, gistId: id, pushed: changed };
}

// ------------------------------------------------------------------ settings on this device

export function loadSyncConfig(storage) {
  try {
    storage ??= globalThis.localStorage;
    const raw = storage.getItem(SYNC_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw);
    return cfg && typeof cfg.token === 'string' && cfg.token ? cfg : null;
  } catch {
    return null;
  }
}

export function saveSyncConfig(cfg, storage) {
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(SYNC_KEY, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}

export function clearSyncConfig(storage) {
  try {
    storage ??= globalThis.localStorage;
    storage.removeItem(SYNC_KEY);
  } catch { /* nothing to clear */ }
}
