'use strict';
/* Game modes and the player-driven Tower. The autopilot lives in atc.js; ctl() returns
   whichever controller is in charge, and planes only ever talk to ctl().

   Player rules: arrivals hold until cleared to land, a clearance is only possible while the
   runway light is green (nobody else holds a runway clearance) and a gate is free. Planes
   wait a fixed turnaround at the gate, then need RELEASE to push back and taxi to the
   holding point, where they wait for a takeoff clearance (green light again). One point
   per landing; any arrival running out of fuel ends the game. Fuel only counts down while
   a plane holds without a clearance. Traffic builds up for a few minutes, then levels off,
   and no new arrivals show up while several are already waiting. */

const TURNAROUND = 30; // seconds at the gate before a plane can be released
const PLAY_AIR_MAX = 6; // arrivals airborne at once
const PLAY_WAIT_MAX = 3; // no new arrivals while this many are waiting for a clearance
const BEST_KEY = 'pixelport-best';

const GAME = {
  mode: 'menu', // menu (autopilot demo behind the title) | auto | play | over
  culprit: null,
  best: 0,
  newBest: false,
};

try {
  GAME.best = Number(localStorage.getItem(BEST_KEY)) || 0;
} catch (e) {
  // storage unavailable (private window etc.) - best score just isn't remembered
}

function ctl() {
  return GAME.mode === 'play' || GAME.mode === 'over' ? Tower : ATC;
}

function fuelColor(f) {
  if (f < 30) return (performance.now() / 250) & 1 ? '#ff5a4d' : '#9c2f28';
  return f < 60 ? '#ffb84d' : '#9fd3ff';
}

// Colour for a plane's fuel readout: green once cleared (no longer counting), grey while
// inbound or going around (paused), otherwise by how much is left.
function fuelStyle(p) {
  if (p.cleared || p.phase === 'approach') return '#7ddc8f';
  if (p.phase !== 'holding') return '#9aa3b5';
  return fuelColor(p.fuel);
}

// Floating "+1" style text.
const Floaters = {
  list: [],
  add(x, y, text, col) {
    this.list.push({ x, y, text, col, t: 0 });
  },
  update(dt) {
    for (const f of this.list) {
      f.t += dt;
      f.y -= 8 * dt;
    }
    this.list = this.list.filter((f) => f.t < 1.6);
  },
  draw(g) {
    for (const f of this.list) {
      g.globalAlpha = clamp(1.6 - f.t, 0, 1);
      drawText(g, f.text, f.x - textWidth(f.text) / 2, f.y, f.col, '#10131a');
    }
    g.globalAlpha = 1;
  },
};

const Tower = {
  runway: null, // plane holding the runway clearance (light is red while set)
  holdQueue: [],
  score: 0,
  departed: 0,
  goArounds: 0,
  elapsed: 0,
  spawnT: 0,
  rollingTakeoff: true, // cleared for takeoff: no stop on the runway before the roll
  goAroundChance: 0.03,
  hsExitChance: 1, // always vacate by the high-speed exit
  releaseAtExit: true, // light goes green as soon as the arrival turns off the runway

  reset() {
    Object.assign(this, { runway: null, holdQueue: [], score: 0, departed: 0, goArounds: 0, elapsed: 0, spawnT: 0 });
  },

  start() {
    placeAtGate(GATES[0], 6);
    placeAtGate(GATES[3], 18);
    spawnArrival(null, 0.5, rand(110, 140));
    this.spawnT = 14;
    this.say('TOWER ONLINE. YOU HAVE CONTROL');
  },

  freeGate() {
    const free = GATES.filter((g) => !g.plane && !g.reserved);
    return free.length ? pick(free) : null;
  },

  update(dt) {
    for (const l of ATC.log) l.t += dt;
    this.elapsed += dt;
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      const air = planes.filter((p) => AIR_ARRIVAL_PHASES.has(p.phase));
      const waiting = air.filter((p) => !p.cleared).length;
      if (air.length < PLAY_AIR_MAX && waiting < PLAY_WAIT_MAX) {
        spawnArrival(null, 0, chance(0.15) ? rand(55, 75) : rand(90, 160));
        // one arrival every ~50s, tightening to a steady ~40s after 5 minutes
        this.spawnT = clamp(50 - this.elapsed / 30, 40, 50) * rand(0.8, 1.2);
      } else {
        this.spawnT = 3; // airspace busy: hold new traffic back and check again shortly
      }
    }
    for (const p of planes) {
      if (p.fuel === null || !AIR_ARRIVAL_PHASES.has(p.phase)) continue;
      if (p.fuel < 45 && !p.warned) {
        p.warned = 1;
        this.say(`${p.callsign} MINIMUM FUEL`);
      }
      if (p.fuel < 20 && p.warned < 2) {
        p.warned = 2;
        this.say(`MAYDAY MAYDAY ${p.callsign} FUEL EMERGENCY`);
      }
      if (p.fuel <= 0) return this.gameOver(p);
    }
  },

  gameOver(p) {
    GAME.mode = 'over';
    GAME.culprit = p;
    GAME.newBest = this.score > GAME.best;
    if (GAME.newBest) {
      GAME.best = this.score;
      try {
        localStorage.setItem(BEST_KEY, String(this.score));
      } catch (e) {
        // ignore - best score is a convenience
      }
    }
    this.say(`${p.callsign} OUT OF FUEL!`);
    selected = p;
  },

  // ---- player actions ---------------------------------------------------------
  okLand(p) {
    return !!p && (p.phase === 'inbound' || p.phase === 'holding') && !p.cleared && !this.runway && !!this.freeGate();
  },
  land(p) {
    if (!this.okLand(p)) return false;
    const g = this.freeGate();
    g.reserved = p;
    p.gate = g;
    p.cleared = true;
    this.runway = p;
    this.say(`${p.callsign} RWY 09 CLEARED TO LAND, STAND ${g.id}`);
    return true;
  },
  okRelease(p) {
    return !!p && p.phase === 'parked' && !p.released && p.t >= p.turnaround;
  },
  release(p) {
    if (!this.okRelease(p)) return false;
    p.released = true;
    this.say(`${p.callsign} RELEASED FROM STAND ${p.gate.id}`);
    return true;
  },
  okTakeoff(p) {
    return !!p && p.phase === 'holdshort' && !p.toCleared && !this.runway;
  },
  takeoff(p) {
    if (!this.okTakeoff(p)) return false;
    p.toCleared = true;
    this.runway = p;
    this.say(`${p.callsign} RWY 09 CLEARED FOR TAKEOFF`);
    return true;
  },
  act(p) {
    return this.land(p) || this.release(p) || this.takeoff(p);
  },
  // label for the action a plane is waiting on, if any
  actionFor(p) {
    if ((p.phase === 'inbound' || p.phase === 'holding') && !p.cleared) return 'LAND';
    if (p.phase === 'parked' && !p.released && p.t >= p.turnaround) return 'RELEASE';
    if (p.phase === 'holdshort' && !p.toCleared) return 'TAKEOFF';
    return null;
  },

  // ---- controller hooks used by planes ------------------------------------------
  say(text) {
    ATC.say(text);
  },
  turnaround() {
    return TURNAROUND;
  },
  requestLanding(p) {
    return this.runway === p;
  },
  canTakeoff(p) {
    return !!p.toCleared;
  },
  releaseRunway(p) {
    if (this.runway === p) this.runway = null;
  },
  onTouchdown(p) {
    this.score++;
    Floaters.add(p.x, p.y - 12, '+1', '#ffe66b');
  },
  onGoAround(p, reason) {
    if (this.runway === p) this.runway = null;
    if (p.gate) {
      p.gate.reserved = null;
      p.gate = null;
    }
    this.goArounds++;
    this.say(`${p.callsign} GO AROUND! ${reason}`);
  },
  onLinedUp() {},
  onDeparted(p) {
    this.departed++;
    this.say(`${p.callsign} CONTACT DEPARTURE, GOOD DAY`);
  },
  requestPushback(p) {
    if (!p.released || !pushbackClear(p)) return false;
    this.say(`${p.callsign} PUSH AND START APPROVED`);
    return true;
  },
};

// ---- world reset / mode switching ---------------------------------------------------
function resetWorld() {
  planes.length = 0;
  for (const g of GATES) {
    g.plane = null;
    g.reserved = null;
    g.bridge = 0;
  }
  for (const h of HOLDS) h.planes.length = 0;
  Services.list = [];
  Particles.list = [];
  Floaters.list = [];
  ATC.reset();
  Tower.reset();
  selected = null;
  GAME.culprit = null;
}

function populateAuto() {
  placeAtGate(GATES[0], 4);
  placeAtGate(GATES[2], 16);
  placeAtGate(GATES[3], 30);
  spawnArrival(GATES[1], 0.6);
  spawnArrival(GATES[4], 0.1);
}

function setMode(mode) {
  const from = GAME.mode;
  paused = false;
  if (mode === 'play') {
    resetWorld();
    GAME.mode = 'play';
    Tower.start();
    return;
  }
  GAME.mode = mode; // 'menu' or 'auto' - both run the autopilot
  if (from === 'play' || from === 'over') {
    resetWorld();
    populateAuto();
  }
}
