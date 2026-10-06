'use strict';
/* Structures, trees and decorations painted on top of the ground, plus the static
   night-light layer (runway/taxiway lights, lit windows, floodlights). */

const SHADOW = 'rgba(0,0,0,0.24)';

function disc(g, cx, cy, r, col) {
  g.fillStyle = col;
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) g.fillRect(cx + i, cy + j, 1, 1);
  }
}

function paintTerminal(g) {
  const x0 = 258, x1 = 450, y0 = 19, yf = 48, w = x1 - x0 + 1;
  fillRect(g, x0 + 3, 57, w - 1, 2, SHADOW);
  fillRect(g, x1 + 1, y0 + 3, 2, yf - y0 + 6, SHADOW);
  fillRect(g, x0, y0, w, yf - y0, '#c8ccd5');
  g.fillStyle = '#bcc1cb';
  for (let x = x0 + 16; x < x1; x += 16) g.fillRect(x, y0 + 1, 1, yf - y0 - 1);
  fillRect(g, x0, y0, w, 1, '#e4e7ec');
  fillRect(g, x0, y0, 1, yf - y0, '#e4e7ec');
  fillRect(g, x1, y0, 1, yf - y0, '#9ea4b0');
  fillRect(g, x0 + 8, 30, w - 16, 3, '#6f97c2');
  g.fillStyle = '#a6c7e6';
  for (let x = x0 + 9; x < x1 - 8; x += 5) g.fillRect(x, 30, 2, 1);
  for (let x = x0 + 12; x < x1 - 10; x += 30) {
    fillRect(g, x, 22, 6, 4, '#8f96a3');
    fillRect(g, x + 1, 23, 2, 2, '#4b515c');
    fillRect(g, x + 6, 23, 1, 4, 'rgba(0,0,0,0.18)');
  }
  drawText(g, 'PIXELPORT', 336, 38, '#8b919d');
  fillRect(g, x0, yf, w, 1, '#6f7685');
  fillRect(g, x0, yf + 1, w, 6, '#34506f');
  fillRect(g, x0, yf + 2, w, 1, '#4b6b90');
  g.fillStyle = '#5a7799';
  for (let x = x0 + 2; x < x1; x += 4) g.fillRect(x, yf + 1, 1, 6);
  fillRect(g, x0, 55, w, 2, '#5b616d');
  for (const gt of GATES) {
    fillRect(g, gt.x - 10, 54, 5, 4, '#d3d7de');
    fillRect(g, gt.x - 10, 57, 5, 1, '#8d93a0');
  }
}

function paintTower(g) {
  g.fillStyle = SHADOW;
  for (let t = 0; t < 24; t++) g.fillRect(219 + Math.round(t * 0.6), 64 + Math.round(t * 0.9), 4, 2);
  fillRect(g, 231, 66, 2, 13, SHADOW);
  fillRect(g, 198, 64, 33, 10, '#c3c7cf');
  fillRect(g, 198, 64, 33, 1, '#dde0e5');
  fillRect(g, 198, 74, 33, 5, '#9aa0aa');
  for (let x = 200; x < 229; x += 4) fillRect(g, x, 75, 2, 2, '#34506f');
  fillRect(g, 211, 38, 7, 28, '#d6d9df');
  fillRect(g, 216, 38, 2, 28, '#aeb3bd');
  fillRect(g, 211, 38, 1, 28, '#eceef1');
  fillRect(g, 206, 39, 17, 2, '#8d939e');
  fillRect(g, 205, 30, 19, 9, '#2b4a5c');
  g.fillStyle = '#6a9cb4';
  for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) g.fillRect(207 + k * 5 + j, 31 + j * 2, 1, 1);
  fillRect(g, 204, 28, 21, 2, '#4a505b');
  fillRect(g, 207, 25, 15, 3, '#8a909a');
  fillRect(g, 214, 17, 1, 8, '#555a63');
  fillRect(g, 212, 20, 5, 1, '#555a63');
}

function paintFireStation(g) {
  fillRect(g, 150, 108, 40, 16, COL.concrete);
  fillRect(g, 187, 89, 2, 19, SHADOW);
  fillRect(g, 154, 86, 33, 13, '#a9473d');
  fillRect(g, 154, 86, 33, 1, '#c76457');
  g.fillStyle = '#93392f';
  for (let x = 156; x < 186; x += 3) g.fillRect(x, 87, 1, 12);
  fillRect(g, 154, 99, 33, 8, '#ddd6ca');
  for (let i = 0; i < 3; i++) {
    fillRect(g, 157 + i * 10, 101, 7, 6, '#c0392b');
    fillRect(g, 157 + i * 10, 101, 7, 1, '#7d241b');
  }
  for (const x of [158, 168]) {
    fillRect(g, x + 1, 111, 5, 9, SHADOW);
    fillRect(g, x, 110, 5, 9, '#d63a2f');
    fillRect(g, x, 110, 5, 2, '#f2f2f2');
    fillRect(g, x + 1, 112, 3, 1, '#2a2f3a');
  }
}

function paintHangar(g, x, y, w, h) {
  const bands = ['#d0d5dc', '#c3c9d1', '#b4bbc5', '#a6adb8', '#98a0ac'];
  for (let j = 0; j < h; j++) fillRect(g, x, y + j, w, 1, bands[Math.floor((j / h) * bands.length)]);
  g.fillStyle = 'rgba(0,0,0,0.08)';
  for (let i = x + 4; i < x + w; i += 6) g.fillRect(i, y, 1, h);
  fillRect(g, x, y + h, w, 6, '#8e949f');
  fillRect(g, x + (w >> 1) - 5, y + h + 1, 10, 5, '#5b616c');
  for (let i = x + 3; i < x + w - 3; i += 7) if (Math.abs(i - x - (w >> 1)) > 8) fillRect(g, i, y + h + 2, 3, 2, '#34506f');
  fillRect(g, x + w, y + 3, 2, h + 4, SHADOW);
}

function paintCargo(g) {
  paintHangar(g, 306, 226, 48, 24);
  paintHangar(g, 364, 226, 48, 24);
  fillRect(g, 422, 228, 48, 22, '#b8b2a5');
  fillRect(g, 422, 228, 48, 1, '#d2cdc2');
  fillRect(g, 422, 250, 48, 6, '#9a9384');
  for (let x = 425; x < 468; x += 9) fillRect(g, x, 251, 6, 5, '#6d675b');
  const jet = staticSprite(JET, 33, CARGO_LIVERY, -Math.PI / 2);
  g.globalAlpha = 0.28;
  g.drawImage(PLANE_TYPES.jet.shadows[dirIndex(-Math.PI / 2)], 323, 189);
  g.globalAlpha = 1;
  g.drawImage(jet, 322, 188);
  const gaShadow = paintMap(rotMap(normGrid(GA), -Math.PI / 2, 17), 17, SHADOW_PAL);
  GA_LIVERIES.forEach((l, i) => {
    g.globalAlpha = 0.28;
    g.drawImage(gaShadow, 425 + i * 15, 197);
    g.globalAlpha = 1;
    g.drawImage(staticSprite(GA, 17, l, -Math.PI / 2), 424 + i * 15, 196);
  });
}

function paintFuelFarm(g) {
  fillRect(g, 150, 210, 56, 32, '#9c9584');
  g.strokeStyle = '#7d776a';
  g.lineWidth = 1;
  g.strokeRect(150.5, 210.5, 55, 31);
  for (const [cx, cy, r] of [[164, 222, 8], [188, 222, 8], [176, 236, 4]]) {
    disc(g, cx + 1, cy + 2, r, SHADOW);
    disc(g, cx, cy, r, '#8a8f98');
    disc(g, cx, cy, r - 1, '#dfe2e6');
    g.fillStyle = '#b9bdc4';
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      if (i * i + j * j < (r - 1) * (r - 1) && i + j > r * 0.5) g.fillRect(cx + i, cy + j, 1, 1);
    }
    fillRect(g, cx - 2, cy - 3, 2, 1, '#ffffff');
    fillRect(g, cx, cy, 1, 1, '#9aa0a8');
  }
}

function paintFieldDetails(g) {
  for (let x = 64; x <= 136; x += 8) {
    fillRect(g, x, 158, 1, 5, '#7c7f86');
    fillRect(g, x, 160, 1, 1, '#d8d8cf');
  }
  fillRect(g, 104, 155, 1, 11, '#7c7f86');
  fillRect(g, 204, 172, 1, 6, '#45484f');
  fillRect(g, 205, 172, 1, 2, '#f07b23');
  fillRect(g, 206, 172, 1, 2, '#f4f4f4');
  fillRect(g, 207, 172, 1, 1, '#f07b23');
  fillRect(g, 462, 151, 1, 19, '#6b6f77');
  for (let y = 152; y <= 168; y += 2) fillRect(g, 463, y, 2, 1, '#d9d9d9');
  fillRect(g, 182, 170, 1, 3, '#c0392b');
}

function paintTree(g, x, y, r, R) {
  disc(g, x + 1, y + 2, r, 'rgba(0,0,0,0.28)');
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      if (i * i + j * j > r * r + r * 0.6) continue;
      const n = (-i - j) / (r * 1.6) + (R() - 0.5) * 0.5;
      fillRect(g, x + i, y + j, 1, 1, n > 0.35 ? '#5ea24c' : n > -0.25 ? '#3f8239' : '#2e672f');
    }
  }
}

function treeBlocked(x, y) {
  if (y > 1 && y < 21) return true; // road
  if (y > 134 && y < 188 && x > 54) return true; // runway strip and approach lights
  if (x > 130 && x < 472 && y > 17 && y < 259 && !(x > 210 && x < 296 && y > 196)) return true; // airside
  for (const [fx, fy, fw, fh] of [[0, 96, 58, 46], [62, 100, 54, 40], [0, 178, 52, 28], [56, 184, 66, 22]]) {
    if (x > fx - 4 && x < fx + fw + 3 && y > fy - 5 && y < fy + fh + 3) return true;
  }
  return ((x - 30) / 28) ** 2 + ((y - 238) / 15) ** 2 < 1;
}

function paintTrees(g, R) {
  const zones = [
    [0, 0, W, 2, 34], [0, 22, 128, 70, 22], [0, 206, 140, 64, 30], [140, 258, 160, 12, 16],
    [300, 259, 180, 11, 14], [472, 20, 8, 240, 10], [212, 198, 82, 40, 9], [0, 144, 56, 34, 6],
  ];
  const spots = [];
  for (const [zx, zy, zw, zh, n] of zones) {
    let left = n;
    for (let k = 0; k < n * 3 && left > 0; k++) {
      const x = Math.floor(zx + R() * zw), y = Math.floor(zy + R() * zh);
      if (treeBlocked(x, y) || spots.some((s) => Math.hypot(s[0] - x, s[1] - y) < 4)) continue;
      spots.push([x, y, R() < 0.3 ? 3 : 2]);
      left--;
    }
  }
  spots.sort((a, b) => a[1] - b[1]).forEach(([x, y, r]) => paintTree(g, x, y, r, R));
}

function paintStructures(g, R) {
  paintFieldDetails(g);
  paintFuelFarm(g);
  paintCargo(g);
  paintFireStation(g);
  paintTerminal(g);
  paintTower(g);
  paintTrees(g, R);
}

// ---------------------------------------------------------------------------
// Static night lights, drawn additively with alpha = darkness.
// ---------------------------------------------------------------------------
const LIGHT = {
  rwy: '#ffefb8', thr: '#55ff7f', end: '#ff4433', twy: '#4f7dff',
  warm: '#ffc56b', white: '#fff8e6', teal: '#8affdf',
};

function renderLightsLayer() {
  const [c, g] = makeCanvas(VIEW.w, VIEW.h);
  g.translate(-VIEW.x, -VIEW.y);
  const R = mulberry32(4242);
  const L = (x, y, col, big = false) => glow(g, x, y, col, big);
  // lit windows
  g.fillStyle = '#b07a2a';
  for (let x = 258; x <= 450; x++) if ((x - 260) % 4 !== 0 && R() > 0.08) g.fillRect(x, 49, 1, 6);
  fillRect(g, 205, 30, 19, 9, '#2f7d72');
  g.fillStyle = '#9c6a22';
  for (let x = 200; x < 229; x += 4) g.fillRect(x, 75, 2, 2);
  for (const hx of [306, 364]) for (let i = hx + 3; i < hx + 45; i += 7) g.fillRect(i, 252, 3, 2);
  // runway, approach, taxiway lights
  for (let x = RWY.x0; x <= RWY.x1; x += 12) {
    L(x, RWY.y - RWY.hw, LIGHT.rwy);
    L(x, RWY.y + RWY.hw, LIGHT.rwy);
  }
  for (let y = RWY.y - RWY.hw + 1; y < RWY.y + RWY.hw; y += 2) {
    L(RWY.x0, y, LIGHT.thr);
    L(RWY.x1, y, LIGHT.end);
  }
  for (let x = 64; x <= 136; x += 8) L(x, RWY.y, LIGHT.white);
  for (const y of [156, 158, 162, 164]) L(104, y, LIGHT.white);
  // edge lights, leaving gaps where connectors join taxiway A
  const near = (x, list) => list.some(([a, b]) => x >= a && x <= b);
  for (let x = 158; x <= 440; x += 14) {
    if (!near(x, [[WEST_X - 8, WEST_X + 8], [EAST_X - 8, EAST_X + 8]])) L(x, TWY_Y - 4, LIGHT.twy);
    if (!near(x, [[HS_EXIT[1][0] - 26, HS_EXIT[1][0] + 16], [EAST_X - 8, EAST_X + 8]])) L(x, TWY_Y + 4, LIGHT.twy);
  }
  for (let y = 106; y <= 150; y += 11) {
    if (Math.abs(y - TWY_Y) < 6) continue;
    L(EAST_X - 4, y, LIGHT.twy);
    L(EAST_X + 4, y, LIGHT.twy);
  }
  for (const y of [108, 118]) {
    L(WEST_X - 4, y, LIGHT.twy);
    L(WEST_X + 4, y, LIGHT.twy);
  }
  for (const y of [138, 148]) {
    L(HOLD_X - 4, y, LIGHT.twy);
    L(HOLD_X + 4, y, LIGHT.twy);
  }
  // floodlights and street lamps
  for (const x of [240, 303, 337, 371, 405, 456]) L(x, 59, LIGHT.warm, true);
  for (const [x, y] of [[150, 33], [186, 33], [170, 107], [330, 224], [388, 224], [446, 226], [178, 211], [214, 63]]) {
    L(x, y, LIGHT.warm, true);
  }
  for (let x = Math.floor(VIEW.x / 36) * 36 + 12; x < VIEW.x + VIEW.w; x += 36) L(x, 17, LIGHT.warm);
  L(214, 34, LIGHT.teal, true);
  return c;
}
