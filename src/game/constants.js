export const CANVAS_W = 900;
export const CANVAS_H = 600;

export const PLAYER = {
  size: 34,
  speed: 260,          // px per second
  maxHealth: 100,
  fireCooldown: 220,   // ms between shots
  invulnMs: 700,       // i-frames after being hit
};

export const BULLET = {
  size: 8,
  speed: 620,          // px per second
  damage: 1,
  lifetime: 1500,      // ms
};

export const ENEMY_TYPES = {
  fast: {
    size: 22,
    speed: 120,
    hp: 1,
    damage: 10,
    color: "#f85149",
    points: 1,
    spawnWeight: 6,
  },
  tank: {
    size: 42,
    speed: 65,
    hp: 4,
    damage: 20,
    color: "#a371f7",
    points: 3,
    spawnWeight: 3,
  },
  splitter: {
    size: 32,
    speed: 85,
    hp: 2,
    damage: 15,
    color: "#3fb950",
    points: 2,
    spawnWeight: 2,
  },
};

export const DIFFICULTY = {
  initialSpawnMs: 1400,
  minSpawnMs: 320,
  spawnRampPerKill: 12, // ms shaved off per kill
};