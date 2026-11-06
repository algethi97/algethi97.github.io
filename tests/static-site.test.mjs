import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const commonSource = await readFile(new URL('../common.js', import.meta.url), 'utf8');
const guestSource = await readFile(new URL('../guestbook.js', import.meta.url), 'utf8');
let moduleId = 0;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(`${source}\n// instance ${++moduleId}`).toString('base64')}`;
const settle = () => new Promise(resolve => setImmediate(resolve));

function browserGlobals(t, values) {
  for (const [key, value] of Object.entries(values)) {
    const before = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => before ? Object.defineProperty(globalThis, key, before) : delete globalThis[key]);
  }
}

test('relative time preserves boundaries, page date formats and invalid dates', async t => {
  const { formatTimeAgo } = await import(moduleUrl(commonSource));
  const now = new Date(2026, 0, 20, 12, 34).getTime();
  t.mock.method(Date, 'now', () => now);
  for (const [seconds, expected] of [[-1, '방금 전'], [0, '방금 전'], [59, '방금 전'], [60, '1분 전'], [3599, '59분 전'], [3600, '1시간 전'], [86399, '23시간 전'], [86400, '1일 전'], [604799, '6일 전']]) {
    assert.equal(formatTimeAgo(new Date(now - seconds * 1000).toISOString()), expected);
  }
  const old = new Date(2026, 0, 13, 12, 34).toISOString();
  assert.equal(formatTimeAgo(old), '2026.01.13');
  assert.equal(formatTimeAgo(old, { includeTime: true, invalidAsEmpty: true }), '2026.01.13 12:34');
  assert.equal(formatTimeAgo('invalid', { invalidAsEmpty: true }), '');
  assert.equal(formatTimeAgo('invalid'), 'NaN.NaN.NaN');
  assert.equal(formatTimeAgo(null), '');
  assert.equal(formatTimeAgo(''), '');
});

function element() {
  const classes = new Set();
  return {
    style: {}, value: '', textContent: '', innerHTML: '', children: [], listeners: {}, disabled: false,
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    appendChild(child) { this.children.push(child); },
    prepend(child) { this.children.unshift(child); },
    focus() { this.focused = true; },
    querySelector(selector) { return this.parts?.[selector] ?? null; }
  };
}

function button() {
  const result = element();
  result.parts = { '.btn-text': element(), '.btn-loader': element() };
  return result;
}

test('button loading preserves both modes and accepts absent elements', async () => {
  const { setButtonLoading } = await import(moduleUrl(commonSource));
  for (const textMode of ['hide', 'dim']) {
    const b = button();
    for (const loading of [true, false]) {
      setButtonLoading(b, loading, { textMode });
      assert.equal(b.disabled, loading);
      assert.equal(b.parts['.btn-loader'].style.display, loading ? 'inline-block' : 'none');
      assert.equal(b.parts['.btn-text'].style[textMode === 'dim' ? 'opacity' : 'display'], textMode === 'dim' ? (loading ? '0.5' : '1') : (loading ? 'none' : 'inline'));
    }
  }
  const b = button();
  setButtonLoading(b, true);
  assert.equal(b.parts['.btn-text'].style.display, 'none');
  assert.doesNotThrow(() => setButtonLoading(null, true));
  assert.doesNotThrow(() => setButtonLoading(element(), false));
});

test('client waits for SDK and reuses one instance', async t => {
  browserGlobals(t, { window: {} });
  const { getSupabaseClient } = await import(moduleUrl(commonSource));
  assert.equal(getSupabaseClient(), null);
  let calls = 0;
  const client = {};
  window.supabase = { createClient: () => { calls++; return client; } };
  assert.equal(getSupabaseClient(), client);
  assert.equal(getSupabaseClient(), client);
  assert.equal(calls, 1);
});

async function guestbook(t, { rows = [], count = rows.length, sdk = true, cooldown = 0 } = {}) {
  const ids = ['guestbook-form', 'message', 'char-count', 'load-more-btn', 'guestbook-list', 'guestbook-skeleton', 'guestbook-empty', 'total-count', 'honeypot-website', 'nickname', 'submit-btn', 'cooldown-banner', 'cooldown-timer'];
  const els = Object.fromEntries(ids.map(id => [id, id.endsWith('-btn') ? button() : element()]));
  els['guestbook-form'].reset = () => { els.nickname.value = ''; els.message.value = ''; els['honeypot-website'].value = ''; };
  const storage = new Map(cooldown ? [['guestbook_cooldown_target', String(Date.now() + cooldown * 1000)]] : []);
  const calls = [], notices = [], errors = [], intervals = new Map();
  let nextInterval = 0, ready;
  const responses = [{ data: rows, count, error: null }];
  const client = { from(table) {
    const call = { table };
    calls.push(call);
    const query = {
      select(...args) { call.select = args; return call.insert ? Promise.resolve(responses.shift()) : query; },
      order(...args) { call.order = args; return query; },
      range(...args) { call.range = args; return Promise.resolve(responses.shift()); },
      insert(values) { call.insert = values; return query; }
    };
    return query;
  } };
  browserGlobals(t, {
    window: { ...(sdk ? { supabase: { createClient: () => client } } : {}), showToast: (...args) => notices.push(args) },
    document: { getElementById: id => els[id], createElement: () => element(), addEventListener: (event, fn) => { assert.equal(event, 'DOMContentLoaded'); ready = fn; } },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    setInterval: fn => { intervals.set(++nextInterval, fn); return nextInterval; },
    clearInterval: id => intervals.delete(id)
  });
  t.mock.method(console, 'error', (...args) => errors.push(args));
  t.mock.method(console, 'warn', () => {});
  const common = moduleUrl(commonSource);
  await import(moduleUrl(guestSource.replace("'./common.js'", JSON.stringify(common))));
  ready();
  await settle();
  return { els, calls, notices, errors, responses, storage, intervals,
    submit: () => els['guestbook-form'].listeners.submit({ preventDefault() {} }),
    more: () => els['load-more-btn'].listeners.click()
  };
}

const row = id => ({ id, nickname: '<script>', message: 'hello\n<img>', created_at: '2020-01-02T03:04:00Z' });

test('guestbook loads, escapes cards, pages and keeps internals private', async t => {
  const g = await guestbook(t, { rows: Array.from({ length: 15 }, (_, i) => row(i + 1)), count: 16 });
  assert.deepEqual(g.calls[0], { table: 'guestbook', select: ['id, nickname, message, created_at', { count: 'exact' }], order: ['created_at', { ascending: false }], range: [0, 14] });
  assert.equal(g.els['guestbook-list'].children.length, 15);
  assert.match(g.els['guestbook-list'].children[0].innerHTML, /&lt;script&gt;/);
  assert.match(g.els['guestbook-list'].children[0].innerHTML, /hello<br>&lt;img&gt;/);
  assert.equal(g.els['load-more-btn'].style.display, 'inline-flex');
  let finish;
  g.responses.push(new Promise(resolve => { finish = resolve; }));
  g.more();
  g.more();
  assert.equal(g.calls.length, 2);
  assert.deepEqual(g.calls[1].range, [15, 29]);
  assert.equal(g.els['load-more-btn'].disabled, true);
  assert.equal(g.els['load-more-btn'].parts['.btn-text'].style.opacity, '0.5');
  finish({ data: [row(16)], count: 16, error: null });
  await settle();
  assert.equal(g.els['guestbook-list'].children.length, 16);
  assert.equal(g.els['load-more-btn'].style.display, 'none');
  assert.equal(g.els['load-more-btn'].disabled, false);
  for (const key of ['supabaseClient', 'handleFormSubmit', 'loadGuestbookMessages', 'getSupabaseClient']) {
    assert.equal(key in globalThis, false);
    assert.equal(key in window, false);
  }
  assert.equal(g.errors.length, 0);
});

test('guestbook submits once, prepends result and restores/expires cooldown', async t => {
  let now = Date.now();
  t.mock.method(Date, 'now', () => now);
  const g = await guestbook(t);
  assert.equal(g.els['guestbook-empty'].style.display, 'block');
  g.els.nickname.value = ' writer ';
  g.els.message.value = ' message ';
  let finish;
  g.responses.push(new Promise(resolve => { finish = resolve; }));
  const pending = g.submit();
  await g.submit();
  assert.equal(g.calls.length, 2);
  assert.deepEqual(g.calls[1].insert, [{ nickname: 'writer', message: 'message' }]);
  assert.equal(g.els['submit-btn'].disabled, true);
  assert.equal(g.els['submit-btn'].parts['.btn-text'].style.opacity, '0.5');
  finish({ data: [row(42)], error: null });
  await pending;
  assert.equal(g.els['guestbook-list'].children[0].id, 'guestbook-entry-42');
  assert.equal(g.els['total-count'].textContent, 1);
  assert.equal(g.els.nickname.value, '');
  assert.equal(g.els['cooldown-banner'].style.display, 'flex');
  assert.equal(g.els['cooldown-timer'].textContent, 30);
  assert.equal(g.storage.get('guestbook_cooldown_target'), String(now + 30000));
  await g.submit();
  assert.equal(g.calls.length, 2);
  now += 31000;
  for (const tick of g.intervals.values()) tick();
  assert.equal(g.storage.has('guestbook_cooldown_target'), false);
  assert.equal(g.els['cooldown-banner'].style.display, 'none');
  assert.equal(g.els['submit-btn'].disabled, false);
  assert.equal(g.errors.length, 0);
});

test('guestbook restores saved cooldown and blocks invalid input and honeypot', async t => {
  const g = await guestbook(t, { cooldown: 20 });
  assert.equal(g.els['submit-btn'].disabled, true);
  assert.equal(g.els['cooldown-banner'].style.display, 'flex');
  await g.submit();
  assert.equal(g.calls.length, 1);
  g.storage.clear();
  for (const [name, value, other] of [['nickname', '', 'valid'], ['nickname', 'x'.repeat(21), 'valid'], ['message', '', 'valid'], ['message', 'x'.repeat(501), 'valid']]) {
    g.els.nickname.value = name === 'nickname' ? value : other;
    g.els.message.value = name === 'message' ? value : other;
    await g.submit();
    assert.equal(g.els[name].focused, true);
    assert.equal(g.calls.length, 1);
  }
  g.els['honeypot-website'].value = 'bot';
  await g.submit();
  assert.equal(g.els['honeypot-website'].value, '');
  assert.equal(g.calls.length, 1);
});

test('guestbook handles query/insert errors and allows retry', async t => {
  const g = await guestbook(t);
  g.responses.push({ error: new Error('query failed') });
  g.more();
  await settle();
  assert.equal(g.els['load-more-btn'].disabled, false);
  assert.equal(g.els['guestbook-skeleton'].style.display, 'none');
  g.responses.push({ data: [row(1)], count: 1, error: null });
  g.more();
  await settle();
  assert.equal(g.els['guestbook-list'].children.length, 1);
  g.els.nickname.value = 'writer';
  g.els.message.value = 'message';
  g.responses.push({ error: new Error('insert failed') });
  await g.submit();
  assert.equal(g.els['submit-btn'].disabled, false);
  assert.equal(g.storage.size, 0);
  assert.equal(g.els.message.value, 'message');
  g.responses.push({ data: null, error: null });
  await g.submit();
  assert.equal(g.els['guestbook-list'].children.length, 2);
  assert.equal(g.errors.length, 4);
  assert.equal(g.notices.length, 3);
});

test('guestbook reports missing SDK without requests or event binding', async t => {
  const g = await guestbook(t, { sdk: false });
  assert.equal(g.calls.length, 0);
  assert.equal(g.notices.length, 1);
  assert.equal(g.errors.length, 1);
  assert.equal(g.els['guestbook-form'].listeners.submit, undefined);
});
