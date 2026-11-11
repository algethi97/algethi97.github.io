import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const b = readFileSync('images/desk-bg-noir.png');
let p = 8, w, h, bd, ct, idat = [];
while (p < b.length) {
  const len = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
  if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; }
  if (t === 'IDAT') idat.push(d);
  p += 12 + len;
}
const ch = { 2: 3, 6: 4, 0: 1 }[ct], bpp = ch * bd / 8, stride = w * bpp;
const raw = inflateSync(Buffer.concat(idat));
const img = Buffer.alloc(h * stride);
for (let y = 0; y < h; y++) {
  const f = raw[y * (stride + 1)], o = y * (stride + 1) + 1;
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? img[y * stride + x - bpp] : 0, up = y ? img[(y - 1) * stride + x] : 0, c = x >= bpp && y ? img[(y - 1) * stride + x - bpp] : 0;
    let v = raw[o + x];
    if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
    else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
    img[y * stride + x] = v & 255;
  }
}
const avg = (y0, y1) => { const s = [0, 0, 0]; let n = 0; for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) { for (let k = 0; k < 3; k++) s[k] += img[y * stride + x * bpp + k]; n++; } return s.map(v => +(v / n).toFixed(1)); };
console.log(JSON.stringify({ w, h, bd, ct, bottomRow: avg(h - 1, h), bottom5: avg(h - 5, h), bottom30: avg(h - 30, h) }));
const px = (x, y) => [0, 1, 2].map(k => img[y * stride + x * bpp + k]);
console.log(JSON.stringify([200, 500, 836, 1100, 1400, 1650].map(x => [x, px(x, h - 1), px(x, h - 20), px(x, h - 40)])));
