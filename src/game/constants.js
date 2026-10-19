export const CANVAS_W = 900;
export const CANVAS_H = 600;

export const PLAYER = {
  size: 22,
  speed: 200,
  maxHealth: 100,
  fireCooldown: 260,
  invulnMs: 700,
};

export const BULLET = {
  size: 6,
  speed: 500,
  damage: 1,
  lifetime: 1500,
};

export const ENEMY_TYPES = {
  fast: {
    size: 16,
    speed: 80,
    hp: 1,
    damage: 10,
    color: "#f85149",
    points: 1,
    spawnWeight: 6,
  },
  tank: {
    size: 28,
    speed: 42,
    hp: 4,
    damage: 20,
    color: "#a371f7",
    points: 3,
    spawnWeight: 3,
  },
  splitter: {
    size: 22,
    speed: 58,
    hp: 2,
    damage: 15,
    color: "#3fb950",
    points: 2,
    spawnWeight: 2,
  },
};

export const DIFFICULTY = {
  initialSpawnMs: 2400,
  minSpawnMs: 900,
  rampDurationMs: 90000,
  doubleSpawnAfterMs: 45000,
  doubleSpawnChance: 0.3,
};

export const DIRECTIONS = {
  N:  { dx: 0,  dy: -1, angle: -Math.PI / 2 },
  NE: { dx: 1,  dy: -1, angle: -Math.PI / 4 },
  E:  { dx: 1,  dy: 0,  angle: 0 },
  SE: { dx: 1,  dy: 1,  angle: Math.PI / 4 },
  S:  { dx: 0,  dy: 1,  angle: Math.PI / 2 },
  SW: { dx: -1, dy: 1,  angle: (3 * Math.PI) / 4 },
  W:  { dx: -1, dy: 0,  angle: Math.PI },
  NW: { dx: -1, dy: -1, angle: (-3 * Math.PI) / 4 },
};

export const MAPS = [
  {
    // Four corridors formed by offset walls at the edges and middle.
    // Player spawns in the top-left quadrant; every edge has a lane.
    name: "The Cross",
    spawn: { x: 200, y: 150 },
    walls: [
      { x: 80,  y: 280, w: 220, h: 24 },   // left upper bar
      { x: 600, y: 280, w: 220, h: 24 },   // right upper bar
      { x: 80,  y: 380, w: 220, h: 24 },   // left lower bar
      { x: 600, y: 380, w: 220, h: 24 },   // right lower bar
      { x: 400, y: 80,  w: 24,  h: 160 },  // top center pillar
      { x: 400, y: 380, w: 24,  h: 160 },  // bottom center pillar
      { x: 300, y: 290, w: 24,  h: 80 },   // upper gap divider
      { x: 576, y: 290, w: 24,  h: 80 },   // lower gap divider
    ],
  },
  {
    // Wide-open arena with pillars spaced far apart.
    // Encourages long kiting runs around the perimeter.
    name: "Four Pillars",
    spawn: { x: 450, y: 120 },
    walls: [
      { x: 140, y: 160, w: 100, h: 100 },  // top-left
      { x: 660, y: 160, w: 100, h: 100 },  // top-right
      { x: 140, y: 360, w: 100, h: 100 },  // bottom-left
      { x: 660, y: 360, w: 100, h: 100 },  // bottom-right
      { x: 400, y: 60,  w: 24,  h: 100 },  // top nub
      { x: 400, y: 440, w: 24,  h: 100 },  // bottom nub
      { x: 60,  y: 280, w: 80,  h: 24 },   // left nub
      { x: 760, y: 280, w: 80,  h: 24 },   // right nub
    ],
  },
  {
    // Full-width bunker walls spanning the arena at four heights.
    // Creates lanes that force movement into the wide open side corridors.
    name: "The Bunker",
    spawn: { x: 450, y: 90 },
    walls: [
      { x: 100, y: 200, w: 320, h: 24 },   // upper-left bar
      { x: 500, y: 200, w: 320, h: 24 },   // upper-right bar
      { x: 100, y: 376, w: 320, h: 24 },   // lower-left bar
      { x: 500, y: 376, w: 320, h: 24 },   // lower-right bar
      { x: 100, y: 224, w: 24,  h: 152 },  // left inner wall
      { x: 776, y: 224, w: 24,  h: 152 },  // right inner wall
      { x: 380, y: 224, w: 24,  h: 60 },   // left doorway pillar
      { x: 496, y: 316, w: 24,  h: 60 },   // right doorway pillar
    ],
  },
  {
    // Long halls that span the full width, leaving top/bottom lanes.
    name: "Long Halls",
    spawn: { x: 200, y: 90 },
    walls: [
      { x: 60,  y: 260, w: 720, h: 24 },   // upper hall wall
      { x: 120, y: 316, w: 720, h: 24 },   // lower hall wall
      { x: 300, y: 284, w: 24,  h: 32 },   // upper doorway
      { x: 560, y: 284, w: 24,  h: 32 },   // upper doorway
      { x: 180, y: 340, w: 24,  h: 32 },   // lower doorway
      { x: 680, y: 340, w: 24,  h: 32 },   // lower doorway
      { x: 60,  y: 90,  w: 24,  h: 130 },  // top-left edge wall
      { x: 816, y: 380, w: 24,  h: 130 },  // bottom-right edge wall
    ],
  },
  {
    // Chambers spread across the arena. No central block.
    name: "Diamond Split",
    spawn: { x: 450, y: 90 },
    walls: [
      { x: 100, y: 200, w: 180, h: 100 },  // left chamber
      { x: 620, y: 200, w: 180, h: 100 },  // right chamber
      { x: 100, y: 400, w: 180, h: 100 },  // bottom-left chamber
      { x: 620, y: 400, w: 180, h: 100 },  // bottom-right chamber
      { x: 340, y: 280, w: 80,  h: 24 },   // upper center bar
      { x: 480, y: 296, w: 80,  h: 24 },   // lower center bar
      { x: 400, y: 380, w: 24,  h: 120 },  // central spine
    ],
  },
  {
    // A big ring with wide openings on every side.
    name: "The Ring",
    spawn: { x: 450, y: 90 },
    walls: [
      { x: 200, y: 180, w: 160, h: 24 },   // top-left
      { x: 540, y: 180, w: 160, h: 24 },   // top-right
      { x: 200, y: 396, w: 160, h: 24 },   // bottom-left
      { x: 540, y: 396, w: 160, h: 24 },   // bottom-right
      { x: 176, y: 204, w: 24,  h: 80 },   // upper-left side
      { x: 176, y: 316, w: 24,  h: 80 },   // lower-left side
      { x: 700, y: 204, w: 24,  h: 80 },   // upper-right side
      { x: 700, y: 316, w: 24,  h: 80 },   // lower-right side
      // center pillar to break the ring interior
      { x: 420, y: 270, w: 60,  h: 60 },
    ],
  },
  {
    // NEW: Hallway maze — grid-like paths across the whole arena.
    name: "Lattice",
    spawn: { x: 90, y: 90 },
    walls: [
      { x: 180, y: 100, w: 24,  h: 240 },  // vertical 1
      { x: 350, y: 60,  w: 24,  h: 240 },  // vertical 2
      { x: 500, y: 100, w: 24,  h: 240 },  // vertical 3
      { x: 660, y: 60,  w: 24,  h: 240 },  // vertical 4
      { x: 100, y: 180, w: 180, h: 24 },   // horizontal 1
      { x: 260, y: 320, w: 180, h: 24 },   // horizontal 2
      { x: 440, y: 180, w: 180, h: 24 },   // horizontal 3
      { x: 600, y: 320, w: 200, h: 24 },   // horizontal 4
      { x: 100, y: 420, w: 700, h: 24 },   // bottom full bar
    ],
  },
];