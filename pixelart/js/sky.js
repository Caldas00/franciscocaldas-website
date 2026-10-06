'use strict';
/* Time of day, clouds, light glows and small particle effects. */

const TINT_KEYS = [
  [-1.0, [38, 50, 108]],
  [-0.25, [52, 64, 126]],
  [-0.08, [118, 96, 152]],
  [0.05, [250, 172, 128]],
  [0.2, [255, 232, 212]],
  [0.34, [255, 255, 255]],
];

const Sky = {
  t: 0.31, // 0 = midnight, 0.5 = noon
  dayLen: 300, // seconds per in-game day at 1x
  update(dt) {
    this.t = (this.t + dt / this.dayLen) % 1;
  },
  elev() {
    return -Math.cos(this.t * TAU);
  },
  tint() {
    return rampRgb(TINT_KEYS, this.elev());
  },
  night() {
    return 1 - smoothstep(-0.12, 0.14, this.elev());
  },
  day() {
    return smoothstep(-0.2, 0.25, this.elev());
  },
  clock() {
    const m = Math.floor(this.t * 1440);
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  },
};

// --- glows -----------------------------------------------------------------
const _glowCache = new Map();

function glowSprite(col, big) {
  const key = col + (big ? 'B' : 's');
  let c = _glowCache.get(key);
  if (c) return c;
  const R = big ? 6 : 2, size = R * 2 + 1;
  const [cv, x] = makeCanvas(size, size);
  const rgb = hex2rgb(col);
  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      const d = Math.hypot(xx - R, yy - R) / (R + 0.5);
      if (d > 1) continue;
      const a = (Math.ceil((1 - d) * 3) / 3) * (big ? 0.3 : 0.5);
      x.fillStyle = rgb2css(rgb, a);
      x.fillRect(xx, yy, 1, 1);
    }
  }
  x.fillStyle = rgb2css(mixRgb(rgb, [255, 255, 255], 0.5));
  x.fillRect(R, R, 1, 1);
  _glowCache.set(key, cv);
  return cv;
}

function glow(ctx, x, y, col, big = false) {
  const s = glowSprite(col, big), R = (s.width - 1) / 2;
  ctx.drawImage(s, Math.round(x) - R, Math.round(y) - R);
}

// --- clouds ------------------------------------------------------------------
function makeCloud() {
  const w = randi(38, 64), h = randi(16, 24);
  const blobs = [];
  for (let i = 0; i < 7; i++) {
    blobs.push({ x: rand(w * 0.22, w * 0.78), y: rand(h * 0.45, h * 0.62), r: rand(h * 0.22, h * 0.42) });
  }
  const inside = (x, y) => blobs.some((b) => Math.hypot(x - b.x, (y - b.y) * 1.25) < b.r);
  const [img, x] = makeCanvas(w, h);
  const [sh, xs] = makeCanvas(w, h);
  xs.fillStyle = '#000';
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      if (!inside(px + 0.5, py + 0.5)) continue;
      xs.fillRect(px, py, 1, 1);
      x.fillStyle = !inside(px - 1, py - 1.5) ? '#ffffff' : !inside(px + 1.5, py + 2) ? '#c9d3e2' : '#edf1f6';
      x.fillRect(px, py, 1, 1);
    }
  }
  return { img, sh, w, h, x: 0, y: 0, v: rand(2, 4.5) };
}

const Clouds = {
  list: [],
  init() {
    const n = Math.round((5 * VIEW.w * VIEW.h) / (W * H)); // same density on bigger windows
    for (let i = 0; i < n; i++) {
      const c = makeCloud();
      c.x = rand(VIEW.x - 40, VIEW.x + VIEW.w);
      c.y = rand(VIEW.y - 30, VIEW.y + VIEW.h - 70);
      this.list.push(c);
    }
  },
  update(dt) {
    for (const c of this.list) {
      c.x += c.v * dt;
      if (c.x > VIEW.x + VIEW.w + 10) {
        c.x = VIEW.x - c.w - rand(40, 160);
        c.y = rand(VIEW.y - 30, VIEW.y + VIEW.h - 70);
      }
    }
  },
  drawShadows(g, day) {
    g.globalAlpha = 0.14 * day;
    for (const c of this.list) g.drawImage(c.sh, Math.round(c.x + 50), Math.round(c.y + 75));
    g.globalAlpha = 1;
  },
  draw(g) {
    g.globalAlpha = 0.88;
    for (const c of this.list) g.drawImage(c.img, Math.round(c.x), Math.round(c.y));
    g.globalAlpha = 1;
  },
};

// --- particles (tyre smoke, exhaust puffs) -------------------------------------
const Particles = {
  list: [],
  puff(x, y, n, col = '#e9e9e9', vx = -6) {
    for (let i = 0; i < n; i++) {
      this.list.push({
        x: x + rand(-1.5, 1.5), y: y + rand(-1.5, 1.5), vx: vx + rand(-3, 3), vy: rand(-2, 2),
        life: 0, max: rand(0.8, 1.6), col,
      });
    }
  },
  update(dt) {
    for (const p of this.list) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.97;
    }
    this.list = this.list.filter((p) => p.life < p.max);
  },
  draw(g) {
    for (const p of this.list) {
      const f = p.life / p.max, s = f < 0.4 ? 1 : 2;
      g.globalAlpha = 0.75 * (1 - f);
      g.fillStyle = p.col;
      g.fillRect(Math.round(p.x), Math.round(p.y), s, s);
    }
    g.globalAlpha = 1;
  },
};
