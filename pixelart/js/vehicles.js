'use strict';
/* Ground vehicles: landside road traffic, apron service trucks and the jet bridges. */

const CAR_COLS = ['#c0392b', '#2e6fd0', '#e8e8e8', '#2c2f36', '#f1c40f', '#7f8c8d', '#27ae60', '#8e44ad', '#e67e22'];

const Cars = {
  list: [],
  t: 0,
  update(dt) {
    this.t -= dt;
    if (this.t <= 0) {
      this.t = rand(0.8, 3.2);
      const dir = chance(0.5) ? 1 : -1;
      this.list.push({
        x: dir > 0 ? VIEW.x - 10 : VIEW.x + VIEW.w + 2, y: dir > 0 ? 11 : 5, dir,
        v: rand(16, 28), col: pick(CAR_COLS), len: chance(0.1) ? 9 : 5,
      });
    }
    for (const c of this.list) {
      let v = c.v;
      for (const o of this.list) {
        if (o === c || o.dir !== c.dir) continue;
        const gap = (o.x - c.x) * c.dir;
        if (gap > 0 && gap < 14) v = Math.min(v, (gap - (c.dir > 0 ? c.len : o.len) - 2) * 4);
      }
      c.x += Math.max(0, v) * c.dir * dt;
    }
    this.list = this.list.filter((c) => c.x > VIEW.x - 14 && c.x < VIEW.x + VIEW.w + 14);
  },
  draw(g) {
    for (const c of this.list) {
      const x = Math.round(c.x);
      fillRect(g, x + 1, c.y + 1, c.len, 3, 'rgba(0,0,0,0.25)');
      fillRect(g, x, c.y, c.len, 3, c.len > 5 ? '#e6b422' : c.col);
      fillRect(g, c.dir > 0 ? x + c.len - 2 : x + 1, c.y, 1, 3, '#1d2430');
    }
  },
  drawLights(g) {
    for (const c of this.list) {
      const x = Math.round(c.x);
      const fx = c.dir > 0 ? x + c.len : x - 1, bx = c.dir > 0 ? x - 1 : x + c.len;
      glow(g, fx, c.y, '#fff2c0');
      glow(g, fx, c.y + 2, '#fff2c0');
      g.fillStyle = '#ff3020';
      g.fillRect(bx, c.y, 1, 1);
      g.fillRect(bx, c.y + 2, 1, 1);
    }
  },
};

// Fuel truck / baggage train that drive down from the terminal to a parked aircraft.
class ServiceTruck {
  constructor(kind, x, workY, tIn, tOut) {
    this.kind = kind;
    this.x = x;
    this.homeY = 58;
    this.y = this.homeY;
    this.workY = workY;
    this.tIn = tIn;
    this.tOut = tOut;
    this.t = 0;
    this.dir = 1;
    this.dead = false;
  }
  update(dt) {
    this.t += dt;
    const target = this.t < this.tIn || this.t >= this.tOut ? this.homeY : this.workY;
    if (target !== this.y) this.dir = Math.sign(target - this.y);
    this.y = moveTo(this.y, target, 9 * dt);
    if (this.t >= this.tOut && this.y === this.homeY) this.dead = true;
  }
  get moving() {
    return this.y !== this.homeY && this.y !== this.workY;
  }
  draw(g) {
    const x = this.x, y = Math.round(this.y);
    // parts listed front-to-back; the front faces the direction of travel
    const parts = this.kind === 'fuel'
      ? [[2, '#2e6fd0'], [6, '#eef0f2']]
      : [[3, '#e5b52b'], [1, null], [3, '#8c919b'], [1, null], [3, '#8c919b']];
    const len = parts.reduce((a, p) => a + p[0], 0);
    fillRect(g, x + 1, y + 1, 3, len, 'rgba(0,0,0,0.25)');
    let off = 0;
    for (const [n, col] of parts) {
      if (col) {
        const py = this.dir > 0 ? y + len - off - n : y + off;
        fillRect(g, x, py, 3, n, col);
      }
      off += n;
    }
    if (this.kind === 'fuel') fillRect(g, x, y + (this.dir > 0 ? 1 : 3), 3, 1, '#c5c9cf');
  }
  drawLights(g, time) {
    if (Math.floor(time * 3 + this.x) % 2) glow(g, this.x + 1, Math.round(this.y) + 1, '#ffab2e');
  }
}

const Services = {
  list: [],
  arrive(gate, turnaround) {
    this.list.push(new ServiceTruck('fuel', gate.x + 12, 79, 2.5, turnaround - 7));
    this.list.push(new ServiceTruck('bags', gate.x - 13, 80, 1.5, turnaround - 6));
  },
  update(dt) {
    for (const v of this.list) v.update(dt);
    this.list = this.list.filter((v) => !v.dead);
  },
  draw(g) {
    for (const v of this.list) v.draw(g);
  },
  drawLights(g, time) {
    for (const v of this.list) v.drawLights(g, time);
  },
};

function drawBridges(g) {
  for (const gt of GATES) {
    const L = Math.round(2 + gt.bridge * 6), x = gt.x - 9;
    fillRect(g, x + 1, 58, 3, L, 'rgba(0,0,0,0.25)');
    fillRect(g, x, 57, 3, L, '#c9cdd5');
    fillRect(g, x + 2, 57, 1, L, '#a3a9b4');
    fillRect(g, x, 56 + L, 3, 1, '#4b505b');
    if (gt.bridge > 0.95) fillRect(g, x + 3, 55 + L, 3, 2, '#b8bdc7');
  }
}
