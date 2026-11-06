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

function gameElement() {
  const classes = new Set();
  let html = '';
  return {
    style: {}, dataset: {}, children: [], listeners: {}, attrs: {}, textContent: '', value: '', disabled: false, parentNode: null,
    get className() { return [...classes].join(' '); },
    set className(value) { classes.clear(); value.split(/\s+/).filter(Boolean).forEach(x => classes.add(x)); },
    get innerHTML() { return html; },
    set innerHTML(value) { html = value; if (value === '') this.children = []; },
    classList: { add: (...x) => x.forEach(c => classes.add(c)), remove: (...x) => x.forEach(c => classes.delete(c)), contains: x => classes.has(x) },
    addEventListener(name, fn) { (this.listeners[name] ??= []).push(fn); },
    dispatch(name, event = {}) { return Promise.all((this.listeners[name] ?? []).map(fn => fn({ type: name, preventDefault() {}, ...event }))); },
    appendChild(child) {
      for (const kid of child.isFragment ? child.children.splice(0) : [child]) { kid.parentNode = this; this.children.push(kid); }
      return child;
    },
    removeChild(child) { this.children = this.children.filter(x => x !== child); child.parentNode = null; },
    setAttribute(key, value) { this.attrs[key] = value; },
    querySelector(selector) { return this.parts?.[selector] ?? null; },
    focus() { this.focused = true; },
    // 타일은 40px 격자, 그 밖의 요소(보드 컨테이너)는 원점에 둔다
    getBoundingClientRect() {
      const left = Number(this.dataset.col ?? 0) * 40, top = Number(this.dataset.row ?? 0) * 40;
      const size = this.dataset.col === undefined ? 1000 : 40;
      return { left, top, right: left + size, bottom: top + size, width: size, height: size };
    }
  };
}

test('game module plays, judges sums, ranks scores and keeps state private', async t => {
  const now = new Date(2026, 0, 20, 12, 0).getTime();
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now });
  t.mock.method(Math, 'random', () => 0.45); // 모든 타일 값 5
  const els = {};
  const el = id => (els[id] ??= Object.assign(gameElement(), id === 'btn-submit-score' ? { parts: { '.btn-text': gameElement(), '.btn-loader': gameElement() } } : {}));
  const storage = new Map([['mandarin_player_nickname', 'saved']]);
  const calls = [], responses = [], errors = [], windowListeners = {};
  const next = () => Promise.resolve(responses.length ? responses.shift() : { data: [], error: null });
  const client = { from(table) {
    const call = { table, order: [] };
    calls.push(call);
    const query = {
      select(...args) { call.select = args; return call.insert ? next() : query; },
      order(...args) { call.order.push(args); return query; },
      limit(n) { call.limit = n; return next(); },
      insert(values) { call.insert = values; return query; }
    };
    return query;
  } };
  let ready;
  browserGlobals(t, {
    window: { supabase: { createClient: () => client }, addEventListener: (name, fn) => { (windowListeners[name] ??= []).push(fn); } },
    document: {
      getElementById: el,
      querySelector: selector => {
        if (selector === '.timer-box') return el('.timer-box');
        const id = selector.match(/data-record-id="(.+)"/)?.[1];
        return el('top5-list').children.find(li => String(li.dataset.recordId) === id) ?? null;
      },
      createElement: () => gameElement(),
      createDocumentFragment: () => Object.assign(gameElement(), { isFragment: true }),
      addEventListener: (event, fn) => { assert.equal(event, 'DOMContentLoaded'); ready = fn; }
    },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
    requestAnimationFrame: fn => fn(),
    confirm: () => false
  });
  t.mock.method(console, 'error', (...args) => errors.push(args));
  responses.push({ data: [{ id: 7, nickname: '<b>top</b>', score: 30, created_at: new Date(now - 30 * 60000).toISOString() }], error: null });
  await import(new URL('../game.js', import.meta.url));
  ready();
  await settle();

  const board = el('mandarin-board');
  const container = el('board-container');
  const fire = (name, x, y) => name === 'mousedown'
    ? container.dispatch(name, { clientX: x, clientY: y })
    : Promise.all((windowListeners[name] ?? []).map(fn => fn({ type: name, clientX: x, clientY: y, preventDefault() {} })));
  const drag = (x1, y1, x2, y2) => { fire('mousedown', x1, y1); fire('mousemove', x2, y2); return fire('mouseup', x2, y2); };
  const toasts = () => el('game-toast-container').children.map(x => x.textContent);
  const unit = (value, suffix) => `${value}<span class="stat-unit">${suffix}</span>`;

  // 초기화: 보드 사전 생성, Top 5 조회 계약, textContent 렌더링, 닉네임 복원
  assert.equal(board.children.length, 170);
  assert.deepEqual(calls[0], { table: 'mandarin-game_scores', select: ['id, nickname, score, remaining_count, play_time, created_at'], order: [['score', { ascending: false }], ['created_at', { ascending: true }]], limit: 5 });
  const info = el('top5-list').children[0].children[0].children[1];
  assert.equal(info.children[0].textContent, '<b>top</b>');
  assert.equal(info.children[1].textContent, '30분 전');
  assert.equal(el('player-nickname').value, 'saved');
  assert.equal(el('sound-icon').textContent, '🔊');
  for (const key of ['supabaseClient', 'getSupabaseClient', 'soundManager', 'SoundManager', 'score', 'isGameRunning', 'tilesData', 'timeLeft', 'startGame', 'handleScoreSubmit']) {
    assert.equal(key in globalThis, false, key);
    assert.equal(key in window, false, key);
  }

  // 시작 전 드래그는 무시되고, 시작하면 HUD가 초기화된다
  await drag(5, 5, 75, 30);
  assert.equal(el('selection-box').style.display, undefined);
  await el('btn-overlay-start').dispatch('click');
  assert.equal(el('game-start-overlay').style.display, 'none');
  assert.equal(el('btn-action-text').textContent, '🔄 다시 시작');
  assert.equal(el('hud-score').innerHTML, unit(0, '점'));
  assert.equal(el('hud-timer').innerHTML, unit(120, 's'));

  // 합계 10: 두 타일 선택 시 배지 표시 후 수확, 점수·남은 귤·플로팅 점수 갱신
  fire('mousedown', 5, 5);
  fire('mousemove', 75, 30);
  assert.equal(el('sum-badge-val').textContent, '10 ✨');
  assert.equal(el('selection-box').classList.contains('is-ten'), true);
  assert.equal(board.children[0].classList.contains('is-ten'), true);
  await fire('mouseup', 75, 30);
  assert.equal(el('selection-box').style.display, 'none');
  assert.equal(board.children[0].classList.contains('clearing-pop'), true);
  assert.equal(el('hud-score').innerHTML, unit(2, '점'));
  assert.equal(el('hud-remaining').innerHTML, unit(168, '개'));
  assert.equal(container.children.at(-1).textContent, '+2');
  t.mock.timers.tick(300);
  assert.equal(board.children[0].classList.contains('cleared'), true);

  // 합계 15는 흔들림 후 선택 해제, 수확한 타일은 다시 선택되지 않는다
  await drag(85, 5, 195, 30);
  assert.equal(board.children[2].classList.contains('shake-fail'), true);
  t.mock.timers.tick(300);
  assert.equal(board.children[2].classList.contains('shake-fail'), false);
  assert.equal(board.children[2].classList.contains('selected'), false);
  fire('mousedown', 5, 5);
  fire('mousemove', 75, 30);
  assert.equal(el('sum-badge-val').textContent, 0);
  await fire('mouseup', 75, 30);
  assert.equal(el('hud-score').innerHTML, unit(2, '점'));

  // 진행 중 재시작은 확인 창에서 취소하면 유지된다
  await el('btn-start-restart').dispatch('click');
  assert.equal(el('hud-remaining').innerHTML, unit(168, '개'));

  // 사운드 토글은 아이콘·저장값·토스트를 바꾼다
  await el('btn-sound-toggle').dispatch('click');
  assert.equal(el('sound-icon').textContent, '🔇');
  assert.equal(storage.get('mandarin_muted'), 'true');
  assert.equal(toasts().at(-1), '🔇 효과음이 꺼졌습니다.');

  // 타이머: 1초마다 게이지·표시 갱신, 10초 이하 경고, 시간 종료 시 결과 모달
  t.mock.timers.tick(1000);
  assert.equal(el('hud-timer').innerHTML, unit(119, 's'));
  assert.equal(el('timer-gauge-bar').style.width, `${119 / 120 * 100}%`);
  t.mock.timers.tick(110000);
  assert.equal(el('.timer-box').classList.contains('time-warning'), true);
  t.mock.timers.tick(10000);
  assert.equal(el('game-modal').style.display, 'flex');
  assert.equal(el('modal-result-title').textContent, 'TIME OVER!');
  assert.equal(el('modal-final-score').textContent, '2점');
  assert.equal(el('modal-harvested-count').textContent, '2개');
  assert.equal(el('modal-play-time').textContent, '120초');
  assert.equal(el('my-last-score').textContent, '2');
  assert.equal(el('my-last-score-card').style.display, 'block');
  assert.equal(el('btn-action-text').textContent, '🎮 게임 시작');
  await drag(85, 5, 195, 30);
  assert.equal(el('selection-box').style.display, 'none');

  // 점수 등록: 닉네임 검증, 등록 계약, 로딩 상태, Top 5 갱신·하이라이트
  const form = el('score-submit-form');
  el('player-nickname').value = '  ';
  await form.dispatch('submit');
  assert.equal(toasts().at(-1), '닉네임을 1글자 이상 입력해 주세요.');
  el('player-nickname').value = 'x'.repeat(21);
  await form.dispatch('submit');
  assert.equal(toasts().at(-1), '닉네임은 최대 20자까지 가능합니다.');
  assert.equal(calls.length, 1);
  el('player-nickname').value = ' player ';
  let finish;
  responses.push(new Promise(resolve => { finish = resolve; }));
  responses.push({ data: [{ id: 99, nickname: 'player', score: 2, created_at: new Date(now).toISOString() }], error: null });
  const pending = form.dispatch('submit');
  assert.deepEqual(calls[1].insert, [{ nickname: 'player', score: 2, remaining_count: 168, play_time: 120 }]);
  assert.equal(el('btn-submit-score').disabled, true);
  assert.equal(el('btn-submit-score').parts['.btn-text'].style.display, 'none');
  finish({ data: [{ id: 99 }], error: null });
  await pending;
  assert.equal(el('btn-submit-score').disabled, false);
  assert.equal(el('btn-submit-score').parts['.btn-loader'].style.display, 'none');
  assert.equal(storage.get('mandarin_player_nickname'), 'player');
  assert.equal(el('game-modal').style.display, 'none');
  assert.equal(calls[2].limit, 5);
  t.mock.timers.tick(200);
  assert.equal(el('top5-list').children[0].classList.contains('newly-ranked'), true);
  assert.equal(toasts().includes('🎉 player님의 점수(2점)가 명예의 전당에 등록되었습니다!'), true);

  // 같은 게임 재등록·허니팟·쿨다운은 요청 없이 차단된다
  await form.dispatch('submit');
  assert.equal(toasts().at(-1), '이미 이번 게임의 점수가 등록되었습니다. 새 게임에 도전해 보세요!');
  t.mock.method(console, 'warn', () => {});
  el('honeypot-game-website').value = 'bot';
  el('game-modal').style.display = 'flex';
  await form.dispatch('submit');
  assert.equal(el('game-modal').style.display, 'none');
  el('honeypot-game-website').value = '';
  await el('btn-modal-restart').dispatch('click');
  await form.dispatch('submit');
  assert.match(toasts().at(-1), /^도배 방지를 위해 \d+초 후에 다시 시도해 주세요\.$/);
  assert.equal(calls.length, 3);

  // 등록 오류는 알림 후 버튼을 복구한다
  t.mock.timers.tick(10000);
  responses.push({ data: null, error: new Error('insert failed') });
  await form.dispatch('submit');
  assert.equal(calls.length, 4);
  assert.equal(toasts().at(-1), '점수 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  assert.equal(el('btn-submit-score').disabled, false);
  assert.equal(errors.length, 1);
});
