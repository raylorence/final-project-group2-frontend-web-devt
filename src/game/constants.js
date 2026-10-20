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
    name: "The Cross",
    spawn: { x: 400, y: 300 }, 
    walls: [
      { x: 740, y: 300, w: 120, h: 400 },  
      { x: 250, y: 600, w: 400, h: 100 },  
      { x: 950, y: 600, w: 400, h: 100 },  
    ],
  },
  {
    name: "Four Pillars",
    // Fixed: Spawn moved up to y: 100 to be clearly above the top nub (which starts at y: 150)
    spawn: { x: 800, y: 100 }, 
    walls: [
      { x: 250, y: 300, w: 150, h: 150 },  
      { x: 1200, y: 300, w: 150, h: 150 }, 
      { x: 250, y: 650, w: 150, h: 150 },  
      { x: 1200, y: 650, w: 150, h: 150 }, 
      { x: 780, y: 150, w: 40, h: 150 },   
      { x: 780, y: 700, w: 40, h: 150 },   
    ],
  },
  {
    name: "The Bunker",
    spawn: { x: 800, y: 150 }, 
    walls: [
      { x: 400, y: 350, w: 350, h: 40 },   
      { x: 850, y: 350, w: 350, h: 40 },   
      { x: 400, y: 650, w: 800, h: 40 },   
      { x: 400, y: 350, w: 40, h: 300 },   
      { x: 1160, y: 350, w: 40, h: 300 },  
      { x: 780, y: 450, w: 40, h: 200 },   
    ],
  },
  {
    name: "Long Halls",
    spawn: { x: 300, y: 200 }, 
    walls: [
      { x: 150, y: 400, w: 1300, h: 40 },  
      { x: 150, y: 600, w: 1300, h: 40 },  
      { x: 600, y: 440, w: 40, h: 60 },    
      { x: 1000, y: 540, w: 40, h: 60 },   
    ],
  },
  {
    name: "Diamond Split",
    // Fixed: Spawn moved down to y: 150 to clear the top obstacles (which start at y: 250)
    spawn: { x: 800, y: 150 }, 
    walls: [
      { x: 200, y: 350, w: 400, h: 300 },  
      { x: 1000, y: 350, w: 400, h: 300 }, 
      { x: 700, y: 450, w: 200, h: 100 },  
      { x: 450, y: 250, w: 60, h: 60 },    
      { x: 1090, y: 250, w: 60, h: 60 },   
    ],
  },
];