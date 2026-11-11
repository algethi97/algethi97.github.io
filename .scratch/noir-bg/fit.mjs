// 1단계 D1=A: images/desk-bg-noir-source.png를 1672×941로 맞추고 화면 네 경계를 재서
// 계획서 조건(각 변 2px 이내 / 배율 0.95~1.08·|sx−sy|/sx ≤ 1%·빈 영역 없음)에 따라 images/desk-bg-noir.png로 저장한다.
// 원본은 읽기만 한다. Chrome 실행·정리 방식은 measure.mjs를 따른다.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../..');
const sourcePath = resolve(root, 'images/desk-bg-noir-source.png');
const targetPath = resolve(root, 'images/desk-bg-noir.png');
const expected = { left: 493.0728, top: 224.9931, right: 1177.088, bottom: 596.9704 };
const size = { width: 1672, height: 941 };
const tolerancePx = 2;
const tiltLimitPx = 3;
const delay = ms => new Promise(r => setTimeout(r, ms));
const runtimeErrors = [];
let chrome, socket, profile, watchdog, cdp, launchError;

// 실사용 경계 스캔: 화면 중심 주변 평균색을 화면색, 기대 경계 바깥 6px 지점 평균색을 베젤색으로 삼는다.
const scanSource = `(data, width, height, expected) => {
  const px = (x, y) => { const o = (y * width + x) * 4; return [data[o], data[o + 1], data[o + 2]]; };
  const avg = points => { const s = [0, 0, 0]; points.forEach(([x, y]) => px(x, y).forEach((v, i) => s[i] += v)); return s.map(v => v / points.length); };
  const cx = Math.floor((expected.left + expected.right) / 2), cy = Math.floor((expected.top + expected.bottom) / 2);
  const centerPts = []; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) centerPts.push([cx + dx, cy + dy]);
  const screenColor = avg(centerPts);
  const L = Math.floor(expected.left), T = Math.floor(expected.top), R = Math.ceil(expected.right), B = Math.ceil(expected.bottom);
  const bezelPts = [];
  for (let y = T + 20; y < B - 20; y += 4) bezelPts.push([L - 6, y], [R + 5, y]);
  for (let x = L + 20; x < R - 20; x += 4) bezelPts.push([x, T - 6], [x, B + 5]);
  const bezelColor = avg(bezelPts);
  const dist = (c, k) => c.reduce((s, v, i) => s + (v - k[i]) ** 2, 0);
  const isScreen = (x, y) => { const c = px(x, y); return dist(c, screenColor) < dist(c, bezelColor); };
  const scan = (axis, fixed) => {
    const horizontal = axis === 'row', limit = horizontal ? width : height;
    const at = v => horizontal ? isScreen(v, fixed) : isScreen(fixed, v);
    let start = horizontal ? cx : cy, end = start;
    if (!at(start)) throw new Error('Screen center is not screen colored');
    while (start > 0 && at(start - 1)) start--;
    while (end < limit && at(end)) end++;
    if (start === 0 || end === limit) throw new Error('Screen is not bounded by a dark bezel');
    return { axis, fixed, start, end };
  };
  const rows = [.25, .5, .75].map(f => scan('row', Math.floor(expected.top + (expected.bottom - expected.top) * f)));
  const columns = [.25, .5, .75].map(f => scan('column', Math.floor(expected.left + (expected.right - expected.left) * f)));
  return { screenColor: screenColor.map(v => +v.toFixed(1)), bezelColor: bezelColor.map(v => +v.toFixed(1)), rows, columns };
}`;

try {
  const source = await readFile(sourcePath);
  const sourceSize = { width: source.readUInt32BE(16), height: source.readUInt32BE(20) };
  profile = await mkdtemp(resolve(output, 'chrome-profile-'));
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-extensions', '--disable-sync', 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', e => { launchError = e; });
  watchdog = setTimeout(() => { socket?.close(); chrome.kill(); }, 60000);
  const until = async (fn, label) => {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) { if (launchError) throw launchError; if (await fn()) return; await delay(50); }
    throw new Error(`Timed out: ${label}`);
  };
  let port;
  await until(async () => {
    try { port = Number((await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); return port > 0; }
    catch { return false; }
  }, 'Chrome debugger');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  let nextId = 0; const pending = new Map();
  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.method === 'Runtime.exceptionThrown') runtimeErrors.push(m.params.exceptionDetails);
    const r = pending.get(m.id); if (r) { pending.delete(m.id); r(m); }
  });
  cdp = (method, params = {}) => new Promise((ok, fail) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); fail(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, m => { clearTimeout(timer); m.error ? fail(new Error(JSON.stringify(m.error))) : ok(m.result); });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  await cdp('Runtime.enable');

  // (1) 균일 비율 맞춤(cover, 가운데 기준 자르기) 후 (2) 경계 측정
  const fitted = await evaluate(`(async () => {
    const image = new Image();
    image.src = 'data:image/png;base64,${source.toString('base64')}';
    await image.decode();
    const W = ${size.width}, H = ${size.height};
    const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
    const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);
    window.__fitted = canvas;
    const { data } = ctx.getImageData(0, 0, W, H);
    const scan = (${scanSource})(data, W, H, ${JSON.stringify(expected)});
    return { coverScale: scale, scan };
  })()`);

  const edgesOf = s => ({
    left: Math.min(...s.rows.map(r => r.start)), right: Math.max(...s.rows.map(r => r.end)),
    top: Math.min(...s.columns.map(c => c.start)), bottom: Math.max(...s.columns.map(c => c.end))
  });
  const spread = s => ({
    left: Math.max(...s.rows.map(r => r.start)) - Math.min(...s.rows.map(r => r.start)),
    right: Math.max(...s.rows.map(r => r.end)) - Math.min(...s.rows.map(r => r.end)),
    top: Math.max(...s.columns.map(c => c.start)) - Math.min(...s.columns.map(c => c.start)),
    bottom: Math.max(...s.columns.map(c => c.end)) - Math.min(...s.columns.map(c => c.end))
  });
  const compare = e => Object.fromEntries(Object.entries(expected).map(([k, v]) => [k, { actual: e[k], expected: v, deltaPx: +(e[k] - v).toFixed(4), passed: Math.abs(e[k] - v) <= tolerancePx }]));
  const measured = edgesOf(fitted.scan);
  const tilt = spread(fitted.scan);
  const comparison = compare(measured);
  const tilted = Object.values(tilt).some(v => v > tiltLimitPx);
  const report = { source: 'images/desk-bg-noir-source.png', sourceSize, coverScale: fitted.coverScale, scan: fitted.scan, measured, edgeSpreadPx: tilt, tilted, comparison, runtimeErrors };

  if (tilted) {
    report.decision = 'stop: screen tilted (edge spread > 3px)';
  } else if (Object.values(comparison).every(e => e.passed)) {
    // (3) 네 변이 2px 이내면 그대로 저장. 원본이 이미 1672×941이면 무손실 그대로 복사한다.
    if (sourceSize.width === size.width && sourceSize.height === size.height) {
      await copyFile(sourcePath, targetPath);
      report.decision = 'saved: within tolerance, source already 1672x941, copied byte-for-byte';
    } else {
      const b64 = await evaluate(`window.__fitted.toDataURL('image/png').split(',')[1]`);
      await writeFile(targetPath, Buffer.from(b64, 'base64'));
      report.decision = 'saved: within tolerance after cover fit';
    }
  } else {
    // (4) 배율 조건 확인 후 균일 확대·이동
    const sx = 684.0152 / (measured.right - measured.left), sy = 371.9773 / (measured.bottom - measured.top);
    const s = (sx + sy) / 2;
    const dx = expected.left - measured.left * s, dy = expected.top - measured.top * s;
    const gaps = { left: Math.max(0, dx), top: Math.max(0, dy), right: Math.max(0, size.width - (dx + size.width * s)), bottom: Math.max(0, size.height - (dy + size.height * s)) };
    report.rescale = { sx, sy, s, relDiff: Math.abs(sx - sy) / sx, dx, dy, gapsPx: gaps };
    const ok = report.rescale.relDiff <= 0.01 && [sx, sy].every(v => v >= 0.95 && v <= 1.08) && Object.values(gaps).every(g => g === 0);
    if (!ok) report.decision = 'stop: rescale conditions not met';
    else {
      const b64 = await evaluate(`(() => {
        const c = document.createElement('canvas'); c.width = ${size.width}; c.height = ${size.height};
        const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(window.__fitted, ${dx}, ${dy}, ${size.width * s}, ${size.height * s});
        return c.toDataURL('image/png').split(',')[1];
      })()`);
      await writeFile(targetPath, Buffer.from(b64, 'base64'));
      report.decision = 'saved: uniformly rescaled and shifted';
    }
  }
  await writeFile(resolve(output, 'fit.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf-8' });
  console.log(JSON.stringify({ decision: report.decision, measured, tilt, comparison, screenColor: fitted.scan.screenColor, bezelColor: fitted.scan.bezelColor, rescale: report.rescale }));
  if (!report.decision.startsWith('saved')) process.exitCode = 2;
} catch (error) {
  process.exitCode = 1;
  console.error(error.stack);
} finally {
  clearTimeout(watchdog);
  if (socket?.readyState === WebSocket.OPEN && cdp) await cdp('Browser.close').catch(() => {});
  socket?.close();
  if (chrome?.pid && chrome.exitCode === null) {
    await Promise.race([once(chrome, 'exit'), delay(3000)]);
    if (chrome.exitCode === null) { chrome.kill(); await Promise.race([once(chrome, 'exit'), delay(3000)]); }
  }
  if (profile) {
    const p = resolve(profile);
    assert.ok(p.startsWith(resolve(root, '.scratch/noir-bg') + sep) && basename(p).startsWith('chrome-profile-'));
    await rm(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
