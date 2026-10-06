'use strict';
/* Aircraft: a state machine that walks every plane from arrival to departure.
   inbound -> holding -> approach (-> goaround -> holding) -> rollout -> taxiin -> parked
   -> pushback -> pushdone -> taxiout -> holdshort -> lineup -> takeoff -> gone */

const planes = [];
let planeSeq = 1;

const SPD = { hold: 26, final: 22, taxi: 10, push: 3.2, rotate: 36, climb: 46 };
const ACC = 3, BRAKE = 5;
const PHASE_NAMES = {
  inbound: 'INBOUND', holding: 'HOLDING', approach: 'ON APPROACH', goaround: 'GOING AROUND',
  rollout: 'LANDING ROLL', taxiin: 'TAXI TO STAND', parked: 'AT STAND', pushback: 'PUSHBACK',
  pushdone: 'ENGINE START', taxiout: 'TAXI TO RWY', holdshort: 'HOLDING SHORT', lineup: 'LINING UP',
  takeoff: 'TAKEOFF',
};
const LIT_PHASES = new Set(['approach', 'rollout', 'lineup', 'takeoff']);
const STROBE_PHASES = new Set(['inbound', 'holding', 'approach', 'goaround', 'rollout', 'lineup', 'takeoff']);

class Plane {
  constructor(type, liv) {
    this.id = planeSeq++;
    this.type = type;
    this.liv = liv;
    this.callsign = LIVERIES[liv].code + randi(101, 989);
    this.x = 0; this.y = 0; this.z = 0; this.z0 = 0; this.vz = 0;
    this.hdg = 0; this.speed = 0;
    this.path = null; this.s = 0; this.reverse = false;
    this.phase = 'inbound'; this.t = 0; this.wait = 0;
    this.gate = null; this.hold = null; this.cleared = false; this.landClear = false;
    this.anim = rand(10);
    this.mul = type === 'prop' ? 0.85 : 1;
    this.fuel = null; // seconds of flight left (player mode only)
    this.dead = false;
  }
  get T() { return PLANE_TYPES[this.type]; }
  get onGround() { return this.z < 0.5; }
  get remaining() { return this.path.length - this.s; }

  setPhase(phase, path, s = 0) {
    this.phase = phase;
    this.t = 0;
    this.wait = 0;
    if (path) { this.path = path; this.s = s; }
    this.sync();
  }
  sync() {
    const p = this.path.pos(this.s);
    this.x = p.x;
    this.y = p.y;
    this.hdg = this.path.heading(this.s) + (this.reverse ? Math.PI : 0);
  }
  advance(ds) {
    this.s = this.path.closed ? this.path.wrap(this.s + ds) : Math.min(this.path.length, this.s + ds);
    this.sync();
  }
  local(lx, ly) {
    const c = Math.cos(this.hdg), s = Math.sin(this.hdg);
    return [this.x + lx * c - ly * s, this.y + lx * s + ly * c];
  }
  holdZ() { return 26 + Math.max(0, this.hold.planes.indexOf(this)) * 9; }

  update(dt) {
    this.t += dt;
    this.anim += dt;
    // fuel only counts down while waiting in the hold for a clearance
    if (this.fuel !== null && this.phase === 'holding' && !this.cleared) this.fuel = Math.max(0, this.fuel - dt);
    switch (this.phase) {
      case 'inbound': return this.updInbound(dt);
      case 'holding': return this.updHolding(dt);
      case 'approach': return this.updApproach(dt);
      case 'goaround': return this.updGoAround(dt);
      case 'rollout': return this.updRollout(dt);
      case 'taxiin': return this.updTaxiIn(dt);
      case 'parked': return this.updParked(dt);
      case 'pushback': return this.updPushback(dt);
      case 'pushdone': return this.updPushdone(dt);
      case 'taxiout': return this.updTaxiOut(dt);
      case 'holdshort': return this.updHoldShort(dt);
      case 'lineup': return this.updLineup(dt);
      case 'takeoff': return this.updTakeoff(dt);
    }
  }

  // ---- airborne phases --------------------------------------------------------
  updInbound(dt) {
    this.speed = SPD.hold * 1.15 * this.mul;
    this.advance(this.speed * dt);
    this.z = moveTo(this.z, 26 + this.hold.planes.length * 9, 6 * dt);
    if (this.remaining < 0.01) this.enterHold(0, false);
  }

  enterHold(s, front) {
    this.hold.planes.push(this);
    this.landClear = false;
    this.setPhase('holding', this.hold.loop, s);
    if (front) ctl().holdQueue.unshift(this);
    else ctl().holdQueue.push(this);
  }

  updHolding(dt) {
    const h = this.hold, L = this.path.length, ds = SPD.hold * this.mul * dt;
    this.speed = SPD.hold * this.mul;
    this.z = moveTo(this.z, this.holdZ(), 6 * dt);
    const toExit = (((h.exitS - this.s) % L) + L) % L;
    if (this.cleared && toExit <= ds) {
      h.planes.splice(h.planes.indexOf(this), 1);
      this.z0 = this.z;
      this.setPhase('approach', h.approach, ds - toExit);
    } else {
      this.advance(ds);
    }
  }

  updApproach(dt) {
    const h = this.hold;
    this.speed = lerp(SPD.hold, SPD.final, clamp(this.s / h.sFaf, 0, 1)) * this.mul;
    this.advance(this.speed * dt);
    this.z = this.s < h.sFaf
      ? lerp(this.z0, 16, smoothstep(0, 1, this.s / h.sFaf))
      : 16 * (1 - (this.s - h.sFaf) / (h.sTd - h.sFaf));
    if (!this.landClear && this.s >= h.sDecide) {
      if (chance(ctl().goAroundChance)) return this.goAround('UNSTABLE APPROACH');
      if (!ctl().requestLanding(this)) return this.goAround('RUNWAY OCCUPIED');
      this.landClear = true;
    }
    if (this.remaining < 0.01) this.touchdown();
  }

  goAround(reason) {
    ctl().onGoAround(this, reason);
    this.cleared = false;
    this.landClear = false;
    this.setPhase('goaround', goAroundPath(this.x, this.y));
  }

  updGoAround(dt) {
    this.speed = Math.min(30 * this.mul, this.speed + 4 * dt);
    this.z = Math.min(36, this.z + 6 * dt);
    this.advance(this.speed * dt);
    if (this.remaining < 0.01) {
      this.hold = HOLDS[0];
      this.enterHold(this.hold.joinS, true);
    }
  }

  // ---- landing and taxi-in ------------------------------------------------------
  touchdown() {
    this.z = 0;
    ctl().onTouchdown(this);
    Particles.puff(this.x - 2, this.y - 3, 4);
    Particles.puff(this.x - 2, this.y + 3, 4);
    const p = landingPath(this.gate, chance(ctl().hsExitChance) ? 'hs' : 'end');
    this.decel = Math.max(0.5, (this.speed ** 2 - p.vExit ** 2) / (2 * Math.max(20, p.sExit)));
    this.setPhase('rollout', p, 0);
  }

  updRollout(dt) {
    this.speed = Math.max(this.path.vExit, this.speed - this.decel * dt);
    this.advance(this.speed * dt);
    if (this.s >= this.path.sExit) {
      // turning off: in player mode the runway is free for the next clearance from here on
      if (ctl().releaseAtExit) ctl().releaseRunway(this);
      this.phase = 'taxiin';
      ctl().say(`${this.callsign} VACATE LEFT, TAXI TO STAND ${this.gate.id}`);
    }
  }

  updTaxiIn(dt) {
    if (ctl().runway === this && this.s >= this.path.sClear) ctl().releaseRunway(this);
    this.drive(dt, SPD.taxi);
    if (this.remaining < 0.4 && this.speed < 2) this.park(ctl().turnaround());
  }

  park(turnaround) {
    this.s = this.path.length;
    this.sync();
    this.speed = 0;
    this.phase = 'parked';
    this.t = 0;
    this.turnaround = turnaround;
    this.gate.plane = this;
    Services.arrive(this.gate, turnaround);
  }

  // ---- turnaround and departure ---------------------------------------------------
  updParked(dt) {
    const g = this.gate;
    g.bridge = moveTo(g.bridge, this.t > 1.5 && this.t < this.turnaround - 4 ? 1 : 0, dt * 0.5);
    if (this.t > this.turnaround && g.bridge === 0 && ctl().requestPushback(this)) {
      this.reverse = true;
      this.setPhase('pushback', pushbackPath(g), 0);
    }
  }

  updPushback(dt) {
    if (this.t < 1.6) return; // tug drives up and connects
    const stop = Math.sqrt(2 * 1.2 * this.remaining) + 0.1;
    this.speed = Math.min(SPD.push, this.speed + 1.2 * dt, stop);
    this.advance(this.speed * dt);
    if (this.remaining < 0.05) {
      this.speed = 0;
      this.phase = 'pushdone';
      this.t = 0;
    }
  }

  updPushdone() {
    if (!this.started && this.t > 0.8) {
      this.started = true;
      const [ex, ey] = this.local(-this.T.nose, 0);
      Particles.puff(ex, ey, 5, '#9aa0a8', 0);
    }
    if (this.t > 2.6) {
      const g = this.gate;
      g.plane = null;
      g.reserved = null;
      this.gate = null;
      this.reverse = false;
      this.setPhase('taxiout', taxiOutPath(g), 0);
      ctl().say(`${this.callsign} TAXI TO HOLDING POINT RWY 09`);
    }
  }

  updTaxiOut(dt) {
    this.drive(dt, SPD.taxi);
    if (this.remaining < 0.4 && this.speed < 2) {
      this.s = this.path.length;
      this.sync();
      this.speed = 0;
      this.phase = 'holdshort';
      this.t = 0;
    }
  }

  updHoldShort() {
    if (!ctl().canTakeoff(this)) return;
    const routes = this.type === 'prop' ? ['north', 'south', 'west'] : ['east', 'east', 'north', 'south', 'west'];
    this.setPhase('lineup', takeoffPath(pick(routes)), 0);
  }

  updLineup(dt) {
    const sl = this.path.sLined, rolling = ctl().rollingTakeoff;
    if (this.s < sl - 0.3) {
      this.drive(dt, 6, false, rolling ? null : sl);
      return;
    }
    if (!rolling) {
      this.speed = 0;
      this.wait += dt;
      if (this.wait <= ctl().lineupWait) return;
    }
    this.phase = 'takeoff';
    this.t = 0;
    ctl().onLinedUp(this);
  }

  updTakeoff(dt) {
    const airborne = this.z > 0;
    this.speed = Math.min(SPD.climb * this.mul, this.speed + (airborne ? 2.2 : 7 * this.mul) * dt);
    if (airborne || this.speed >= SPD.rotate * this.mul) {
      this.vz = Math.min(5.5, this.vz + 2.4 * dt);
      this.z = Math.min(90, this.z + this.vz * dt);
    }
    this.advance(this.speed * dt);
    if (ctl().runway === this && this.z > 4) ctl().releaseRunway(this);
    if (!this.handoff && this.z > 18) {
      this.handoff = true;
      ctl().onDeparted(this);
    }
    const off = this.x < VIEW.x - 40 || this.x > VIEW.x + VIEW.w + 40 || this.y < VIEW.y - 40 || this.y > VIEW.y + VIEW.h + 40;
    if (this.remaining < 0.5 || off) this.dead = true;
  }

  // ---- ground movement ------------------------------------------------------------
  drive(dt, vmax, traffic = true, stopAt = null) {
    let target = Math.min(vmax, this.path.turnLimit(this.s, BRAKE));
    const end = stopAt === null ? this.path.length : stopAt;
    target = Math.min(target, Math.sqrt(2 * BRAKE * Math.max(0, end - this.s)));
    if (traffic) target = Math.min(target, this.trafficLimit());
    this.speed = this.speed < target
      ? Math.min(target, this.speed + ACC * dt)
      : Math.max(target, this.speed - BRAKE * 2 * dt);
    this.advance(this.speed * dt);
  }

  // Distance to q if q is inside our forward cone, else 0.
  sees(q) {
    const dir = this.reverse ? this.hdg + Math.PI : this.hdg;
    const dx = q.x - this.x, dy = q.y - this.y, d = Math.hypot(dx, dy);
    if (d > 44 || d < 0.01) return 0;
    return Math.abs(angDiff(dir, Math.atan2(dy, dx))) < 0.6 ? d : 0;
  }

  trafficLimit() {
    let lim = 99;
    for (const q of planes) {
      if (q === this || q.dead || !q.onGround || q.phase === 'parked') continue;
      const d = this.sees(q);
      if (!d) continue;
      if (this.id < q.id && q.sees(this)) continue; // mutual stand-off: the older plane goes first
      lim = Math.min(lim, Math.max(0, (d - (this.T.nose + q.T.nose + 5)) * 0.8));
    }
    return lim;
  }

  // ---- drawing ----------------------------------------------------------------------
  get running() { return this.phase !== 'parked'; }

  drawShadow(g, day) {
    const o = this.T.out >> 1;
    g.globalAlpha = (0.3 - Math.min(0.12, this.z * 0.0015)) * day;
    g.drawImage(planeShadow(this.type, this.hdg),
      Math.round(this.x + this.z * 0.5 + 1) - o, Math.round(this.y + this.z * 0.75 + 1) - o);
    g.globalAlpha = 1;
  }

  draw(g) {
    const o = this.T.out >> 1;
    const frame = this.type === 'prop' && this.running ? Math.floor(this.anim * 24) % 2 : 0;
    g.drawImage(planeSprite(this.type, this.liv, frame, this.hdg), Math.round(this.x) - o, Math.round(this.y) - o);
    if (!this.running) return;
    if (this.anim % 1.2 < 0.12) {
      g.fillStyle = '#ff3b30';
      g.fillRect(Math.round(this.x), Math.round(this.y), 1, 1);
    }
    if (this.strobeOn()) {
      const [wx, wy] = this.T.wing;
      g.fillStyle = '#ffffff';
      for (const side of [-1, 1]) {
        const [x, y] = this.local(wx, wy * side);
        g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    }
  }

  strobeOn() {
    const t = this.anim % 1.5;
    return STROBE_PHASES.has(this.phase) && (t < 0.06 || (t > 0.16 && t < 0.22));
  }

  // Additive light pass (only drawn when it is dark).
  drawLights(g) {
    const [wx, wy] = this.T.wing;
    const [lx, ly] = this.local(wx, -wy), [rx, ry] = this.local(wx, wy), [tx, ty] = this.local(this.T.tail, 0);
    glow(g, lx, ly, '#ff3020');
    glow(g, rx, ry, '#30ff60');
    glow(g, tx, ty, '#ffffff');
    if (!this.running) return;
    if (this.anim % 1.2 < 0.12) glow(g, this.x, this.y, '#ff2a20', true);
    if (this.strobeOn()) {
      glow(g, lx, ly, '#ffffff', true);
      glow(g, rx, ry, '#ffffff', true);
    }
    if (LIT_PHASES.has(this.phase) && this.z < 40 && (this.phase !== 'rollout' || this.speed > 9)) {
      const c = Math.cos(this.hdg), s = Math.sin(this.hdg), n = this.T.nose;
      const x0 = this.x + c * n, y0 = this.y + s * n, len = 34, wid = 9;
      g.fillStyle = 'rgba(255,244,214,0.16)';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x0 + c * len - s * wid, y0 + s * len + c * wid);
      g.lineTo(x0 + c * len + s * wid, y0 + s * len - c * wid);
      g.closePath();
      g.fill();
    }
  }

  tugPos() {
    const g = this.gate;
    if (!g || (this.phase !== 'pushback' && this.phase !== 'pushdone')) return null;
    const home = { x: g.x + 8, y: 59 };
    const [nx, ny] = this.local(this.T.nose + 3, 0);
    const nose = { x: nx, y: ny };
    const mix = (a, b, f) => ({ x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) });
    if (this.phase === 'pushback') return mix(home, nose, smoothstep(0, 1.5, this.t));
    const f = clamp((this.t - 0.6) / 1.8, 0, 1);
    return f >= 1 ? null : mix(nose, home, smoothstep(0, 1, f));
  }

  drawTug(g) {
    const p = this.tugPos();
    if (!p) return;
    const x = Math.round(p.x) - 1, y = Math.round(p.y) - 1;
    fillRect(g, x + 1, y + 1, 3, 3, 'rgba(0,0,0,0.3)');
    fillRect(g, x, y, 3, 3, '#f0c419');
    fillRect(g, x + 1, y + 1, 1, 1, '#3a3f4a');
  }

  drawLabel(g, selected) {
    const x = Math.round(this.x) + 8, y = Math.round(this.y) - 14;
    drawText(g, this.callsign, x, y, selected ? '#ffe66b' : '#ffffff', '#10131a');
    if (this.fuel !== null && AIR_ARRIVAL_PHASES.has(this.phase)) {
      drawText(g, fmtTime(this.fuel), x, y + 6, fuelStyle(this), '#10131a');
    } else if (this.z > 1) {
      drawText(g, String(Math.round(this.z * 1.2)).padStart(3, '0'), x, y + 6, '#9fd3ff', '#10131a');
    }
  }
}

// gate may be null (player mode assigns one with the landing clearance); fuel in seconds or null.
function spawnArrival(gate, progress = 0, fuel = null) {
  const p = new Plane(chance(0.28) ? 'prop' : 'jet', randi(0, LIVERIES.length - 1));
  p.fuel = fuel;
  if (gate) {
    p.gate = gate;
    gate.reserved = p;
  }
  const load = (h) => planes.filter((q) => q.hold === h && (q.phase === 'inbound' || q.phase === 'holding')).length;
  p.hold = load(HOLDS[0]) <= load(HOLDS[1]) ? HOLDS[0] : HOLDS[1];
  p.z = p.z0 = rand(56, 70);
  const path = inboundPath(p.hold);
  p.setPhase('inbound', path, path.length * progress);
  p.speed = SPD.hold * p.mul;
  planes.push(p);
  ctl().say(`${p.callsign} RADAR CONTACT, HOLD ${p.hold.name}`);
  return p;
}

function placeAtGate(gate, turnaround) {
  const p = new Plane(chance(0.25) ? 'prop' : 'jet', randi(0, LIVERIES.length - 1));
  p.gate = gate;
  gate.reserved = p;
  p.path = landingPath(gate, 'hs');
  p.s = p.path.length;
  p.sync();
  p.park(turnaround + 2);
  p.t = 2;
  gate.bridge = 1;
  planes.push(p);
  return p;
}
