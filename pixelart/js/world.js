'use strict';
/* Airport geometry: runway, taxiways, stands, holding stacks and every route builder.
   Runway 09 is used for both landings and departures (traffic flows west -> east). */

const RWY = { x0: 140, x1: 452, y: 160, hw: 7 };
const TD_X = 160; // touchdown point on the centreline
const TWY_Y = 128; // parallel taxiway A
const LANE_Y = 100; // apron taxilane
const STAND_Y = 74; // parked aircraft centre
const EAST_X = 444; // east connector (runway end -> apron)
const WEST_X = 250; // west connector (apron -> taxiway A)
const HOLD_X = 150; // runway entry / holding point connector
const HOLD_STOP_Y = 136; // where departures wait
const HS_EXIT = [[262, RWY.y, 18], [308, TWY_Y, 18]]; // high-speed exit

const GATES = [286, 320, 354, 388, 422].map((x, i) => ({
  id: i + 1, x, y: STAND_Y, plane: null, reserved: null, bridge: 0,
}));

const HOLD_L = 22, HOLD_R = 20;
const HOLDS = [
  { name: 'NORTH', cx: 68, cy: 60, cw: true, planes: [] },
  { name: 'SOUTH', cx: 68, cy: 236, cw: false, planes: [] },
];

function buildHold(h) {
  const { cx, cy } = h, L = HOLD_L, r = HOLD_R, P = Math.PI;
  if (h.cw) {
    // clockwise racetrack: entry at the start of the top leg, exit at the end of the bottom leg
    h.loop = new PathBuilder(cx - L, cy - r)
      .line(cx + L, cy - r).arc(cx + L, cy, r, -P / 2, P / 2)
      .line(cx - L, cy + r).arc(cx - L, cy, r, P / 2, P * 1.5)
      .build(true);
    h.exit = { x: cx - L, y: cy + r };
    h.join = { x: cx + L, y: cy + r };
    const R = (RWY.y - h.exit.y) / 2; // left U-turn down onto the extended centreline
    h.approach = new PathBuilder(h.exit.x, h.exit.y)
      .arc(h.exit.x, h.exit.y + R, R, -P / 2, -P * 1.5).line(TD_X, RWY.y).build();
  } else {
    // anticlockwise mirror image for the southern stack
    h.loop = new PathBuilder(cx - L, cy + r)
      .line(cx + L, cy + r).arc(cx + L, cy, r, P / 2, -P / 2)
      .line(cx - L, cy - r).arc(cx - L, cy, r, -P / 2, -P * 1.5)
      .build(true);
    h.exit = { x: cx - L, y: cy - r };
    h.join = { x: cx + L, y: cy - r };
    const R = (h.exit.y - RWY.y) / 2;
    h.approach = new PathBuilder(h.exit.x, h.exit.y)
      .arc(h.exit.x, h.exit.y - R, R, P / 2, P * 1.5).line(TD_X, RWY.y).build();
  }
  h.exitS = h.loop.nearest(h.exit.x, h.exit.y);
  h.joinS = h.loop.nearest(h.join.x, h.join.y);
  h.sTd = h.approach.length;
  h.sFaf = h.sTd - (TD_X - h.exit.x); // start of the straight final
  h.sDecide = h.sTd - 46; // landing clearance needed by here
}
HOLDS.forEach(buildHold);

// From just outside the visible area to the hold entry (start of the loop, s = 0).
function inboundPath(h) {
  const e = h.loop.pos(0);
  const fromSide = chance(0.6);
  const left = Math.min(-26, VIEW.x - 26);
  const top = Math.min(-26, VIEW.y - 26), bottom = Math.max(H + 26, VIEW.y + VIEW.h + 26);
  let sx, sy;
  if (h.cw) {
    [sx, sy] = fromSide ? [left, rand(-10, 70)] : [rand(-20, 30), top];
  } else {
    [sx, sy] = fromSide ? [left, rand(200, H + 10)] : [rand(-20, 30), bottom];
  }
  return new PathBuilder(sx, sy).through([[14, e.y], [e.x, e.y]], 22).build();
}

// Missed approach: climb out over the runway, turn left and rejoin the northern stack.
function goAroundPath(x, y) {
  const j = HOLDS[0].join;
  return new PathBuilder(x, y).through([[330, RWY.y], [404, RWY.y, 40], [404, j.y, 40], [j.x, j.y]], 40).build();
}

// Touchdown -> rollout -> runway exit -> taxi to the stand.
function landingPath(gate, exitKind) {
  const tail = [[EAST_X, LANE_Y, 10], [gate.x, LANE_Y, 10], [gate.x, STAND_Y]];
  const nodes = exitKind === 'hs'
    ? [...HS_EXIT, [EAST_X, TWY_Y, 10], ...tail]
    : [[EAST_X, RWY.y, 10], ...tail];
  const p = new PathBuilder(TD_X, RWY.y).through(nodes, 10).build();
  p.sExit = Math.max(0, p.find((q) => Math.abs(q.y - RWY.y) > 0.3) - 6);
  p.sClear = p.find((q) => q.y < RWY.y - RWY.hw - 9);
  p.vExit = exitKind === 'hs' ? 8 : 5;
  return p;
}

// Pushback: reverse out of the stand onto the taxilane, ending nose-west.
function pushbackPath(g) {
  return new PathBuilder(g.x, STAND_Y).through([[g.x, LANE_Y, 12], [g.x + 22, LANE_Y]], 12).build();
}

// From the end of the pushback to the runway holding point.
function taxiOutPath(g) {
  return new PathBuilder(g.x + 22, LANE_Y)
    .through([[WEST_X, LANE_Y, 10], [WEST_X, TWY_Y, 10], [HOLD_X, TWY_Y, 7], [HOLD_X, HOLD_STOP_Y]], 10)
    .build();
}

// Each route ends far away; planes are removed once they leave the visible area.
const DEP_ROUTES = {
  east: [[1600, RWY.y]],
  north: [[392, RWY.y, 50], [470, 100, 50], [470, -1400]],
  south: [[392, RWY.y, 50], [470, 220, 50], [470, H + 1400]],
  west: [[400, RWY.y, 40], [462, 112, 40], [430, 30, 40], [300, 12, 50], [-1400, 12]],
};

// Holding point -> line up -> takeoff roll -> climb-out route (leaves the screen).
function takeoffPath(route) {
  const p = new PathBuilder(HOLD_X, HOLD_STOP_Y)
    .through([[HOLD_X, RWY.y, 9], [190, RWY.y], ...DEP_ROUTES[route]], 9)
    .build();
  p.sLined = p.find((q) => q.x >= HOLD_X + 11 && Math.abs(q.y - RWY.y) < 0.2);
  return p;
}
