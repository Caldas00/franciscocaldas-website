'use strict';
/* In-canvas UI: clickable buttons, the flight-strip panel (right of the map), the runway
   status lamp, gate turnaround bars and the title / game-over dialogs. */

const UIC = {
  bg: '#121722', box: '#1b2130', boxHi: '#262f44', sel: '#3a3424', line: '#2c3449',
  text: '#dfe6ee', dim: '#7c869a', yellow: '#ffe66b', green: '#5dff86', red: '#ff5a4d',
  blue: '#9fd3ff', amber: '#ffb84d',
};
const BTN = {
  go: ['#2f8f52', '#3fb86a'],
  amber: ['#a8701e', '#cf8d2a'],
  blue: ['#2d5d9f', '#3d78c8'],
  gray: ['#3a4256', '#4d5770'],
};
const CAT_COLORS = ['#4f8dff', '#e0b040', '#4fd07a'];

// Buttons are registered while drawing, so clicks always match what is on screen.
const UI = {
  buttons: [],
  mx: -1,
  my: -1,
  hoverPlane: null,
  lastHover: null,
  cursor: '',
  begin() {
    this.buttons.length = 0;
    this.lastHover = this.hoverPlane;
    this.hoverPlane = null;
    this.cursor = '';
  },
  over(x, y, w, h) {
    return this.mx >= x && this.mx < x + w && this.my >= y && this.my < y + h;
  },
  region(x, y, w, h, onClick) {
    this.buttons.push({ x, y, w, h, on: true, onClick });
    return this.over(x, y, w, h);
  },
  button(g, x, y, label, onClick, opts = {}) {
    const w = opts.w || textWidth(label) + 8, h = opts.h || 9, on = opts.enabled !== false;
    const [base, hi] = BTN[opts.kind || 'go'];
    const hot = on && this.over(x, y, w, h);
    if (hot) this.cursor = 'pointer';
    g.fillStyle = on ? (hot ? hi : base) : '#262c39';
    g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,0.2)';
    g.fillRect(x, y, w, 1);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(x, y + h - 1, w, 1);
    drawText(g, label, x + Math.round((w - textWidth(label)) / 2), y + Math.round((h - 5) / 2), on ? '#ffffff' : '#5d667a');
    this.buttons.push({ x, y, w, h, on, onClick });
    return w;
  },
  click(x, y) {
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        if (b.on && b.onClick) b.onClick();
        return true;
      }
    }
    return false;
  },
};

// ---- flight strips --------------------------------------------------------------------
// cat: 0 arrivals, 1 at gates, 2 departures
function stripInfo(p) {
  const gate = p.gate ? p.gate.id : '-';
  switch (p.phase) {
    case 'inbound': return { cat: 0, st: p.cleared ? 'CLEARED' : 'INBOUND' };
    case 'holding': return { cat: 0, st: p.cleared ? 'CLEARED' : 'HOLD ' + p.hold.name[0] };
    case 'approach': return { cat: 0, st: 'FINAL' };
    case 'goaround': return { cat: 0, st: 'GO-ARND' };
    case 'rollout': return { cat: 1, st: 'LANDING' };
    case 'taxiin': return { cat: 1, st: 'TAXI G' + gate };
    case 'parked': {
      const left = p.turnaround - p.t;
      if (left > 0) return { cat: 1, st: 'GATE ' + gate, info: fmtTime(left), col: UIC.dim };
      return { cat: 1, st: 'GATE ' + gate, info: 'WAIT', col: UIC.blue };
    }
    case 'pushback':
    case 'pushdone': return { cat: 2, st: 'PUSHBACK' };
    case 'taxiout': return { cat: 2, st: 'TAXI' };
    case 'holdshort': return { cat: 2, st: 'HOLDING' };
    case 'lineup': return { cat: 2, st: 'LINE UP' };
    case 'takeoff': return p.handoff ? null : { cat: 2, st: 'ROLLING' };
  }
  return null;
}

function drawStrip(g, p, info, y) {
  const x = SCR.mapW + 2, w = PW - 4, h = 10, sel = p === selected;
  const hot = UI.region(x, y, w, h, () => (selected = p));
  if (hot) {
    UI.hoverPlane = p;
    UI.cursor = 'pointer';
  }
  g.fillStyle = sel ? UIC.sel : hot ? UIC.boxHi : UIC.box;
  g.fillRect(x, y, w, h);
  g.fillStyle = CAT_COLORS[info.cat];
  g.fillRect(x, y, 2, h);
  drawText(g, p.callsign, x + 4, y + 3, sel ? UIC.yellow : UIC.text);
  drawText(g, info.st, x + 30, y + 3, UIC.dim);
  const action = ctl() === Tower ? Tower.actionFor(p) : null;
  if (p.fuel !== null && AIR_ARRIVAL_PHASES.has(p.phase)) drawText(g, fmtTime(p.fuel), x + 62, y + 3, fuelStyle(p));
  else if (info.info && !action) drawText(g, info.info, x + 62, y + 3, info.col);
  if (!action || GAME.mode !== 'play') return;
  const ok = action === 'LAND' ? Tower.okLand(p) : action === 'RELEASE' ? Tower.okRelease(p) : Tower.okTakeoff(p);
  const bw = textWidth(action) + 6;
  UI.button(g, x + w - bw - 1, y + 1, action, () => {
    selected = p;
    Tower.act(p);
  }, { w: bw, h: 8, enabled: ok, kind: action === 'RELEASE' ? 'amber' : 'go' });
}

function drawLamp(g, cx, cy, green) {
  const col = green ? '#43e070' : '#ff4a3d';
  disc(g, cx, cy, 7, green ? 'rgba(67,224,112,0.16)' : 'rgba(255,74,61,0.16)');
  disc(g, cx, cy, 5, '#0b0e14');
  disc(g, cx, cy, 3, col);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.fillRect(cx - 1, cy - 2, 1, 1);
}

function drawRunwayBox(g, x, y) {
  const w = PW - 4, h = 18, c = ctl(), free = !c.runway;
  g.fillStyle = UIC.box;
  g.fillRect(x, y, w, h);
  drawLamp(g, x + 9, y + 9, free);
  drawText(g, 'RUNWAY 09', x + 19, y + 3, UIC.text);
  let st = 'CLEAR', col = UIC.green;
  if (!free) {
    st = 'IN USE ' + c.runway.callsign;
    col = UIC.red;
  } else if (c === Tower && !Tower.freeGate()) {
    st = 'CLEAR - NO GATE';
    col = UIC.amber;
  }
  drawText(g, st, x + 19, y + 10, col);
}

function drawPanel(g) {
  const x0 = SCR.mapW, play = ctl() === Tower;
  const right = (s, y, col) => drawText(g, s, SCR.w - 4 - textWidth(s), y, col);
  g.fillStyle = UIC.bg;
  g.fillRect(x0, 0, PW, SCR.h);
  g.fillStyle = UIC.line;
  g.fillRect(x0, 0, 1, SCR.h);
  drawText(g, 'PIXELPORT ATC', x0 + 4, 3, UIC.yellow);
  right(Sky.clock(), 3, UIC.dim);
  if (play) {
    drawText(g, `SCORE ${Tower.score}`, x0 + 4, 11, UIC.text);
    right(`BEST ${Math.max(GAME.best, Tower.score)}`, 11, UIC.dim);
  } else {
    drawText(g, 'AUTOPILOT', x0 + 4, 11, UIC.blue);
    right(`LANDED ${ATC.arrCount}`, 11, UIC.dim);
  }
  drawRunwayBox(g, x0 + 2, 19);

  const groups = [[], [], []];
  for (const p of planes) {
    const info = stripInfo(p);
    if (info) groups[info.cat].push([p, info]);
  }
  const urgency = (p) => (p.cleared ? 1e4 : 0) + p.fuel; // waiting planes by fuel, cleared ones last
  if (play) groups[0].sort((a, b) => urgency(a[0]) - urgency(b[0]));
  groups[1].sort((a, b) => (a[0].gate ? a[0].gate.id : 9) - (b[0].gate ? b[0].gate.id : 9));
  const order = { takeoff: 0, lineup: 0, holdshort: 1, taxiout: 2, pushdone: 3, pushback: 3 };
  groups[2].sort((a, b) => order[a[0].phase] - order[b[0].phase] || a[0].remaining - b[0].remaining);

  let y = 40;
  ['ARRIVALS', 'AT GATES', 'DEPARTURES'].forEach((title, c) => {
    drawText(g, title, x0 + 4, y, UIC.dim);
    right(String(groups[c].length), y, UIC.dim);
    y += 8;
    for (const [p, info] of groups[c]) {
      if (y > SCR.h - 26) break;
      drawStrip(g, p, info, y);
      y += 11;
    }
    if (!groups[c].length) {
      drawText(g, '-', x0 + 6, y, '#4a5266');
      y += 8;
    }
    y += 3;
  });

  const fy = SCR.h - 12;
  g.fillStyle = UIC.line;
  g.fillRect(x0, fy - 3, PW, 1);
  let bx = x0 + 3;
  if (GAME.mode !== 'menu') bx += UI.button(g, bx, fy, 'MENU', () => setMode('menu'), { kind: 'gray' }) + 3;
  if (GAME.mode === 'auto' || GAME.mode === 'menu') UI.button(g, bx, fy, 'PLAY', () => setMode('play'));
  right(paused ? 'PAUSED' : `${speed}X`, fy + 2, paused ? '#ff8a7a' : UIC.blue);
}

// ---- map overlays -------------------------------------------------------------------------
// Runway status lamp beside the holding point (world layer; glow added in the light pass).
function drawMapLamp(g) {
  const free = !ctl().runway;
  fillRect(g, 139, 143, 1, 4, '#3a3f4a');
  fillRect(g, 137, 138, 5, 5, '#15181f');
  fillRect(g, 138, 139, 3, 3, free ? '#43e070' : '#ff4a3d');
}

// Turnaround progress under each occupied stand (player mode).
function drawStandBars(g) {
  if (ctl() !== Tower) return;
  for (const gt of GATES) {
    const p = gt.plane;
    if (!p || p.phase !== 'parked') continue;
    const f = clamp(p.t / p.turnaround, 0, 1), x = gt.x - 7, y = 95;
    fillRect(g, x, y, 15, 3, '#10131a');
    let col = '#ffb84d';
    if (f >= 1) col = p.released ? '#9fd3ff' : (performance.now() / 300) & 1 ? '#5dff86' : '#2f8f52';
    fillRect(g, x + 1, y + 1, Math.max(1, Math.round(13 * f)), 1, col);
  }
}

// ---- dialogs ----------------------------------------------------------------------------------
// Dialogs are centred in the map area (screen coordinates).
function centerText(g, s, y, col, scale = 1) {
  const w = textWidth(String(s)) * scale, x = Math.round((SCR.mapW - w) / 2);
  if (scale === 1) drawText(g, s, x, y, col);
  else drawTextScaled(g, s, x, y, col, scale, '#05070b');
}

function dialog(g, w, h, y) {
  g.fillStyle = 'rgba(6,8,14,0.5)';
  g.fillRect(0, 0, SCR.mapW, SCR.h);
  const x = Math.round((SCR.mapW - w) / 2);
  g.fillStyle = 'rgba(18,23,34,0.96)';
  g.fillRect(x, y, w, h);
  g.fillStyle = UIC.line;
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillRect(x, y, 1, h);
  g.fillRect(x + w - 1, y, 1, h);
}

function drawMenu(g) {
  const y = Math.round((SCR.h - 176) / 2), cx = Math.round(SCR.mapW / 2);
  dialog(g, 300, 176, y);
  centerText(g, 'PIXELPORT ATC', y + 10, UIC.yellow, 2);
  centerText(g, 'YOU ARE THE CONTROLLER', y + 26, UIC.dim);
  UI.button(g, cx - 76, y + 38, 'PLAY', () => setMode('play'), { w: 70, h: 14 });
  UI.button(g, cx + 6, y + 38, 'AUTOPILOT', () => setMode('auto'), { w: 70, h: 14, kind: 'blue' });
  const lines = [
    ['HOW TO PLAY', UIC.yellow],
    ['ARRIVALS HOLD, BURNING FUEL, UNTIL YOU CLEAR THEM.', UIC.text],
    ['YOU CAN ONLY CLEAR WHEN THE RUNWAY LIGHT IS GREEN', UIC.text],
    ['AND A GATE IS FREE FOR THE PLANE.', UIC.text],
    ['AFTER THE TURNAROUND, RELEASE PLANES FROM THE GATE,', UIC.text],
    ['THEN CLEAR THEM FOR TAKEOFF AT THE HOLDING POINT.', UIC.text],
    ['1 POINT PER LANDING. RUN OUT OF FUEL = GAME OVER.', UIC.amber],
    ['USE THE STRIP BUTTONS, OR SELECT A PLANE + ENTER.', UIC.dim],
    ['SPACE PAUSE   1-4 SPEED   N DAY/NIGHT', UIC.dim],
    [`BEST SCORE ${GAME.best}`, UIC.blue],
  ];
  lines.forEach(([s, col], i) => centerText(g, s, y + 62 + i * 11, col));
}

function drawGameOver(g) {
  const y = Math.round((SCR.h - 96) / 2), cx = Math.round(SCR.mapW / 2);
  dialog(g, 220, 96, y);
  centerText(g, 'GAME OVER', y + 10, UIC.red, 2);
  centerText(g, `${GAME.culprit.callsign} RAN OUT OF FUEL`, y + 28, UIC.text);
  centerText(g, `SCORE ${Tower.score}`, y + 40, UIC.yellow);
  centerText(g, GAME.newBest ? 'NEW BEST SCORE!' : `BEST ${GAME.best}`, y + 49, GAME.newBest ? UIC.green : UIC.dim);
  UI.button(g, cx - 70, y + 64, 'PLAY AGAIN', () => setMode('play'), { w: 64, h: 14 });
  UI.button(g, cx + 6, y + 64, 'MENU', () => setMode('menu'), { w: 64, h: 14, kind: 'gray' });
}
