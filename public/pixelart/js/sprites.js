'use strict';
/* Aircraft sprites, drawn pointing east and pre-rotated into NDIR headings.
   Legend: w body, s body shade, t tail/livery, e engine, g wing, G wing edge,
           d dark detail, c cockpit glass, p/q propeller blur (alternating frames). */

const NDIR = 64;
const dirIndex = (a) => ((Math.round((a / TAU) * NDIR) % NDIR) + NDIR) % NDIR;

const LIVERIES = [
  { code: 'SKY', body: '#f2f4f7', tail: '#2d6cdf', engine: '#2d6cdf' },
  { code: 'RDX', body: '#f2f4f7', tail: '#d63a3a', engine: '#8a8f99' },
  { code: 'SUN', body: '#f2f4f7', tail: '#f39a1f', engine: '#f39a1f' },
  { code: 'FRS', body: '#f2f4f7', tail: '#2f9e57', engine: '#8a8f99' },
  { code: 'NVY', body: '#dde2ea', tail: '#1f2f6b', engine: '#1f2f6b' },
  { code: 'LMN', body: '#f5d33b', tail: '#2a3d8f', engine: '#2a3d8f' },
  { code: 'VIO', body: '#f2f4f7', tail: '#7d3cc9', engine: '#7d3cc9' },
  { code: 'TQS', body: '#f2f4f7', tail: '#17a3a3', engine: '#8a8f99' },
];
const CARGO_LIVERY = { code: 'CRG', body: '#d5d8dd', tail: '#7a5230', engine: '#7a5230' };
const GA_LIVERIES = [
  { code: 'GA', body: '#f4f4f4', tail: '#c0392b', engine: '#c0392b' },
  { code: 'GA', body: '#f4f4f4', tail: '#2e6fd0', engine: '#2e6fd0' },
  { code: 'GA', body: '#f6e7b0', tail: '#2c8a4b', engine: '#2c8a4b' },
];

const JET_TOP = [
  '.......................',
  '.....Ggg...............',
  '.....Gggg..............',
  '.....Ggggg.............',
  '......Ggggg............',
  '......Gggggg...........',
  '.......Gggggeeed.......',
  '.Ggg...Gggggeeed.......',
  '..Ggg...Gggggg.........',
  '..Gggg..Ggggggg........',
];
const JET = [
  ...JET_TOP,
  '..wwwwwwwwwwwwwwwwwcw..',
  '.tttttwwwwwwwwwwwwwcww.',
  '..ssssssssssssssssscs..',
  ...JET_TOP.slice().reverse(),
];

const PROP_TOP = [
  '.................',
  '........Ggg......',
  '........Ggg..p...',
  '........Ggg..q...',
  '........Geeeed...',
  '.Ggg....Ggg..q...',
  '.Ggg....Ggg..p...',
];
const PROP = [
  ...PROP_TOP,
  '.GggwwwwGggwwwcw.',
  '.ttttwwwGggwwwcww',
  '.GggssssGggssscs.',
  ...PROP_TOP.slice().reverse(),
];

const GA_TOP = [
  '......Gg.....',
  '......Gg.....',
  '......Gg.....',
  '.gg...Gg.....',
  '.gg...Gg....d',
  '.ggwwwGgwcw.d',
];
const GA = [...GA_TOP, '.tttwwGgwcwwd', '.ggsssGgscs.d', ...GA_TOP.slice(0, 5).reverse()];

const PLANE_TYPES = {
  jet: { grid: JET, out: 33, nose: 11, wing: [-5, 10], tail: -10, name: 'A320', frames: 1 },
  prop: { grid: PROP, out: 25, nose: 8, wing: [1, 7], tail: -7, name: 'ATR72', frames: 2 },
};

function normGrid(grid) {
  const w = Math.max(...grid.map((r) => r.length));
  return grid.map((r) => r.padEnd(w, '.').slice(0, w));
}

// Rotate a character grid with 4x4 supersampling and a majority vote per output pixel.
function rotMap(grid, angle, out) {
  const h = grid.length, w = grid[0].length;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const cx = w / 2, cy = h / 2, oc = out / 2;
  const map = new Array(out * out).fill(null);
  for (let oy = 0; oy < out; oy++) {
    for (let ox = 0; ox < out; ox++) {
      const cnt = {};
      let opaque = 0, best = null, bestN = 0;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          const dx = ox + (i + 0.5) / 4 - oc, dy = oy + (j + 0.5) / 4 - oc;
          const sx = Math.floor(cos * dx + sin * dy + cx), sy = Math.floor(-sin * dx + cos * dy + cy);
          if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
          const ch = grid[sy][sx];
          if (ch === '.') continue;
          opaque++;
          const n = (cnt[ch] = (cnt[ch] || 0) + 1);
          if (n > bestN) { bestN = n; best = ch; }
        }
      }
      if (opaque >= 6) map[oy * out + ox] = best;
    }
  }
  return map;
}

function makePalette(liv) {
  const rgba = (hex, a = 255) => [...hex2rgb(hex), a];
  const body = hex2rgb(liv.body).map((v) => Math.round(v * 0.8));
  return {
    w: rgba(liv.body), s: [...body, 255], t: rgba(liv.tail), e: rgba(liv.engine),
    g: rgba('#c4c9d2'), G: rgba('#959cab'), d: rgba('#373c48'), c: rgba('#22304a'),
    p: rgba('#e4e8ee', 170), q: rgba('#e4e8ee', 170),
  };
}
const SHADOW_PAL = { w: [0, 0, 0, 255], s: [0, 0, 0, 255], t: [0, 0, 0, 255], e: [0, 0, 0, 255],
  g: [0, 0, 0, 255], G: [0, 0, 0, 255], d: [0, 0, 0, 255], c: [0, 0, 0, 255] };

function paintMap(map, out, pal, frame = 0) {
  const [c, x] = makeCanvas(out, out);
  const img = x.createImageData(out, out);
  for (let i = 0; i < map.length; i++) {
    const ch = map[i];
    if (!ch) continue;
    if ((ch === 'p' && frame === 1) || (ch === 'q' && frame === 0)) continue;
    const col = pal[ch];
    if (col) img.data.set(col, i * 4);
  }
  x.putImageData(img, 0, 0);
  return c;
}

const _spriteCache = new Map();

function initSprites() {
  for (const T of Object.values(PLANE_TYPES)) {
    T.grid = normGrid(T.grid);
    T.maps = [];
    T.shadows = [];
    for (let d = 0; d < NDIR; d++) {
      T.maps[d] = rotMap(T.grid, (d / NDIR) * TAU, T.out);
      T.shadows[d] = paintMap(T.maps[d], T.out, SHADOW_PAL);
    }
  }
  LIVERIES.forEach((l) => (l.pal = makePalette(l)));
}

function planeSprite(type, liv, frame, angle) {
  const d = dirIndex(angle);
  const key = type + '|' + liv + '|' + frame + '|' + d;
  let c = _spriteCache.get(key);
  if (!c) {
    const T = PLANE_TYPES[type];
    c = paintMap(T.maps[d], T.out, LIVERIES[liv].pal, frame);
    _spriteCache.set(key, c);
  }
  return c;
}

function planeShadow(type, angle) {
  return PLANE_TYPES[type].shadows[dirIndex(angle)];
}

// One-off sprite for static scenery (parked cargo jet, light aircraft).
function staticSprite(grid, out, livery, angle) {
  return paintMap(rotMap(normGrid(grid), angle, out), out, makePalette(livery));
}
