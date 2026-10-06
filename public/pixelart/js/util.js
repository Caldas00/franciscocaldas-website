'use strict';
/* Shared constants, math helpers and the Path primitive every mover follows. */

const W = 480, H = 270; // world (map) size
const PW = 120, CW = W + PW; // flight-strip panel width, minimum canvas width
const TAU = Math.PI * 2;

// Live screen layout, recomputed by layout() in main.js whenever the window changes.
// The canvas is SCR.w x SCR.h art pixels; the map fills x < SCR.mapW and shows the world
// rectangle VIEW (world coordinates, the airport itself spans 0..W x 0..H).
const SCR = { w: CW, h: H, mapW: W, scale: 1 };
const VIEW = { x: 0, y: 0, w: W, h: H };

const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const moveTo = (v, target, step) => (v < target ? Math.min(target, v + step) : Math.max(target, v - step));
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const wrapAngle = (a) => {
  a %= TAU;
  if (a > Math.PI) a -= TAU;
  else if (a < -Math.PI) a += TAU;
  return a;
};
const angDiff = (a, b) => wrapAngle(b - a);
const fmtTime = (s) => {
  const t = Math.max(0, Math.ceil(s));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
};

// Small deterministic RNG so the scenery looks the same on every load.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless hash noise keyed by world coordinates, so the countryside is identical at any
// window size (a sequential RNG would shift with the size of the painted area).
function hash2(x, y, seed = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function hashNoise(cell, seed) {
  return (x, y) => {
    const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy);
    const tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(hash2(ix, iy, seed), hash2(ix + 1, iy, seed), sx),
      lerp(hash2(ix, iy + 1, seed), hash2(ix + 1, iy + 1, seed), sx), sy);
  };
}

function hex2rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2css(c, a = 1) {
  const r = c[0] | 0, g = c[1] | 0, b = c[2] | 0;
  return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
}
function mixRgb(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function shadeHex(hex, f) {
  return rgb2css(hex2rgb(hex).map((v) => clamp(v * f, 0, 255)));
}
// keys: [[x, [r,g,b]], ...] sorted by x
function rampRgb(keys, x) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (x <= keys[i][0]) {
      const [x0, c0] = keys[i - 1], [x1, c1] = keys[i];
      return mixRgb(c0, c1, (x - x0) / (x1 - x0));
    }
  }
  return keys[keys.length - 1][1];
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}

// ---------------------------------------------------------------------------
// Path: a densely sampled polyline with arc-length lookup.
// ---------------------------------------------------------------------------
const LAT_ACC = 4; // px/s^2 of sideways acceleration allowed when taxiing through a turn

class Path {
  constructor(pts, closed = false) {
    const p = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const q = p[p.length - 1];
      if (Math.hypot(pts[i].x - q.x, pts[i].y - q.y) > 0.05) p.push(pts[i]);
    }
    if (closed) {
      const a = p[0], b = p[p.length - 1];
      if (Math.hypot(a.x - b.x, a.y - b.y) > 0.05) p.push({ x: a.x, y: a.y });
      else p[p.length - 1] = { x: a.x, y: a.y };
    }
    this.pts = p;
    this.closed = closed;
    this.cum = new Float64Array(p.length);
    for (let i = 1; i < p.length; i++) {
      this.cum[i] = this.cum[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    }
    this.length = this.cum[p.length - 1];
    this.vlim = null;
  }

  wrap(s) {
    if (this.closed) return ((s % this.length) + this.length) % this.length;
    return clamp(s, 0, this.length);
  }

  index(s) {
    const c = this.cum;
    let lo = 0, hi = c.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (c[m] <= s) lo = m;
      else hi = m;
    }
    return lo;
  }

  pos(s) {
    s = this.wrap(s);
    const i = this.index(s), p = this.pts, c = this.cum;
    const j = Math.min(i + 1, p.length - 1);
    const seg = c[j] - c[i], t = seg > 0 ? (s - c[i]) / seg : 0;
    return { x: p[i].x + (p[j].x - p[i].x) * t, y: p[i].y + (p[j].y - p[i].y) * t };
  }

  heading(s) {
    let a = s - 1.5, b = s + 1.5;
    if (!this.closed) {
      if (a < 0) { a = 0; b = Math.min(this.length, 3); }
      if (b > this.length) { b = this.length; a = Math.max(0, b - 3); }
    }
    const p = this.pos(a), q = this.pos(b);
    return Math.atan2(q.y - p.y, q.x - p.x);
  }

  // Closest arc-length position to a point (used to find join/exit points on loops).
  nearest(x, y) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < this.pts.length; i++) {
      const d = Math.hypot(this.pts[i].x - x, this.pts[i].y - y);
      if (d < bd) { bd = d; best = this.cum[i]; }
    }
    return best;
  }

  // First arc-length position where pred(point) holds.
  find(pred, from = 0) {
    for (let i = 0; i < this.pts.length; i++) {
      if (this.cum[i] >= from && pred(this.pts[i])) return this.cum[i];
    }
    return this.length;
  }

  // Max speed at s that still lets a mover brake (decel b) for every turn ahead.
  turnLimit(s, b) {
    if (!this.vlim) {
      this.vlim = new Float32Array(this.pts.length);
      for (let i = 0; i < this.pts.length; i++) {
        const k = Math.abs(angDiff(this.heading(this.cum[i] - 3), this.heading(this.cum[i] + 3))) / 6;
        this.vlim[i] = k > 1e-3 ? Math.sqrt(LAT_ACC / k) : 99;
      }
    }
    let lim = 99;
    for (let i = this.index(s); i < this.pts.length; i++) {
      const d = this.cum[i] - s;
      if (d > 45) break;
      lim = Math.min(lim, Math.sqrt(this.vlim[i] * this.vlim[i] + 2 * b * Math.max(0, d)));
    }
    return lim;
  }
}

class PathBuilder {
  constructor(x, y) {
    this.pts = [{ x, y }];
  }
  get end() {
    return this.pts[this.pts.length - 1];
  }
  line(x, y) {
    const e = this.end;
    const n = Math.max(1, Math.ceil(Math.hypot(x - e.x, y - e.y) / 2));
    for (let i = 1; i <= n; i++) this.pts.push({ x: e.x + ((x - e.x) * i) / n, y: e.y + ((y - e.y) * i) / n });
    return this;
  }
  arc(cx, cy, r, a0, a1) {
    const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / 2));
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      this.pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    return this;
  }
  quad(cx, cy, x, y) {
    const e = this.end;
    const n = Math.max(4, Math.ceil((Math.hypot(cx - e.x, cy - e.y) + Math.hypot(x - cx, y - cy)) / 2));
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      this.pts.push({ x: u * u * e.x + 2 * u * t * cx + t * t * x, y: u * u * e.y + 2 * u * t * cy + t * t * y });
    }
    return this;
  }
  // Polyline through nodes [[x, y, radius?], ...] with every corner rounded off.
  through(nodes, radius) {
    let prev = { x: this.end.x, y: this.end.y };
    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = nodes[i];
      const next = nodes[i + 1];
      if (!next) {
        this.line(x, y);
        break;
      }
      const r0 = nodes[i][2] !== undefined ? nodes[i][2] : radius;
      const d1 = Math.hypot(x - prev.x, y - prev.y), d2 = Math.hypot(next[0] - x, next[1] - y);
      const r = Math.min(r0, d1 / 2, d2 / 2);
      if (r < 0.5 || d1 < 1e-6 || d2 < 1e-6) {
        this.line(x, y);
      } else {
        const ax = x - ((x - prev.x) / d1) * r, ay = y - ((y - prev.y) / d1) * r;
        const bx = x + ((next[0] - x) / d2) * r, by = y + ((next[1] - y) / d2) * r;
        this.line(ax, ay).quad(x, y, bx, by);
      }
      prev = { x, y };
    }
    return this;
  }
  build(closed = false) {
    return new Path(this.pts, closed);
  }
}

function roundedPath(nodes, radius) {
  return new PathBuilder(nodes[0][0], nodes[0][1]).through(nodes.slice(1), radius).build();
}
