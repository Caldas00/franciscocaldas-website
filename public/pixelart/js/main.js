'use strict';
/* Boot, full-window layout, main loop, render order, map HUD and input. */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const SPEEDS = [1, 2, 4, 8];
let BG = null, LIGHTS = null;
let speed = 1, paused = false, showLabels = true, helpUntil = 30, selected = null, clockT = 0;

// The canvas always fills the browser window. The art scale is the largest that still fits
// the airport (W x H) plus the strip panel; leftover room shows more of the countryside.
// Whole device pixels are used when that costs little space, for the crispest pixels.
function layout() {
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min(innerWidth / CW, innerHeight / H);
  const sd = fit * dpr;
  const s = sd >= 1 && Math.floor(sd) / sd >= 0.9 ? Math.floor(sd) / dpr : fit;
  SCR.scale = s;
  SCR.w = Math.ceil(innerWidth / s);
  SCR.h = Math.ceil(innerHeight / s);
  SCR.mapW = SCR.w - PW;
  VIEW.w = SCR.mapW;
  VIEW.h = SCR.h;
  VIEW.x = -Math.floor((VIEW.w - W) / 2);
  VIEW.y = -Math.floor((VIEW.h - H) / 2);
  canvas.width = SCR.w;
  canvas.height = SCR.h;
  canvas.style.width = SCR.w * s + 'px';
  canvas.style.height = SCR.h * s + 'px';
  ctx.imageSmoothingEnabled = false;
  BG = renderScenery();
  LIGHTS = renderLightsLayer();
}

let relayoutTimer = 0;
function onResize() {
  clearTimeout(relayoutTimer);
  relayoutTimer = setTimeout(layout, 150); // repainting the scenery is not free: wait for the drag to settle
}

function update(dt) {
  if (GAME.mode === 'over') return;
  clockT += dt;
  Sky.update(dt);
  ctl().update(dt);
  if (GAME.mode === 'over') return; // a plane just ran out of fuel: freeze the scene
  for (const p of planes) p.update(dt);
  for (let i = planes.length - 1; i >= 0; i--) {
    if (!planes[i].dead) continue;
    if (selected === planes[i]) selected = null;
    planes.splice(i, 1);
  }
  Services.update(dt);
  Cars.update(dt);
  Clouds.update(dt);
  Particles.update(dt);
  Floaters.update(dt);
}

function render() {
  const g = ctx, day = Sky.day(), night = Sky.night();
  UI.begin();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;

  // map: clipped to the area left of the panel, drawn in world coordinates
  g.save();
  g.beginPath();
  g.rect(0, 0, SCR.mapW, SCR.h);
  g.clip();
  g.translate(-VIEW.x, -VIEW.y);
  g.drawImage(BG, VIEW.x, VIEW.y);
  Cars.draw(g);
  Services.draw(g);
  const ground = planes.filter((p) => p.onGround).sort((a, b) => a.y - b.y);
  const air = planes.filter((p) => !p.onGround).sort((a, b) => a.z - b.z);
  for (const p of ground) p.drawShadow(g, day);
  for (const p of ground) p.draw(g);
  for (const p of ground) p.drawTug(g);
  drawBridges(g);
  drawMapLamp(g);
  Particles.draw(g);
  Clouds.drawShadows(g, day);
  for (const p of air) p.drawShadow(g, day);
  for (const p of air) p.draw(g);
  Clouds.draw(g);
  if (Sky.elev() < 0.34) {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = rgb2css(Sky.tint());
    g.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    g.globalCompositeOperation = 'source-over';
  }
  if (night > 0.02) drawNightLights(g, night);
  drawWorldHUD(g);
  g.setTransform(1, 0, 0, 1, 0, 0); // still clipped to the map
  drawScreenHUD(g);
  g.restore();

  drawPanel(g);
  if (GAME.mode === 'menu') drawMenu(g);
  else if (GAME.mode === 'over') drawGameOver(g);
  const cur = UI.cursor || 'crosshair';
  if (canvas.style.cursor !== cur) canvas.style.cursor = cur;
}

function drawNightLights(g, night) {
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = night;
  g.drawImage(LIGHTS, VIEW.x, VIEW.y);
  // approach-light "rabbit": a strobe racing toward the threshold twice a second
  const k = Math.floor(((clockT * 2) % 1) * 14);
  if (k < 10) glow(g, 64 + k * 8, RWY.y, '#ffffff', true);
  // stop bar at the holding point turns green while a departure lines up
  const r = ctl().runway;
  const lining = r && r.phase === 'lineup';
  for (let x = HOLD_X - 3; x <= HOLD_X + 3; x += 2) glow(g, x, 147, lining ? '#55ff7f' : '#ff3020');
  glow(g, 139, 140, r ? '#ff3020' : '#55ff7f', true);
  glow(g, 214, 17, Math.floor(clockT) % 2 ? '#55ff7f' : '#ffffff');
  Cars.drawLights(g);
  Services.drawLights(g, clockT);
  for (const p of planes) p.drawLights(g);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
}

// ---- map HUD --------------------------------------------------------------------------
function panel(g, x, y, w, h) {
  g.fillStyle = 'rgba(10,13,20,0.72)';
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.14)';
  g.fillRect(x, y, w, 1);
}

function textPanel(g, lines, x, y, alignRight = false, firstColor = '#ffe66b') {
  const w = Math.max(...lines.map(textWidth)) + 6, h = lines.length * 7 + 3;
  if (alignRight) x -= w;
  panel(g, x, y, w, h);
  lines.forEach((l, i) => drawText(g, l, x + 3, y + 3 + i * 7, i === 0 ? firstColor : '#ffffff'));
}

function drawBrackets(g, p, col) {
  const r = p.T.nose + 3, x = Math.round(p.x), y = Math.round(p.y);
  g.fillStyle = col;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = x + sx * r, cy = y + sy * r;
      g.fillRect(sx < 0 ? cx : cx - 2, cy, 3, 1);
      g.fillRect(cx, sy < 0 ? cy : cy - 2, 1, 3);
    }
  }
}

function selectedLines(p) {
  const lines = [`${p.callsign}  ${p.T.name}`, PHASE_NAMES[p.phase]];
  if (p.fuel !== null && AIR_ARRIVAL_PHASES.has(p.phase)) {
    lines.push(`FUEL ${fmtTime(p.fuel)}${p.cleared ? ' (CLEARED)' : p.phase === 'holding' ? '' : ' (PAUSED)'}`);
  }
  if (p.phase === 'parked' && p.t < p.turnaround) lines.push(`TURNAROUND ${fmtTime(p.turnaround - p.t)}`);
  lines.push(p.z > 0.5 ? `ALT ${Math.round(p.z * 120)}FT` : p.gate ? `STAND ${p.gate.id}` : 'RWY 09');
  lines.push(`SPD ${Math.round(p.speed * 5.5)}KT`);
  if (GAME.mode === 'play') {
    const a = Tower.actionFor(p);
    if (a) lines.push(`ENTER: ${a}`);
  }
  return lines;
}

// Things attached to the world (drawn with the camera transform).
function drawWorldHUD(g) {
  drawStandBars(g);
  Floaters.draw(g);
  if (showLabels) for (const p of planes) if (!p.onGround && p !== selected) p.drawLabel(g, false);
  const hp = UI.lastHover;
  if (hp && hp !== selected && planes.includes(hp)) drawBrackets(g, hp, '#9fd3ff');
  if (selected) {
    const over = GAME.mode === 'over';
    if (over || (performance.now() / 333) & 1) drawBrackets(g, selected, over ? '#ff5a4d' : '#ffe66b');
    selected.drawLabel(g, true);
  }
}

// Overlays fixed to the screen corners of the map area.
function drawScreenHUD(g) {
  if (selected) {
    const lines = selectedLines(selected);
    textPanel(g, lines, SCR.mapW - 3, SCR.h - 6 - lines.length * 7, true);
  } else if (GAME.mode === 'auto' && clockT < helpUntil) {
    textPanel(g, ['CONTROLS', 'SPACE PAUSE  1-4 SPEED', 'L LABELS  N DAY/NIGHT', 'T +1 HOUR  CLICK A PLANE'],
      SCR.mapW - 3, SCR.h - 34, true);
  }

  // radio log at the top-left, newest last, fading out
  const log = ATC.log.slice(-3);
  log.forEach((l, i) => {
    const a = clamp(1 - (l.t - 12) / 3, 0, 1);
    if (a <= 0) return;
    const y = 3 + i * 8;
    g.globalAlpha = a;
    panel(g, 3, y - 2, textWidth(l.text) + 6, 8);
    drawText(g, l.text, 6, y, i === log.length - 1 ? '#b8f5b0' : '#dfe6ee');
    g.globalAlpha = 1;
  });

  if (paused && (GAME.mode === 'play' || GAME.mode === 'auto')) {
    const cx = Math.round(SCR.mapW / 2);
    panel(g, cx - 20, 6, 40, 11);
    drawText(g, 'PAUSED', cx - 11, 9, '#ff8a7a');
  }
}

// ---- input ------------------------------------------------------------------------------
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * SCR.w, ((e.clientY - r.top) / r.height) * SCR.h];
}

// Nearest plane to a point given in canvas coordinates on the map.
function planeAt(cx, cy) {
  const x = cx + VIEW.x, y = cy + VIEW.y;
  let best = null, bd = 14;
  for (const p of planes) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best;
}

addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (e.code === 'Space') {
    if (GAME.mode === 'play' || GAME.mode === 'auto') paused = !paused;
    e.preventDefault();
  } else if (k >= '1' && k <= '4') speed = SPEEDS[+k - 1];
  else if (k === 'l') showLabels = !showLabels;
  else if (k === 'n') Sky.t = Sky.night() > 0.5 ? 0.42 : 0.9;
  else if (k === 't') Sky.t = (Sky.t + 1 / 24) % 1;
  else if (k === 'h') helpUntil = helpUntil > clockT ? 0 : clockT + 30;
  else if (k === 'enter') {
    if (GAME.mode === 'play' && selected) Tower.act(selected);
  } else if (k === 'escape') selected = null;
});

canvas.addEventListener('pointermove', (e) => {
  [UI.mx, UI.my] = toCanvas(e);
});
canvas.addEventListener('pointerleave', () => {
  UI.mx = UI.my = -1;
});
canvas.addEventListener('click', (e) => {
  const [x, y] = toCanvas(e);
  if (UI.click(x, y)) return;
  if (GAME.mode === 'menu' || GAME.mode === 'over' || x >= SCR.mapW) return;
  selected = planeAt(x, y);
});
canvas.addEventListener('dblclick', (e) => {
  const [x, y] = toCanvas(e);
  if (GAME.mode !== 'play' || x >= SCR.mapW) return;
  const p = planeAt(x, y);
  if (p) Tower.act(p);
});

// ---- boot ---------------------------------------------------------------------------------
function init() {
  initSprites();
  layout();
  Clouds.init();
  populateAuto();
  for (let i = 0; i < 40; i++) Cars.update(0.25);
  addEventListener('resize', onResize);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) for (let i = 0; i < speed; i++) update(dt);
    render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

init();
