'use strict';
/* A tiny 3x5 pixel font. Each glyph is 15 bits, read row by row from the top. */

const FONT = {
  A: '111101111101101', B: '110101110101110', C: '111100100100111', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '111100101101111', H: '101101111101101',
  I: '111010010010111', J: '001001001101111', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '111101101101111', P: '111101111100100',
  Q: '111101101111001', R: '110101110101101', S: '111100111001111', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
  4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001010010',
  8: '111101111101111', 9: '111101111001111',
  ' ': '000000000000000', ':': '000010000010000', '-': '000000111000000', '.': '000000000000010',
  ',': '000000000010100', '/': '001001010100100', '!': '010010010000010', '?': '111001011000010',
  '>': '100010001010100', '<': '001010100010001', '+': '000010111010000', "'": '010010000000000',
  '(': '010100100100010', ')': '010001001001010', '#': '101111101111101', '%': '101001010100101',
  '*': '000101010101000', '=': '000111000111000', '_': '000000000000111',
};

const _glyphSheets = new Map();

function glyphSheet(color) {
  let sheet = _glyphSheets.get(color);
  if (sheet) return sheet;
  const keys = Object.keys(FONT);
  const [c, x] = makeCanvas(keys.length * 4, 5);
  x.fillStyle = color;
  const index = {};
  keys.forEach((k, i) => {
    index[k] = i;
    const g = FONT[k];
    for (let p = 0; p < 15; p++) if (g[p] === '1') x.fillRect(i * 4 + (p % 3), (p / 3) | 0, 1, 1);
  });
  sheet = { c, index };
  _glyphSheets.set(color, sheet);
  return sheet;
}

function textWidth(s) {
  return s.length ? s.length * 4 - 1 : 0;
}

// Draws upper-case text; returns its width in pixels.
function drawText(ctx, s, x, y, color = '#fff', shadow = null) {
  s = String(s).toUpperCase();
  x = Math.round(x);
  y = Math.round(y);
  if (shadow) drawText(ctx, s, x + 1, y + 1, shadow);
  const sheet = glyphSheet(color);
  for (let i = 0; i < s.length; i++) {
    const gi = sheet.index[s[i]];
    if (gi !== undefined) ctx.drawImage(sheet.c, gi * 4, 0, 3, 5, x + i * 4, y, 3, 5);
  }
  return textWidth(s);
}

// Text drawn at an integer scale (titles).
function drawTextScaled(ctx, s, x, y, color, scale, shadow = null) {
  s = String(s).toUpperCase();
  x = Math.round(x);
  y = Math.round(y);
  if (shadow) drawTextScaled(ctx, s, x + scale, y + scale, shadow, scale);
  const sheet = glyphSheet(color);
  for (let i = 0; i < s.length; i++) {
    const gi = sheet.index[s[i]];
    if (gi !== undefined) ctx.drawImage(sheet.c, gi * 4, 0, 3, 5, x + i * 4 * scale, y, 3 * scale, 5 * scale);
  }
  return textWidth(s) * scale;
}

// Rotated text for runway numbers. rot: 0 = normal, 1 = top faces east, 3 = top faces west.
function drawTextRot(ctx, s, x, y, color, rot) {
  ctx.fillStyle = color;
  s = String(s).toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]];
    if (!g) continue;
    for (let p = 0; p < 15; p++) {
      if (g[p] !== '1') continue;
      const u = i * 4 + (p % 3), v = (p / 3) | 0;
      let X = x + u, Y = y + v;
      if (rot === 1) { X = x - v; Y = y + u; }
      else if (rot === 2) { X = x - u; Y = y - v; }
      else if (rot === 3) { X = x + v; Y = y - u; }
      ctx.fillRect(X, Y, 1, 1);
    }
  }
}
