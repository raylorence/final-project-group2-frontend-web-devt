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
      speed: 90,
      hp: 2,
      damage: 12,
      color: "#168BFF",
      points: 8,
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
  // ==========================================
  // MAP 1: BIG BOXY (Pillar Grid Arena)
  // Clean perimeter, internal pillars, wide avenues
  // ==========================================
  {
    name: "Big Boxy",
    spawn: { x: 800, y: 500 },
    walls: [
      // North Pillar Row (100x100 blocks, wide passages)
      { x: 200,  y: 180, w: 100, h: 100 },
      { x: 500,  y: 180, w: 100, h: 100 },
      { x: 1000, y: 180, w: 100, h: 100 },
      { x: 1300, y: 180, w: 100, h: 100 },

      // South Pillar Row
      { x: 200,  y: 720, w: 100, h: 100 },
      { x: 500,  y: 720, w: 100, h: 100 },
      { x: 1000, y: 720, w: 100, h: 100 },
      { x: 1300, y: 720, w: 100, h: 100 },

      // Center Flank Columns
      { x: 200,  y: 450, w: 100, h: 100 },
      { x: 1300, y: 450, w: 100, h: 100 },
    ],
  },

  // ==========================================
  // MAP 2: RINGS (Concentric Chokepoints)
  // Segmented internal ring with 200px cardinal breaches
  // ==========================================
  {
    name: "Rings",
    spawn: { x: 800, y: 500 },
    walls: [
      // Middle Ring Segments (Gaps at N, S, E, W for uninterrupted kiting)
      { x: 260,  y: 200, w: 440, h: 40 },  // Top-left bar
      { x: 900,  y: 200, w: 440, h: 40 },  // Top-right bar
      { x: 260,  y: 760, w: 440, h: 40 },  // Bottom-left bar
      { x: 900,  y: 760, w: 440, h: 40 },  // Bottom-right bar

      { x: 260,  y: 240, w: 40,  h: 220 }, // Left-top wing
      { x: 260,  y: 540, w: 40,  h: 220 }, // Left-bottom wing
      { x: 1300, y: 240, w: 40,  h: 220 }, // Right-top wing
      { x: 1300, y: 540, w: 40,  h: 220 }, // Right-bottom wing

      // Center Courtyard Buffers (Corners protecting center spawn)
      { x: 560,  y: 360, w: 60,  h: 60 },
      { x: 980,  y: 360, w: 60,  h: 60 },
      { x: 560,  y: 580, w: 60,  h: 60 },
      { x: 980,  y: 580, w: 60,  h: 60 },
    ],
  },

  // ==========================================
  // MAP 3: BOXYARD (Staggered Column Orchard)
  // Symmetric 3-row grid with open diagonal and cardinal lanes
  // ==========================================
  {
    name: "Boxyard",
    spawn: { x: 800, y: 500 },
    walls: [
      // Row 1 (North row: 120x100 blocks, 180px gaps)
      { x: 160,  y: 180, w: 120, h: 100 },
      { x: 460,  y: 180, w: 120, h: 100 },
      { x: 740,  y: 180, w: 120, h: 100 },
      { x: 1020, y: 180, w: 120, h: 100 },
      { x: 1320, y: 180, w: 120, h: 100 },

      // Row 2 (Middle row: staggered flanking blocks, center kept clear)
      { x: 310,  y: 450, w: 120, h: 100 },
      { x: 1170, y: 450, w: 120, h: 100 },

      // Row 3 (South row: matches North row)
      { x: 160,  y: 720, w: 120, h: 100 },
      { x: 460,  y: 720, w: 120, h: 100 },
      { x: 740,  y: 720, w: 120, h: 100 },
      { x: 1020, y: 720, w: 120, h: 100 },
      { x: 1320, y: 720, w: 120, h: 100 },
    ],
  },

  // ==========================================
  // MAP 4: THE CORE (Split Vault Fortress)
  // Central pincer hub with 4 peripheral bunkers
  // ==========================================
  {
    name: "The Core",
    spawn: { x: 800, y: 500 },
    walls: [
      // Central Hub Pillars (Split with 160px central lanes in all 4 directions)
      { x: 620,  y: 360, w: 120, h: 110 },
      { x: 860,  y: 360, w: 120, h: 110 },
      { x: 620,  y: 530, w: 120, h: 110 },
      { x: 860,  y: 530, w: 120, h: 110 },

      // Corner Quad Bunkers
      { x: 260,  y: 220, w: 130, h: 130 },
      { x: 1210, y: 220, w: 130, h: 130 },
      { x: 260,  y: 650, w: 130, h: 130 },
      { x: 1210, y: 650, w: 130, h: 130 },
    ],
  },

  // ==========================================
  // MAP 5: ARTERY LANES (Trident Highways)
  // Three vertical columns with generous cross-avenues
  // ==========================================
  {
    name: "Artery Lanes",
    spawn: { x: 800, y: 500 },
    walls: [
      // West Artery Wall (Split into 2 segments with a 220px cross-highway)
      { x: 440,  y: 160, w: 50,  h: 260 },
      { x: 440,  y: 580, w: 50,  h: 260 },

      // East Artery Wall (Matches West)
      { x: 1110, y: 160, w: 50,  h: 260 },
      { x: 1110, y: 580, w: 50,  h: 260 },

      // Center Island Buffers (Prevents bullets from spanning full 1600px across center)
      { x: 740,  y: 220, w: 120, h: 70 },
      { x: 740,  y: 710, w: 120, h: 70 },

      // Peripheral Pods
      { x: 180,  y: 450, w: 70,  h: 100 },
      { x: 1350, y: 450, w: 70,  h: 100 },
    ],
  },

  // ==========================================
  // MAP 6: BUNKER (Remastered Open Vault)
  // Balanced asymmetrical layout with no cul-de-sacs or sealed wings
  // ==========================================
  {
    name: "Bunker",
    spawn: { x: 800, y: 500 },
    walls: [
      // West Security Barrier (Separated with wide 200px gap)
      { x: 220,  y: 170, w: 50,  h: 240 },
      { x: 220,  y: 590, w: 50,  h: 240 },

      // Center Vault Pillars (2 navigable towers)
      { x: 570,  y: 360, w: 130, h: 280 },
      { x: 900,  y: 360, w: 130, h: 280 },

      // East Transit Blast Doors (Split with a 200px middle gate)
      { x: 1120, y: 500, w: 180, h: 50 },
      { x: 1380, y: 500, w: 180, h: 50 },

      // Peripheral Pods
      { x: 1180, y: 230, w: 90,  h: 80 },
      { x: 1180, y: 690, w: 90,  h: 80 },
    ],
  }, 

  // ==========================================
  // MAP 7: Pinwheel 
  // Four pinwheel arms around a central plaza, with corner pillars. Good for kiting.
  // ==========================================
  {
    name: "Pinwheel",
    spawn: { x: 800, y: 420 },
    walls: [
      // ===== PINWHEEL ARMS (180-degree symmetric, none touch) =====
      { x: 500,  y: 260, w: 500,  h: 50 },  // top arm
      { x: 1150, y: 250, w: 50,   h: 400 }, // right arm
      { x: 600,  y: 730, w: 500,  h: 50 },  // bottom arm
      { x: 400,  y: 390, w: 50,   h: 400 }, // left arm
 
      // ===== CORNER PILLARS =====
      { x: 200,  y: 200, w: 100,  h: 100 },
      { x: 1300, y: 200, w: 100,  h: 100 },
      { x: 200,  y: 740, w: 100,  h: 100 },
      { x: 1300, y: 740, w: 100,  h: 100 },
 
      // ===== CENTER PILLAR =====
      { x: 760,  y: 480, w: 80,   h: 80 },
    ],
  }, 

  // ==========================================
  // MAP 8: Debris Field
  // Open arena with irregular scattered blocks. No dead ends, so enemies keep moving.
  // ==========================================
  {
    name: "Debris Field",
    spawn: { x: 800, y: 520 },
    walls: [
      // ===== SCATTERED BLOCKS (irregular, 150px+ apart) =====
      { x: 1080, y: 620, w: 100, h: 90 },
      { x: 570, y: 250, w: 120, h: 80 },
      { x: 270, y: 450, w: 90, h: 130 },
      { x: 330, y: 750, w: 80, h: 60 },
      { x: 1200, y: 260, w: 200, h: 90 },
      { x: 960, y: 350, w: 90, h: 60 },
      { x: 770, y: 740, w: 120, h: 70 },
      { x: 1330, y: 540, w: 60, h: 130 },
      { x: 520, y: 530, w: 80, h: 60 },
    ],
  }
];