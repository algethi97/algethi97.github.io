import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../..');
const sourcePath = resolve(root, 'images/desk-bg-noir.svg');
const expected = { left: 493.0728, top: 224.9931, right: 1177.088, bottom: 596.9704 };
const expectedSize = { width: 1672, height: 941 };
const tolerancePx = 2;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const runtimeErrors = [];
const checks = [];
let chrome, socket, profile, watchdog, cdp, launchError;

try {
  await mkdir(output, { recursive: true });
  const source = await readFile(sourcePath, 'utf8');
  profile = await mkdtemp(resolve(output, 'chrome-profile-'));
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-extensions', '--disable-sync', 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', error => { launchError = error; });
  watchdog = setTimeout(() => { socket?.close(); chrome.kill(); }, 45000);
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
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 8000);
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
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { ...expectedSize, deviceScaleFactor: 1, mobile: false });
  const navigation = await cdp('Page.navigate', { url: pathToFileURL(sourcePath).href });
  assert.equal(navigation.errorText, undefined, 'SVG navigation must succeed');
  await until(() => evaluate(`document.readyState === 'complete' && location.href === ${JSON.stringify(pathToFileURL(sourcePath).href)}`), 'SVG ready');
  const svg = await evaluate(`(() => {
    const xml = new DOMParser().parseFromString(${JSON.stringify(source)}, 'image/svg+xml');
    const node = xml.documentElement;
    const rects = [...xml.querySelectorAll('rect')];
    const screen = rects.find(rect => rect.getAttribute('fill') === '#faf8f4');
    const bezel = rects.find(rect => rect.getAttribute('x') === '484' && rect.getAttribute('y') === '216');
    const bounds = rect => rect ? Object.fromEntries(['x','y','width','height'].map(key => [key, Number(rect.getAttribute(key))])) : null;
    return {
      parseErrors: [...xml.querySelectorAll('parsererror')].map(node => node.textContent),
      renderedParseErrors: [...document.querySelectorAll('parsererror')].map(node => node.textContent),
      width: Number(node.getAttribute('width')), height: Number(node.getAttribute('height')),
      viewBox: node.getAttribute('viewBox'), screen: bounds(screen), bezel: bounds(bezel),
      prohibitedElements: [...xml.querySelectorAll('text, script, image, foreignObject')].map(node => node.localName),
      externalReferences: [...xml.querySelectorAll('*')].flatMap(node => [...node.attributes])
        .filter(attribute => /href$/i.test(attribute.name) && !attribute.value.startsWith('#')).map(attribute => attribute.value),
      filterPrimitives: [...xml.querySelectorAll('filter > *')].map(node => node.localName)
    };
  })()`);
  assert.equal(svg.parseErrors.length + svg.renderedParseErrors.length, 0, 'Chrome XML parser must accept the SVG');
  assert.ok(svg.screen, 'The paper screen rect must exist');
  const svgEdges = { left: svg.screen.x, top: svg.screen.y, right: svg.screen.x + svg.screen.width, bottom: svg.screen.y + svg.screen.height };
  const compare = edges => Object.fromEntries(Object.entries(expected).map(([edge, value]) => [edge, {
    actual: edges[edge], expected: value, deltaPx: Number((edges[edge] - value).toFixed(4)),
    passed: Math.abs(edges[edge] - value) <= tolerancePx
  }]));
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, ...expectedSize, scale: 1 }
  });
  const raster = Buffer.from(data, 'base64');
  await writeFile(resolve(output, 'bg-raster.png'), raster);
  const rasterSize = { width: raster.readUInt32BE(16), height: raster.readUInt32BE(20) };
  const pixels = await evaluate(`(async () => {
    const image = new Image();
    image.src = ${JSON.stringify('data:image/png;base64,' + data)};
    await image.decode();
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const paper = [250, 248, 244], bezel = [20, 20, 20];
    const distance = (offset, color) => color.reduce((sum, value, i) => sum + (data[offset + i] - value) ** 2, 0);
    const isPaper = (x, y) => {
      const offset = (y * canvas.width + x) * 4;
      return distance(offset, paper) < distance(offset, bezel);
    };
    const center = { x: Math.floor((${expected.left} + ${expected.right}) / 2), y: Math.floor((${expected.top} + ${expected.bottom}) / 2) };
    const scan = (axis, fixed) => {
      const horizontal = axis === 'row';
      const limit = horizontal ? canvas.width : canvas.height;
      const at = value => horizontal ? isPaper(value, fixed) : isPaper(fixed, value);
      let start = horizontal ? center.x : center.y, end = start;
      if (!at(start)) throw new Error('Screen center is not paper colored');
      while (start > 0 && at(start - 1)) start--;
      while (end < limit && at(end)) end++;
      if (start === 0 || end === limit) throw new Error('Paper screen is not bounded by a dark bezel');
      return { axis, fixed, start, end };
    };
    const rows = [.25, .5, .75].map(fraction => scan('row', Math.floor(${expected.top} + (${expected.bottom} - ${expected.top}) * fraction)));
    const columns = [.25, .5, .75].map(fraction => scan('column', Math.floor(${expected.left} + (${expected.right} - ${expected.left}) * fraction)));
    let blankPixels = 0, otherPixels = 0;
    for (let y = Math.ceil(${expected.top}) + 1; y < Math.floor(${expected.bottom}) - 1; y++) {
      for (let x = Math.ceil(${expected.left}) + 1; x < Math.floor(${expected.right}) - 1; x++) {
        const offset = (y * canvas.width + x) * 4;
        if (paper.every((value, i) => data[offset + i] === value) && data[offset + 3] === 255) blankPixels++;
        else otherPixels++;
      }
    }
    return { rows, columns, blankInterior: { blankPixels, otherPixels } };
  })()`);
  const rasterScans = pixels.rows.map((row, index) => ({
    row: row.fixed, column: pixels.columns[index].fixed,
    edges: compare({ left: row.start, right: row.end, top: pixels.columns[index].start, bottom: pixels.columns[index].end })
  }));
  const svgComparison = compare(svgEdges);
  checks.push(
    { name: 'SVG and raster dimensions', passed: svg.width === 1672 && svg.height === 941 && svg.viewBox === '0 0 1672 941' && rasterSize.width === 1672 && rasterSize.height === 941, detail: { svg: { width: svg.width, height: svg.height, viewBox: svg.viewBox }, raster: rasterSize } },
    { name: 'SVG screen boundaries within 2px', passed: Object.values(svgComparison).every(edge => edge.passed), detail: svgComparison },
    { name: 'Approved bezel coordinates', passed: svg.bezel?.x === 484 && svg.bezel?.y === 216 && svg.bezel?.width === 702 && svg.bezel?.height === 390, detail: svg.bezel },
    { name: 'Raster screen boundaries within 2px', passed: rasterScans.every(scan => Object.values(scan.edges).every(edge => edge.passed)), detail: rasterScans },
    { name: 'Blank paper screen', passed: pixels.blankInterior.blankPixels > 0 && pixels.blankInterior.otherPixels === 0, detail: pixels.blankInterior },
    { name: 'Self-contained static SVG', passed: svg.prohibitedElements.length === 0 && svg.externalReferences.length === 0 && svg.filterPrimitives.every(name => name === 'feGaussianBlur'), detail: { prohibitedElements: svg.prohibitedElements, externalReferences: svg.externalReferences, filterPrimitives: svg.filterPrimitives } },
    { name: 'Chrome XML parsing and runtime', passed: svg.parseErrors.length + svg.renderedParseErrors.length + runtimeErrors.length === 0, detail: { xmlErrors: svg.parseErrors, renderedXmlErrors: svg.renderedParseErrors, runtimeErrors } }
  );
  const browser = await cdp('Browser.getVersion');
  const report = {
    source: 'images/desk-bg-noir.svg', sourceBytes: Buffer.byteLength(source),
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    sizeGoal: { description: 'Provisional target of 60KB or less; exceeding it requires explanation, not rejection.', bytes: Buffer.byteLength(source) },
    syntaxValidation: 'xmllint and common Node XML parsers are unavailable; Chrome DOMParser and error-free raster rendering substitute as permitted by stage 1.',
    browser: browser.product, raster: '.scratch/noir-bg/bg-raster.png', rasterSize,
    measurement: {
      method: 'Scan the captured PNG at 25%, 50%, and 75% of each screen axis. Classify pixels by the nearer squared RGB distance to paper #faf8f4 or bezel #141414. Right and bottom use the exclusive edge of the paper run.',
      tolerancePx, expected, svg: svgComparison, raster: rasterScans
    },
    checks, passed: checks.every(check => check.passed)
  };
  await writeFile(resolve(output, 'measure.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ passed: report.passed, sourceBytes: report.sourceBytes, rasterSize, rasterEdges: rasterScans[1].edges, checks: checks.map(({ name, passed }) => ({ name, passed })) }));
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  process.exitCode = 1;
  const report = { source: 'images/desk-bg-noir.svg', passed: false, error: error.stack, runtimeErrors, checks };
  await writeFile(resolve(output, 'measure.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
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
