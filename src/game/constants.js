export const CANVAS_W = 900;   
export const CANVAS_H = 600;   
export const WORLD_W = 1600;   
export const WORLD_H = 1000;   

export const HUD_HEIGHT = 40;

export const PLAYER = {
  size: 22,
  speed: 70,
  maxHealth: 100,
  fireCooldown: 200,
  invulnMs: 700,
};

export const BULLET = {
  size: 10,            // Was 16 (too wide), now 10 (slightly big, easy to hit)
  speed: 600,          
  damage: 1,
  lifetime: 1500,
};

export const ENEMY_TYPES = {
  fast: {
    size: 16,
    speed: 55,         
    hp: 1,
    damage: 10,
    color: "#f85149",
    points: 1,
    spawnWeight: 6,
  },
  tank: {
    size: 28,
    speed: 30,         
    hp: 4,
    damage: 20,
    color: "#a371f7",
    points: 3,
    spawnWeight: 3,
  },
  splitter: {
    size: 22,
    speed: 40,         
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
    name: "Big Boxy",
    spawn: { x: 800, y: 500 }, 
    walls: [
      {x: 0, y: 950, w: 700, h: 50}, //main wall bottom left
      {x: 900, y: 950, w: 700, h: 50}, //main wall bottom right
      {x: 0, y: 40, w: 700, h: 50}, //main wall top left
      {x: 900, y: 40, w: 700, h: 50}, //main wall top right

      {x: 0, y: 900, w: 100, h: 100}, //box wall bottom left (border)
      {x: 200, y: 900, w: 100, h: 100},
      {x: 400, y: 900, w: 100, h: 100},
      {x: 600, y: 900, w: 100, h: 100}, //box wall bottom gate (left)
      {x: 900, y: 900, w: 100, h: 100}, //box wall bottom gate (right)
      {x: 1100, y: 900, w: 100, h: 100},
      {x: 1300, y: 900, w: 100, h: 100},
      {x: 1500, y: 900, w: 100, h: 100},   //box wall bottom right (border)

      {x: 0, y: 40, w: 100, h: 100}, //box wall top left (border)
      {x: 200, y: 40, w: 100, h: 100},
      {x: 400, y: 40, w: 100, h: 100},
      {x: 600, y: 40, w: 100, h: 100}, //box wall top gate (left)
      {x: 900, y: 40, w: 100, h: 100}, //box wall top gate (right)
      {x: 1100, y: 40, w: 100, h: 100},
      {x: 1300, y: 40, w: 100, h: 100},
      {x: 1500, y: 40, w: 100, h: 100}, //box wall top right (border)
    ],
  },
  {
    name: "Rings",
    spawn: { x: 800, y: 500 },
    walls: [
      // ===== OUTER RING (ring 1) =====
      // Top side (left & right segments, gap in middle for N opening)
      { x: 0,    y: 40,   w: 700, h: 50 },   // top-left
      { x: 900,  y: 40,   w: 700, h: 50 },   // top-right
      // Bottom side
      { x: 0,    y: 950, w: 700, h: 50 },   // bottom-left
      { x: 900,  y: 950, w: 700, h: 50 },   // bottom-right
      // Left side (top & bottom segments, gap in middle for W opening)
      { x: 0,    y: 0,   w: 50,  h: 450 },  // left-top
      { x: 0,    y: 550, w: 50,  h: 450 },  // left-bottom
      // Right side
      { x: 1550, y: 0,   w: 50,  h: 450 },  // right-top
      { x: 1550, y: 550, w: 50,  h: 450 },  // right-bottom
      // Corner pillars
      { x: 0,    y: 0,   w: 100, h: 100 },  // top-left pillar
      { x: 1500, y: 0,   w: 100, h: 100 },  // top-right pillar
      { x: 0,    y: 900, w: 100, h: 100 },  // bottom-left pillar
      { x: 1500, y: 900, w: 100, h: 100 },  // bottom-right pillar

      // ===== MIDDLE RING (ring 2) =====
      // Top side
      { x: 200,  y: 200, w: 500, h: 50 },   // top-left
      { x: 900,  y: 200, w: 500, h: 50 },   // top-right
      // Bottom side
      { x: 200,  y: 750, w: 500, h: 50 },   // bottom-left
      { x: 900,  y: 750, w: 500, h: 50 },   // bottom-right
      // Left side
      { x: 200,  y: 250, w: 50,  h: 200 },  // left-top
      { x: 200,  y: 550, w: 50,  h: 200 },  // left-bottom
      // Right side
      { x: 1350, y: 250, w: 50,  h: 200 },  // right-top
      { x: 1350, y: 550, w: 50,  h: 200 },  // right-bottom
      // Corner pillars
      { x: 200,  y: 200, w: 100, h: 100 },  // top-left pillar
      { x: 1300, y: 200, w: 100, h: 100 },  // top-right pillar
      { x: 200,  y: 700, w: 100, h: 100 },  // bottom-left pillar
      { x: 1300, y: 700, w: 100, h: 100 },  // bottom-right pillar

      // ===== INNER RING (ring 3) =====
      // Top side
      { x: 400,  y: 350, w: 300, h: 50 },   // top-left
      { x: 900,  y: 350, w: 300, h: 50 },   // top-right
      // Bottom side
      { x: 400,  y: 600, w: 300, h: 50 },   // bottom-left
      { x: 900,  y: 600, w: 300, h: 50 },   // bottom-right
      // Left side
      { x: 400,  y: 350, w: 50,  h: 100 },  // left-top
      { x: 400,  y: 550, w: 50,  h: 100 },  // left-bottom (shares with bottom corner)
      // Right side
      { x: 1150, y: 350, w: 50,  h: 100 },  // right-top
      { x: 1150, y: 550, w: 50,  h: 100 },  // right-bottom
      // Corner pillars
      { x: 400,  y: 400, w: 50, h: 50 },  // top-left pillar
      { x: 1150, y: 400, w: 50, h: 50 },  // top-right pillar
      { x: 400,  y: 600, w: 50, h: 50 },  // bottom-left pillar
      { x: 1150, y: 600, w: 50, h: 50 },  // bottom-right pillar
        ]
  },
  {
    name: "Boxyard",
    spawn: { x: 800, y: 215 },
    walls: [
      // ===== ROW 1 (odd: aligned at x = -60, 190, 440, 690, 940, 1190, 1440) =====
      { x: -60,  y: 40,  w: 150, h: 150 },
      { x: 190,  y: 40,  w: 150, h: 150 },
      { x: 440,  y: 40,  w: 150, h: 150 },
      { x: 690,  y: 40,  w: 150, h: 150 },
      { x: 940,  y: 40,  w: 150, h: 150 },
      { x: 1190, y: 40,  w: 150, h: 150 },
      { x: 1440, y: 40,  w: 150, h: 150 },

      // ===== ROW 2 (even: offset at x = 65, 315, 565, 815, 1065, 1315, 1565) =====
      { x: 65,   y: 290, w: 150, h: 150 },
      { x: 315,  y: 290, w: 150, h: 150 },
      { x: 565,  y: 290, w: 150, h: 150 },
      { x: 815,  y: 290, w: 150, h: 150 },
      { x: 1065, y: 290, w: 150, h: 150 },
      { x: 1315, y: 290, w: 150, h: 150 },
      { x: 1565, y: 290, w: 150, h: 150 },

      // ===== ROW 3 (odd: aligned) =====
      { x: -60,  y: 540, w: 150, h: 150 },
      { x: 190,  y: 540, w: 150, h: 150 },
      { x: 440,  y: 540, w: 150, h: 150 },
      { x: 690,  y: 540, w: 150, h: 150 },
      { x: 940,  y: 540, w: 150, h: 150 },
      { x: 1190, y: 540, w: 150, h: 150 },
      { x: 1440, y: 540, w: 150, h: 150 },

      // ===== ROW 4 (even: offset) =====
      { x: 65,   y: 790, w: 150, h: 150 },
      { x: 315,  y: 790, w: 150, h: 150 },
      { x: 565,  y: 790, w: 150, h: 150 },
      { x: 815,  y: 790, w: 150, h: 150 },
      { x: 1065, y: 790, w: 150, h: 150 },
      { x: 1315, y: 790, w: 150, h: 150 },
      { x: 1565, y: 790, w: 150, h: 150 },
    ]
  },
  {
    name: "Labyrinth",
    spawn: { x: 800, y: 520 },
    walls: [
      // ===== OUTER RING (solid border) =====
      { x: 0,    y: 40,  w: 1600, h: 50 },  // top
      { x: 0,    y: 950, w: 1600, h: 50 },  // bottom
      { x: 0,    y: 40,  w: 50,   h: 960 }, // left
      { x: 1550, y: 40,  w: 50,   h: 960 }, // right

      // ===== MIDDLE RING (gaps: top-left & bottom-right) =====
      { x: 400,  y: 180, w: 1000, h: 50 },  // top (gap at x 200-400)
      { x: 200,  y: 330, w: 50,   h: 530 }, // left (gap at y 180-330)
      { x: 1350, y: 180, w: 50,   h: 530 }, // right (gap at y 710-860)
      { x: 200,  y: 810, w: 1000, h: 50 },  // bottom (gap at x 1200-1400)

      // ===== INNER RING (gaps: top-right & bottom-left) =====
      { x: 400,  y: 320, w: 600,  h: 50 },  // top (gap at x 1000-1200)
      { x: 1150, y: 420, w: 50,   h: 300 }, // right (gap at y 320-420)
      { x: 600,  y: 670, w: 600,  h: 50 },  // bottom (gap at x 400-600)
      { x: 400,  y: 320, w: 50,   h: 250 }, // left (gap at y 570-720)

      // ===== CENTER BOX (gap: top-left) =====
      { x: 800,  y: 460, w: 80,   h: 20 },  // top
      { x: 720,  y: 500, w: 20,   h: 80 },  // left
      { x: 860,  y: 460, w: 20,   h: 120 }, // right
      { x: 720,  y: 560, w: 160,  h: 20 },  // bottom
    ],
  }
];