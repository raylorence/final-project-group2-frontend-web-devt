export const CANVAS_W = 900;   
export const CANVAS_H = 600;   
export const WORLD_W = 1600;   
export const WORLD_H = 1000;   

export const HUD_HEIGHT = 40;

export const PLAYER = {
  size: 22,
  speed: 140,
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
    color: "#ffd60a",
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
    worm: {
      size: 22,
      speed: 75,
      hp: 2,
      damage: 8,
      color: "#168BFF",
      points: 15,
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
    name: "The Core",
    spawn: { x: 800, y: 520 },
    walls: [
      // Outer perimeter borders (leaving 200px gates at midpoints)
      { x: 0,    y: 40,  w: 700, h: 40 },
      { x: 900,  y: 40,  w: 700, h: 40 },
      { x: 0,    y: 960, w: 700, h: 40 },
      { x: 900,  y: 960, w: 700, h: 40 },
      { x: 0,    y: 40,  w: 40,  h: 420 },
      { x: 0,    y: 580, w: 40,  h: 420 },
      { x: 1560, y: 40,  w: 40,  h: 420 },
      { x: 1560, y: 580, w: 40,  h: 420 },

      // Central Pillar Complex (split cross with 200px middle courtyard)
      { x: 620, y: 360, w: 120, h: 120 }, // Top-Left Center
      { x: 860, y: 360, w: 120, h: 120 }, // Top-Right Center
      { x: 620, y: 560, w: 120, h: 120 }, // Bottom-Left Center
      { x: 860, y: 560, w: 120, h: 120 }, // Bottom-Right Center

      // Outer Flanking Diamonds / Bunkers (isolated blocks)
      { x: 260,  y: 240, w: 140, h: 140 },
      { x: 1200, y: 240, w: 140, h: 140 },
      { x: 260,  y: 660, w: 140, h: 140 },
      { x: 1200, y: 660, w: 140, h: 140 },
    ],
  },
  {
    name: "Artery Lanes",
    spawn: { x: 800, y: 500 },
    walls: [
      // Outer Borders
      { x: 0,    y: 40,  w: 1600, h: 40 },
      { x: 0,    y: 960, w: 1600, h: 40 },
      { x: 0,    y: 40,  w: 40,   h: 960 },
      { x: 1560, y: 40,  w: 40,   h: 960 },

      // Left Vertical Channel (Divided with wide passages top/bottom/mid)
      { x: 450, y: 160, w: 60, h: 220 },
      { x: 450, y: 460, w: 60, h: 160 },
      { x: 450, y: 700, w: 60, h: 200 },

      // Right Vertical Channel
      { x: 1090, y: 160, w: 60, h: 220 },
      { x: 1090, y: 460, w: 60, h: 160 },
      { x: 1090, y: 700, w: 60, h: 200 },

      // Center Stage Islands (Provides cover for diagonal kiting)
      { x: 740, y: 240, w: 120, h: 80 },
      { x: 740, y: 720, w: 120, h: 80 },
    ],
  },
  {
    name: "Cellular Quads",
    spawn: { x: 800, y: 500 },
    walls: [
      // Outer Border
      { x: 0,    y: 40,  w: 1600, h: 40 },
      { x: 0,    y: 960, w: 1600, h: 40 },
      { x: 0,    y: 40,  w: 40,   h: 960 },
      { x: 1560, y: 40,  w: 40,   h: 960 },

      // Quadrant 1 (Top-Left Buffer)
      { x: 280, y: 220, w: 220, h: 50 },
      { x: 280, y: 270, w: 50,  h: 160 },

      // Quadrant 2 (Top-Right Buffer)
      { x: 1100, y: 220, w: 220, h: 50 },
      { x: 1270, y: 270, w: 50,  h: 160 },

      // Quadrant 3 (Bottom-Left Buffer)
      { x: 280, y: 750, w: 220, h: 50 },
      { x: 280, y: 590, w: 50,  h: 160 },

      // Quadrant 4 (Bottom-Right Buffer)
      { x: 1100, y: 750, w: 220, h: 50 },
      { x: 1270, y: 590, w: 50,  h: 160 },

      // Midfield Deflector Nodes
      { x: 760, y: 300, w: 80, h: 80 },
      { x: 760, y: 640, w: 80, h: 80 },
    ],
  },
  {
    name: "Bunker",
    spawn: { x: 420, y: 520 },
    walls: [
      // ===== OUTER PERIMETER BORDER =====
      { x: 0,    y: 40,  w: 1600, h: 50 },  // top
      { x: 0,    y: 950, w: 1600, h: 50 },  // bottom
      { x: 0,    y: 40,  w: 50,   h: 960 }, // left
      { x: 1550, y: 40,  w: 50,   h: 960 }, // right

      // ===== LEFT SECURITY DIVIDER (Split with a 200px central breach) =====
      { x: 200,  y: 160, w: 50,   h: 240 }, // top segment
      { x: 200,  y: 640, w: 50,   h: 240 }, // bottom segment

      // ===== CENTRAL VAULT PILLARS (Chamber split into 2 standalone blocks) =====
      // Gaps between and around pillars allow fluid 8-directional flanking
      { x: 580,  y: 380, w: 140,  h: 280 }, // west vault column
      { x: 800,  y: 380, w: 140,  h: 280 }, // east vault column

      // ===== EAST DIVISION WING (Segmented with a 200px transit portal) =====
      // Replaces the continuous 650px dead-end with two navigable blast doors
      { x: 1040, y: 500, w: 220,  h: 50 },  // inner gate wall
      { x: 1360, y: 500, w: 190,  h: 50 },  // outer perimeter latch (gap at 1260-1360)

      // ===== PERIPHERAL COVER NODES =====
      // Provides obstacle variety for bullet/enemy clearance in open zones
      { x: 1100, y: 220, w: 100,  h: 80 },  // northeast bunker bunker
      { x: 1100, y: 720, w: 100,  h: 80 },  // southeast bunker bunker
    ],
  }
];