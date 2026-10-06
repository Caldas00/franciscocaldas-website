'use strict';
/* Static scenery, painted into an offscreen canvas covering the visible world (VIEW) and
   repainted when the window size changes. Drawing uses world coordinates via a translated
   context. This file paints the ground; buildings.js adds structures, trees and lights. */

const COL = {
  grass: ['#4d8838', '#55903d', '#5d9843', '#65a049', '#6ea850'],
  asphalt: '#45484f', asphaltDark: '#383b41', asphaltLight: '#52555c',
  twy: '#55585f', twyEdge: '#3c3f45',
  concrete: '#a3a6ac', concreteDark: '#95989f', concreteStain: '#8b8e95',
  white: '#e8ebee', yellow: '#e6c23e', red: '#c8423b',
  road: '#56585e', sidewalk: '#b3b2aa', park: '#5e6167',
  water: '#3d78ad', waterLight: '#6aa2d1', shore: '#c4b383', hedge: '#3d7232',
};

function fillRect(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(x, y, w, h);
}

// Stroke paths with hard pixel edges: draw antialiased, then threshold the alpha.
function crispStroke(g, paths, width, color) {
  const [c, x] = makeCanvas(VIEW.w, VIEW.h);
  x.translate(-VIEW.x, -VIEW.y);
  x.strokeStyle = '#fff';
  x.lineWidth = width;
  x.lineCap = 'square';
  x.lineJoin = 'round';
  for (const p of paths) {
    x.beginPath();
    p.pts.forEach((q, i) => (i ? x.lineTo(q.x + 0.5, q.y + 0.5) : x.moveTo(q.x + 0.5, q.y + 0.5)));
    x.stroke();
  }
  const d = x.getImageData(0, 0, VIEW.w, VIEW.h), [r, gg, b] = hex2rgb(color);
  for (let i = 0; i < d.data.length; i += 4) {
    const on = d.data[i + 3] >= 128;
    d.data[i] = r; d.data[i + 1] = gg; d.data[i + 2] = b; d.data[i + 3] = on ? 255 : 0;
  }
  x.putImageData(d, 0, 0);
  g.drawImage(c, VIEW.x, VIEW.y);
}

// 1px line along a path, optionally dashed.
function plotPath(g, p, color, dash = 0, gap = 0, from = 0, to = p.length) {
  g.fillStyle = color;
  for (let s = from; s <= to; s += 0.5) {
    if (dash && (s - from) % (dash + gap) >= dash) continue;
    const q = p.pos(s);
    g.fillRect(Math.round(q.x), Math.round(q.y), 1, 1);
  }
}

// putImageData ignores the context transform, so this works in canvas pixels and converts.
function paintGrass(g) {
  const n1 = hashNoise(26, 1), n2 = hashNoise(7, 2);
  const pal = COL.grass.map(hex2rgb);
  const img = g.createImageData(VIEW.w, VIEW.h);
  for (let py = 0; py < VIEW.h; py++) {
    for (let px = 0; px < VIEW.w; px++) {
      const x = px + VIEW.x, y = py + VIEW.y;
      let v = n1(x, y) * 0.6 + n2(x, y) * 0.4 + (hash2(x, y, 3) - 0.5) * 0.22;
      if (y > 138 && y < 184 && x > 100 && x < 476) v += (x >> 3) & 1 ? 0.12 : -0.05; // mown runway strip
      const c = pal[clamp(Math.floor(v * pal.length), 0, pal.length - 1)];
      const i = (py * VIEW.w + px) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}

// Fields and woods for whatever the window shows beyond the airport rectangle, laid out on
// a fixed 60x45 grid in world space so they stay put when the window is resized.
function paintCountryside(g) {
  const CWD = 60, CHT = 45;
  const crops = [['#86b44e', '#76a345'], ['#d3bb5c', '#c2a94f'], ['#9a7650', '#86643f'], ['#93c05a', '#80ae4b'], ['#b9c95e', '#a6b552']];
  const trees = [];
  for (let cy = Math.floor(VIEW.y / CHT); cy * CHT < VIEW.y + VIEW.h; cy++) {
    for (let cx = Math.floor(VIEW.x / CWD); cx * CWD < VIEW.x + VIEW.w; cx++) {
      const x = cx * CWD, y = cy * CHT;
      if (x + CWD > 0 && x < W && y + CHT > 0 && y < H) continue; // the airport's own area
      const h = (k) => hash2(cx, cy, k);
      const top = y === 0 ? 22 : y + 3; // keep clear of the landside road
      if (h(1) < 0.55) {
        const [a, b] = crops[Math.floor(h(2) * crops.length)];
        const fx = x + 3, fw = CWD - 6, fh = y + CHT - 3 - top;
        fillRect(g, fx, top, fw, fh, a);
        g.fillStyle = b;
        if (h(3) < 0.5) for (let i = 1; i < fw; i += 3) g.fillRect(fx + i, top, 1, fh);
        else for (let j = 1; j < fh; j += 3) g.fillRect(fx, top + j, fw, 1);
        g.fillStyle = COL.hedge;
        g.fillRect(fx - 1, top - 1, fw + 2, 1);
        g.fillRect(fx - 1, top + fh, fw + 2, 1);
        g.fillRect(fx - 1, top, 1, fh);
        g.fillRect(fx + fw, top, 1, fh);
        for (let k = 0; k < 3; k++) if (h(10 + k) < 0.5) trees.push([fx + Math.floor(h(20 + k) * fw), top - 2, 2]);
      } else {
        const n = 3 + Math.floor(h(4) * 6);
        for (let k = 0; k < n; k++) {
          trees.push([x + 4 + Math.floor(h(30 + k) * (CWD - 8)), top + 2 + Math.floor(h(50 + k) * (y + CHT - top - 6)), h(70 + k) < 0.3 ? 3 : 2]);
        }
      }
    }
  }
  const R = mulberry32(31337);
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, r]) => paintTree(g, x, y, r, R));
}

function paintFields(g, R) {
  const fields = [
    [0, 96, 58, 46, '#86b44e', '#76a345', 'v'],
    [62, 100, 54, 40, '#d3bb5c', '#c2a94f', 'h'],
    [0, 178, 52, 28, '#9a7650', '#86643f', 'h'],
    [56, 184, 66, 22, '#93c05a', '#80ae4b', 'v'],
  ];
  for (const [x, y, w, h, a, b, dir] of fields) {
    fillRect(g, x, y, w, h, a);
    g.fillStyle = b;
    if (dir === 'v') for (let i = 1; i < w; i += 3) g.fillRect(x + i, y, 1, h);
    else for (let j = 1; j < h; j += 3) g.fillRect(x, y + j, w, 1);
    g.fillStyle = COL.hedge;
    g.fillRect(x - 1, y - 1, w + 2, 1);
    g.fillRect(x - 1, y + h, w + 2, 1);
    g.fillRect(x + w, y - 1, 1, h + 2);
    for (let i = 0; i < w; i += 2) if (R() < 0.35) g.fillRect(x + i, y - 2, 2, 1);
  }
}

function paintPond(g) {
  const cx = 30, cy = 238, rx = 24, ry = 11;
  for (let y = cy - ry - 2; y <= cy + ry + 2; y++) {
    for (let x = cx - rx - 2; x <= cx + rx + 2; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d <= 1) fillRect(g, x, y, 1, 1, (x * 2 + y * 5) % 13 === 0 && d < 0.8 ? COL.waterLight : COL.water);
      else if (d <= 1.3) fillRect(g, x, y, 1, 1, COL.shore);
    }
  }
}

function paintRoads(g, R) {
  const x0 = VIEW.x, x1 = VIEW.x + VIEW.w;
  fillRect(g, x0, 4, VIEW.w, 12, COL.road);
  g.fillStyle = '#d9d9d2';
  for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) g.fillRect(x, 9, 4, 1);
  fillRect(g, x0, 3, VIEW.w, 1, '#6b6d72');
  fillRect(g, x0, 16, VIEW.w, 2, COL.sidewalk);
  // car park
  fillRect(g, 140, 20, 56, 26, COL.park);
  fillRect(g, 166, 18, 8, 2, COL.road);
  const carCols = ['#c0392b', '#2e6fd0', '#e8e8e8', '#2c2f36', '#f1c40f', '#7f8c8d', '#27ae60', '#8e44ad'];
  for (const row of [21, 38]) {
    g.fillStyle = '#c9cbcf';
    for (let x = 141; x <= 195; x += 5) g.fillRect(x, row, 1, 6);
    for (let x = 142; x < 194; x += 5) {
      if (R() > 0.7) continue;
      const c = carCols[Math.floor(R() * carCols.length)];
      fillRect(g, x, row + 1, 3, 5, c);
      fillRect(g, x, row + (row < 30 ? 4 : 1), 3, 1, '#1d2430');
    }
  }
}

function paintAirfield(g, R) {
  const P = (nodes, r = 10) => roundedPath(nodes, r);
  const hsLine = P([[HS_EXIT[0][0] - 28, RWY.y], ...HS_EXIT.map(([x, y]) => [x, y]), [HS_EXIT[1][0] + 36, TWY_Y]], 18);
  const twys = [
    P([[HOLD_X, TWY_Y], [EAST_X, TWY_Y]]),
    P([[HOLD_X, TWY_Y], [HOLD_X, RWY.y]]),
    hsLine,
    P([[EAST_X, RWY.y], [EAST_X, LANE_Y + 6]]),
    P([[WEST_X, LANE_Y + 6], [WEST_X, TWY_Y]]),
    P([[380, RWY.y], [380, 190]]),
  ];
  crispStroke(g, twys, 9, COL.twyEdge);
  crispStroke(g, twys, 7, COL.twy);

  // aprons (passenger + cargo) with slab joints and stains
  for (const [x, y, w, h] of [[236, 57, 222, 54], [300, 186, 172, 38]]) {
    fillRect(g, x, y, w, h, COL.concrete);
    g.fillStyle = COL.concreteDark;
    for (let i = x + 11; i < x + w; i += 12) g.fillRect(i, y, 1, h);
    for (let j = y + 9; j < y + h; j += 10) g.fillRect(x, j, w, 1);
    g.fillStyle = COL.concreteStain;
    for (let k = 0; k < w * h * 0.02; k++) g.fillRect(x + Math.floor(R() * w), y + Math.floor(R() * h), 1, 1);
  }

  // runway with texture and rubber deposits
  const ry0 = RWY.y - RWY.hw, rw = RWY.x1 - RWY.x0 + 1, rh = RWY.hw * 2 + 1;
  fillRect(g, RWY.x0, ry0, rw, rh, COL.asphalt);
  for (let k = 0; k < 700; k++) {
    fillRect(g, RWY.x0 + Math.floor(R() * rw), ry0 + Math.floor(R() * rh), 1, 1,
      R() < 0.5 ? COL.asphaltDark : COL.asphaltLight);
  }
  g.fillStyle = '#33353a';
  for (let k = 0; k < 160; k++) {
    const x = TD_X + Math.floor(R() * R() * 90), y = RWY.y + (R() < 0.5 ? -3 : 3) + Math.floor(R() * 2);
    g.fillRect(x, y, 2 + Math.floor(R() * 3), 1);
  }
  fillRect(g, RWY.x0 + 1, ry0 + 1, rw - 2, 1, COL.white);
  fillRect(g, RWY.x0 + 1, ry0 + rh - 2, rw - 2, 1, COL.white);
  g.fillStyle = COL.white;
  for (let x = 172; x < 428; x += 10) g.fillRect(x, RWY.y, 6, 1);
  for (const y of [156, 158, 162, 164]) {
    g.fillRect(143, y, 10, 1);
    g.fillRect(440, y, 10, 1);
  }
  drawTextRot(g, '09', 160, 157, COL.white, 1);
  drawTextRot(g, '27', 432, 163, COL.white, 3);
  for (const x of [196, 382]) {
    g.fillRect(x, 156, 12, 2);
    g.fillRect(x, 163, 12, 2);
  }
  for (const x of [176, 222, 242, 344, 364, 410]) {
    g.fillRect(x, 157, 6, 1);
    g.fillRect(x, 163, 6, 1);
  }

  // taxiway centrelines and holding position markings
  const Y = COL.yellow;
  plotPath(g, P([[HOLD_X, TWY_Y], [EAST_X, TWY_Y]]), Y);
  plotPath(g, P([[HOLD_X, TWY_Y], [HOLD_X, RWY.y - RWY.hw - 1]]), Y);
  plotPath(g, hsLine, Y, 0, 0, hsLine.find((q) => q.y < RWY.y - 1));
  plotPath(g, P([[EAST_X, RWY.y - RWY.hw - 1], [EAST_X, LANE_Y]]), Y);
  plotPath(g, P([[WEST_X, LANE_Y], [WEST_X, TWY_Y]]), Y);
  plotPath(g, P([[WEST_X, LANE_Y], [EAST_X, LANE_Y]]), Y);
  plotPath(g, P([[380, RWY.y + RWY.hw + 1], [380, 190]]), Y);
  fillRect(g, HOLD_X - 3, 147, 7, 1, Y);
  for (let x = HOLD_X - 3; x <= HOLD_X + 3; x += 2) fillRect(g, x, 149, 1, 1, Y);
  for (const x of [EAST_X - 3, 377]) {
    fillRect(g, x, x === 377 ? 170 : 148, 7, 1, Y);
  }

  // stands: lead-in curves, stop bars, numbers, service road line
  g.fillStyle = '#dfe2e6';
  for (let x = 238; x < 456; x += 6) g.fillRect(x, 60, 3, 1);
  for (const gt of GATES) {
    plotPath(g, P([[gt.x + 14, LANE_Y], [gt.x, LANE_Y], [gt.x, STAND_Y - 11]], 10), Y);
    fillRect(g, gt.x - 2, STAND_Y - 12, 5, 1, Y);
    drawText(g, String(gt.id), gt.x + 5, 89, Y);
  }
}

function renderScenery() {
  const [c, g] = makeCanvas(VIEW.w, VIEW.h);
  g.translate(-VIEW.x, -VIEW.y);
  const R = mulberry32(90210);
  paintGrass(g);
  paintCountryside(g);
  paintFields(g, R);
  paintPond(g);
  paintRoads(g, R);
  paintAirfield(g, R);
  paintStructures(g, R); // buildings.js
  return c;
}
