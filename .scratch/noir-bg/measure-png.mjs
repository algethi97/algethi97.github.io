// measure.mjs 복사본: 최종 PNG images/desk-bg-noir.png의 크기와 화면 네 경계를 재서 measure-png.json에 기록하고
// 최종 PNG 사본을 bg-raster.png로 덮어쓴다. SVG 전용 검사(<rect> 속성·베젤 좌표·XML 파싱·필터)는 뺐고,
// 실사 이미지이므로 화면 중심 주변 평균색을 화면색, 기대 경계 바깥 6px 지점 평균색을 베젤색으로 분류한다.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../..');
const sourcePath = resolve(root, 'images/desk-bg-noir.png');
const expected = { left: 493.0728, top: 224.9931, right: 1177.088, bottom: 596.9704 };
const expectedSize = { width: 1672, height: 941 };
const tolerancePx = 2;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const runtimeErrors = [];
const checks = [];
let chrome, socket, profile, watchdog, cdp, launchError;

try {
  await mkdir(output, { recursive: true });
  const source = await readFile(sourcePath);
  const rasterSize = { width: source.readUInt32BE(16), height: source.readUInt32BE(20) };
  profile = await mkdtemp(resolve(output, 'chrome-profile-'));
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-extensions', '--disable-sync', 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', error => { launchError = error; });
  watchdog = setTimeout(() => { socket?.close(); chrome.kill(); }, 60000);
  const until = async (fn, label) => {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (launchError) throw launchError;
      if (await fn()) return;
      await delay(50);
    }
    throw new Error(`Timed out: ${label}`);
  };
  let port;
  await until(async () => {
    try {
      port = Number((await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
      return port > 0;
    } catch { return false; }
  }, 'Chrome debugger');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
    const receive = pending.get(message.id);
    if (receive) { pending.delete(message.id); receive(message); }
  });
  cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, message => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await cdp('Runtime.enable');
  const pixels = await evaluate(`(async () => {
    const image = new Image();
    image.src = 'data:image/png;base64,${source.toString('base64')}';
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width, height = canvas.height, expected = ${JSON.stringify(expected)};
    const px = (x, y) => { const o = (y * width + x) * 4; return [data[o], data[o + 1], data[o + 2]]; };
    const avg = points => { const s = [0, 0, 0]; points.forEach(([x, y]) => px(x, y).forEach((v, i) => s[i] += v)); return s.map(v => v / points.length); };
    const center = { x: Math.floor((expected.left + expected.right) / 2), y: Math.floor((expected.top + expected.bottom) / 2) };
    const centerPts = []; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) centerPts.push([center.x + dx, center.y + dy]);
    const paper = avg(centerPts);
    const L = Math.floor(expected.left), T = Math.floor(expected.top), R = Math.ceil(expected.right), B = Math.ceil(expected.bottom);
    const bezelPts = [];
    for (let y = T + 20; y < B - 20; y += 4) bezelPts.push([L - 6, y], [R + 5, y]);
    for (let x = L + 20; x < R - 20; x += 4) bezelPts.push([x, T - 6], [x, B + 5]);
    const bezel = avg(bezelPts);
    const distance = (c, k) => c.reduce((sum, value, i) => sum + (value - k[i]) ** 2, 0);
    const isPaper = (x, y) => { const c = px(x, y); return distance(c, paper) < distance(c, bezel); };
    const scan = (axis, fixed) => {
      const horizontal = axis === 'row';
      const limit = horizontal ? width : height;
      const at = value => horizontal ? isPaper(value, fixed) : isPaper(fixed, value);
      let start = horizontal ? center.x : center.y, end = start;
      if (!at(start)) throw new Error('Screen center is not paper colored');
      while (start > 0 && at(start - 1)) start--;
      while (end < limit && at(end)) end++;
      if (start === 0 || end === limit) throw new Error('Paper screen is not bounded by a dark bezel');
      return { axis, fixed, start, end };
    };
    const rows = [.25, .5, .75].map(fraction => scan('row', Math.floor(expected.top + (expected.bottom - expected.top) * fraction)));
    const columns = [.25, .5, .75].map(fraction => scan('column', Math.floor(expected.left + (expected.right - expected.left) * fraction)));
    // 화면 안쪽(경계에서 4px 들인 영역)에서 베젤색에 더 가까운 픽셀(글자·UI 후보)과 화면색에서 크게 벗어난 픽셀을 센다.
    let interior = 0, bezelLike = 0, offPaper = 0, minLuma = 255, maxLuma = 0;
    for (let y = T + 4; y < B - 4; y++) for (let x = L + 4; x < R - 4; x++) {
      const c = px(x, y); interior++;
      if (distance(c, bezel) < distance(c, paper)) bezelLike++;
      if (Math.sqrt(distance(c, paper)) > 24) offPaper++;
      const luma = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      minLuma = Math.min(minLuma, luma); maxLuma = Math.max(maxLuma, luma);
    }
    // 전체 이미지 색상 분포: 채도 0.45 이상·명도 0.35 이상인 픽셀을 색상각으로 빨강(345~15°)과 주황(15~45°) 등으로 나눈다.
    const hues = { red: 0, orange: 0, yellow: 0, other: 0 };
    for (let o = 0; o < data.length; o += 4) {
      const r = data[o] / 255, g = data[o + 1] / 255, b = data[o + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      if (max < 0.35 || d / max < 0.45) continue;
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      if (h >= 345 || h < 15) hues.red++; else if (h < 45) hues.orange++; else if (h < 70) hues.yellow++; else hues.other++;
    }
    return { paper: paper.map(v => +v.toFixed(1)), bezel: bezel.map(v => +v.toFixed(1)), rows, columns,
      interior: { pixels: interior, bezelLike, offPaperOver24: offPaper, minLuma: +minLuma.toFixed(1), maxLuma: +maxLuma.toFixed(1) }, hues };
  })()`);
  const compare = edges => Object.fromEntries(Object.entries(expected).map(([edge, value]) => [edge, {
    actual: edges[edge], expected: value, deltaPx: Number((edges[edge] - value).toFixed(4)),
    passed: Math.abs(edges[edge] - value) <= tolerancePx
  }]));
  const rasterScans = pixels.rows.map((row, index) => ({
    row: row.fixed, column: pixels.columns[index].fixed,
    edges: compare({ left: row.start, right: row.end, top: pixels.columns[index].start, bottom: pixels.columns[index].end })
  }));
  const spread = key => {
    const values = key === 'left' || key === 'right' ? pixels.rows.map(r => key === 'left' ? r.start : r.end) : pixels.columns.map(c => key === 'top' ? c.start : c.end);
    return Math.max(...values) - Math.min(...values);
  };
  const edgeSpreadPx = Object.fromEntries(['left', 'top', 'right', 'bottom'].map(key => [key, spread(key)]));
  await copyFile(sourcePath, resolve(output, 'bg-raster.png'));
  checks.push(
    { name: 'PNG dimensions', passed: rasterSize.width === expectedSize.width && rasterSize.height === expectedSize.height, detail: rasterSize },
    { name: 'Raster screen boundaries within 2px', passed: rasterScans.every(scan => Object.values(scan.edges).every(edge => edge.passed)), detail: rasterScans },
    { name: 'Screen not tilted (edge spread <= 3px)', passed: Object.values(edgeSpreadPx).every(v => v <= 3), detail: edgeSpreadPx },
    { name: 'No bezel-colored (text/UI) pixels inside screen', passed: pixels.interior.bezelLike === 0, detail: pixels.interior },
    { name: 'Chrome runtime', passed: runtimeErrors.length === 0, detail: { runtimeErrors } }
  );
  const browser = await cdp('Browser.getVersion');
  const report = {
    source: 'images/desk-bg-noir.png', sourceBytes: source.length,
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    browser: browser.product, raster: '.scratch/noir-bg/bg-raster.png (byte copy of the final PNG)', rasterSize,
    measurement: {
      method: 'Decode the PNG in a Chrome canvas and scan at 25%, 50%, and 75% of each screen axis. Classify pixels by the nearer squared RGB distance to the screen color (9x9 average around the screen center) or the bezel color (average of points 6px outside the expected boundaries). Right and bottom use the exclusive edge of the screen run.',
      tolerancePx, expected, screenColor: pixels.paper, bezelColor: pixels.bezel, raster: rasterScans, edgeSpreadPx
    },
    saturatedHueCounts: { note: 'Pixels with saturation >= 0.45 and value >= 0.35 grouped by hue: red 345-15, orange 15-45, yellow 45-70 degrees. Informational; orange absence is judged by eye.', ...pixels.hues },
    checks, passed: checks.every(check => check.passed)
  };
  await writeFile(resolve(output, 'measure-png.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf-8' });
  console.log(JSON.stringify({ passed: report.passed, sourceBytes: report.sourceBytes, rasterSize, rasterEdges: rasterScans[1].edges, edgeSpreadPx, interior: pixels.interior, hues: pixels.hues, checks: checks.map(({ name, passed }) => ({ name, passed })) }));
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  process.exitCode = 1;
  const report = { source: 'images/desk-bg-noir.png', passed: false, error: error.stack, runtimeErrors, checks };
  await writeFile(resolve(output, 'measure-png.json'), JSON.stringify(report, null, 2) + '\n', { encoding: 'utf-8' });
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
    const resolvedProfile = resolve(profile);
    assert.ok(resolvedProfile.startsWith(resolve(root, '.scratch/noir-bg') + sep) && basename(resolvedProfile).startsWith('chrome-profile-'), 'Only this run\'s scratch Chrome profile may be removed');
    await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
