// Saving progress in the browser, and progress codes for moving between devices.
import { emptyProgress } from './schedule.js';

export const STORAGE_KEY = 'ml-daily:v1';
const PREFIX = 'MLD1.';
const BAD_CODE = 'That code is not an ML Daily progress code.';

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export function isProgress(x) {
  return isObj(x)
    && x.v === 1
    && isObj(x.history) && Object.values(x.history).every(Array.isArray)
    && isObj(x.review) && Object.values(x.review).every((r) => isObj(r) && typeof r.due === 'string')
    && Array.isArray(x.learned) && x.learned.every((id) => typeof id === 'string')
    && (x.today === null || (isObj(x.today) && typeof x.today.day === 'string' && Array.isArray(x.today.items)))
    && isObj(x.settings)
    && (x.saved === undefined || (Array.isArray(x.saved) && x.saved.every(isSavedItem)));
}

function isSavedItem(s) {
  return isObj(s) && typeof s.day === 'string'
    && (typeof s.concept === 'string' || typeof s.term === 'string');
}

export function loadProgress(storage) {
  let raw;
  try {
    storage ??= globalThis.localStorage;
    if (!storage) throw new Error('no storage');
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { progress: emptyProgress(), persistent: false };
  }
  if (raw === null || raw === undefined) return { progress: emptyProgress(), persistent: true };
  try {
    const parsed = JSON.parse(raw);
    if (isProgress(parsed)) return { progress: parsed, persistent: true };
  } catch { /* fall through */ }
  try { storage.setItem(STORAGE_KEY + ':broken', raw); } catch { /* ignore */ }
  return { progress: emptyProgress(), persistent: true };
}

export function saveProgress(progress, storage) {
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('bad base64');
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function exportCode(progress) {
  return PREFIX + toBase64Url(JSON.stringify(progress));
}

export function importCode(code) {
  const t = String(code ?? '').trim();
  try {
    if (!t.startsWith(PREFIX)) throw new Error('prefix');
    const parsed = JSON.parse(fromBase64Url(t.slice(PREFIX.length)));
    if (!isProgress(parsed)) throw new Error('shape');
    return parsed;
  } catch {
    throw new Error(BAD_CODE);
  }
}

// Drops ids the bank no longer has from the schedule. History is kept.
export function pruneUnknown(progress, bankIds) {
  const known = new Set(bankIds);
  for (const id of Object.keys(progress.review)) if (!known.has(id)) delete progress.review[id];
  progress.learned = progress.learned.filter((id) => known.has(id));
  if (progress.today) progress.today.items = progress.today.items.filter((it) => known.has(it.id));
  return progress;
}
