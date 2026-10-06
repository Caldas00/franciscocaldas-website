'use strict';
/* Autopilot air traffic control: owns the runway, sequences arrivals out of the holding
   stacks, clears departures into gaps, approves pushbacks and keeps the radio log.
   The player-driven Tower (game.js) implements the same hooks; planes call ctl(). */

const DEP_PHASES = new Set(['pushback', 'pushdone', 'taxiout', 'holdshort', 'lineup']);
const AIR_ARRIVAL_PHASES = new Set(['inbound', 'holding', 'approach', 'goaround']);

// Ground safety shared by both controllers: room on the taxilane and a short departure queue.
function pushbackClear(p) {
  if (planes.filter((q) => DEP_PHASES.has(q.phase)).length >= 4) return false;
  const gx = p.gate.x;
  for (const q of planes) {
    if (q === p || !q.onGround || q.phase === 'parked') continue;
    if (q.x > gx - 24 && q.x < 470 && q.y > 84 && q.y < 140) return false;
  }
  return true;
}

const ATC = {
  runway: null, // plane currently owning runway 09
  approach: null, // plane released from the stack and flying the approach
  holdQueue: [],
  lastUse: 'dep',
  log: [],
  spawnT: 7,
  arrCount: 0,
  depCount: 0,
  goArounds: 0,
  lineupWait: 1.4,
  rollingTakeoff: false,
  goAroundChance: 0.04,
  hsExitChance: 0.8, // landings that take the high-speed exit (the rest roll to the end)
  releaseAtExit: false, // runway stays occupied until the arrival is fully clear

  reset() {
    Object.assign(this, {
      runway: null, approach: null, holdQueue: [], lastUse: 'dep', log: [],
      spawnT: 7, arrCount: 0, depCount: 0, goArounds: 0,
    });
  },

  turnaround() {
    return rand(26, 46);
  },

  say(text) {
    this.log.push({ text, t: 0 });
    if (this.log.length > 4) this.log.shift();
  },

  // Seconds until the plane reaches the runway threshold.
  eta(p) {
    const h = p.hold;
    if (p.phase === 'holding') {
      const L = h.loop.length;
      return ((((h.exitS - p.s) % L) + L) % L + h.sTd) / p.speed;
    }
    if (p.phase === 'approach') return (h.sTd - p.s) / Math.max(1, p.speed);
    return 99;
  },

  // Rough seconds until the current runway user is out of the way.
  clearTime() {
    const r = this.runway;
    if (!r) return 0;
    if (r.phase === 'rollout' || r.phase === 'taxiin') return Math.max(0, r.path.sClear - r.s) / Math.max(5, r.speed * 0.75);
    const roll = 7.5; // takeoff roll + initial climb until the runway is released
    if (r.phase === 'takeoff') return r.z > 0 ? 0.8 : Math.max(0, SPD.rotate * r.mul - r.speed) / (7 * r.mul) + 2;
    if (r.phase === 'lineup') return Math.max(0, r.path.sLined - r.s) / 4 + Math.max(0, this.lineupWait - r.wait) + roll;
    return roll;
  },

  update(dt) {
    for (const l of this.log) l.t += dt;

    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = rand(11, 20);
      const inAir = planes.filter((p) => AIR_ARRIVAL_PHASES.has(p.phase)).length;
      const free = GATES.filter((g) => !g.plane && !g.reserved);
      if (inAir < 4 && free.length) spawnArrival(pick(free));
    }

    // Release the next arrival from the stack. When a departure is waiting and the
    // last runway use was a landing, let the departure go first (alternate).
    if (!this.approach && this.holdQueue.length) {
      const depWaiting = planes.some((p) => p.phase === 'holdshort');
      const next = this.holdQueue[0];
      // the runway must be free before the arrival reaches its decision point
      const rwyOK = this.clearTime() < this.eta(next) - 3;
      if (rwyOK && !(depWaiting && this.lastUse === 'arr')) {
        const p = this.holdQueue.shift();
        p.cleared = true;
        this.approach = p;
        this.say(`${p.callsign} CLEARED ILS APPROACH RWY 09`);
      }
    }
  },

  requestLanding(p) {
    if (this.runway) return false;
    this.runway = p;
    this.lastUse = 'arr';
    this.say(`${p.callsign} RWY 09 CLEARED TO LAND`);
    return true;
  },

  canTakeoff(p) {
    if (this.runway) return false;
    // lining up + rolling takes ~18s; the arrival must not reach its decision point before that
    if (this.approach && this.eta(this.approach) < 21) return false;
    this.runway = p;
    this.lastUse = 'dep';
    this.say(`${p.callsign} LINE UP AND WAIT RWY 09`);
    return true;
  },

  releaseRunway(p) {
    if (this.runway === p) this.runway = null;
  },

  onTouchdown(p) {
    if (this.approach === p) this.approach = null;
    this.arrCount++;
  },

  onGoAround(p, reason) {
    if (this.approach === p) this.approach = null;
    if (this.runway === p) this.runway = null;
    this.goArounds++;
    this.say(`${p.callsign} GO AROUND! ${reason}`);
  },

  onLinedUp(p) {
    this.say(`${p.callsign} RWY 09 CLEARED FOR TAKEOFF`);
  },

  onDeparted(p) {
    this.depCount++;
    this.say(`${p.callsign} CONTACT DEPARTURE, GOOD DAY`);
  },

  requestPushback(p) {
    if (!pushbackClear(p)) return false;
    this.say(`${p.callsign} PUSH AND START APPROVED`);
    return true;
  },
};
