import {
  initAudio, playShoot, playHit, playKill, playHurt, playGameOver,
  playHeartbeatLub, playHeartbeatDub,
} from "./sound.js";

import {
  CANVAS_W, CANVAS_H, WORLD_W, WORLD_H, HUD_HEIGHT,
  PLAYER, BULLET, ENEMY_TYPES, DIFFICULTY, DIRECTIONS, MAPS,
} from "./constants.js";

// --- PERFORMANCE: Pre-render sprites to offscreen canvases ---
const createSprite = (drawFn, size) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  drawFn(ctx, size);
  return canvas;
};

const ENEMY_SPRITES = {};
const BULLET_SPRITE = createSprite((ctx, size) => {
  ctx.translate(size / 2, size / 2);
  ctx.shadowColor = "#4ec9b0";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#a5f3e0";
  ctx.beginPath();
  ctx.arc(0, 0, size / 2 - 10, 0, Math.PI * 2);
  ctx.fill();
}, 30);

Object.entries(ENEMY_TYPES).forEach(([type, t]) => {
  ENEMY_SPRITES[type] = createSprite((ctx, size) => {
    ctx.translate(size / 2, size / 2);
    if (type === "worm") {
      ctx.strokeStyle = "#56B8FF";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const startX = side * (size * 0.22);
        const startY = -size * 0.1 + i * size * 0.035;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for (let j = 1; j <= 8; j++) {
          const direction = side === -1 ? -1 : 1;
          const x = startX + direction * j * size * 0.045;
          const y = startY + Math.sin(j * 1.3 + i) * size * 0.045;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.roundRect(-size * 0.32, -size * 0.17, size * 0.64, size * 0.34, size * 0.17);
      ctx.fillStyle = "#168BFF";
      ctx.fill();
      ctx.strokeStyle = "#8AD5FF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-size * 0.2 + i * size * 0.1, Math.sin(i * 1.5) * size * 0.06, size * 0.025, 0, Math.PI * 2);
        ctx.fillStyle = "#0754A6";
        ctx.fill();
      }
      return;
    }

    const spikes = 10;
    const outer = size / 2 - 2;
    const inner = outer * 0.65;
    ctx.fillStyle = t.color;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, t.size + 4);
});

export function createEngine(onGameOver) {
  let state = null;

  // A* Pathfinding Grid Variables
  const GRID_SIZE = 40;
  const COLS = Math.ceil(WORLD_W / GRID_SIZE);
  const ROWS = Math.ceil(WORLD_H / GRID_SIZE);
  let grid = [];

  function pickMap() {
    return MAPS[Math.floor(Math.random() * MAPS.length)];
  }

  function reset() {
    initAudio();
    const map = pickMap();

    const bgMotes = [];
    for (let i = 0; i < 35; i++) {
      bgMotes.push({
        x: Math.random() * WORLD_W,
        y: Math.random() * (WORLD_H - HUD_HEIGHT) + HUD_HEIGHT,
        radius: 6 + Math.random() * 14,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 12,
        alpha: 0.08 + Math.random() * 0.14,
        color: Math.random() > 0.3 ? "#b82b3a" : "#7d1624",
      });
    }

    state = {
      mapName: map.name,
      player: {
        x: map.spawn.x,
        y: Math.max(map.spawn.y, HUD_HEIGHT + 30),
        size: PLAYER.size,
        health: PLAYER.maxHealth,
        invulnUntil: 0,
        lastShotAt: -PLAYER.fireCooldown,
        facingX: 0,
        facingY: -1,
        aimAngle: -Math.PI / 2,
        muzzleFlash: 0,
      },
      walls: map.walls.map((w) => ({ ...w })),
      bullets: [],
      enemies: [],
      particles: [],
      bgMotes,
      trailTimer: 0,
      score: 0,
      elapsed: 0,
      spawnAccum: 0,
      spawnInterval: DIFFICULTY.initialSpawnMs,
      alive: true,
      screenShake: 0,
      gameOverFired: false,
      lastHeartbeat: 0,
      nextHeartbeatDub: 0,
      heartbeatPhase: 0,
      camera: { x: 0, y: 0 },
    };

    // --- BUILD A* GRID ---
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const cx = c * GRID_SIZE + GRID_SIZE / 2;
        const cy = r * GRID_SIZE + GRID_SIZE / 2;
        
        let blocked = cy < HUD_HEIGHT;
        if (!blocked) {
          for (const w of state.walls) {
            // Inflate by 12px so paths hug walls tightly but don't clip
            if (cx > w.x - 12 && cx < w.x + w.w + 12 && cy > w.y - 12 && cy < w.y + w.h + 12) {
              blocked = true;
              break;
            }
          }
        }
        row.push(blocked ? 1 : 0);
      }
      grid.push(row);
    }

    updateCamera();
  }

  reset();

  // ---------- A* Pathfinding ----------
    function findPath(startX, startY, targetX, targetY) {
    // Clamp target coordinates so it can't be outside the grid
    let targetC = Math.floor(Math.max(0, Math.min(WORLD_W - 1, targetX)) / GRID_SIZE);
    let targetR = Math.floor(Math.max(0, Math.min(WORLD_H - 1, targetY)) / GRID_SIZE);

    // If target is blocked, find closest open tile
    if (grid[targetR] && grid[targetR][targetC] === 1) {
      let bestDist = Infinity;
      let bestC = targetC;
      let bestR = targetR;
      
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nc = targetC + dc;
          const nr = targetR + dr;
          // Ensure we don't check out-of-bounds tiles
          if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && grid[nr][nc] === 0) {
            const dist = Math.abs(nc - targetC) + Math.abs(nr - targetR);
            if (dist < bestDist) {
              bestDist = dist;
              bestC = nc;
              bestR = nr;
            }
          }
        }
      }
      targetC = bestC;
      targetR = bestR;
    }

    // Clamp start coordinates so it can't be outside the grid
    const startC = Math.floor(Math.max(0, Math.min(WORLD_W - 1, startX)) / GRID_SIZE);
    const startR = Math.floor(Math.max(0, Math.min(WORLD_H - 1, startY)) / GRID_SIZE);

    const open = [{ c: startC, r: startR, g: 0, f: 0, parent: null }];
    const closed = new Set();

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift();

      if (current.c === targetC && current.r === targetR) {
        const path = [];
        let curr = current;
        while (curr) {
          path.unshift({ x: curr.c * GRID_SIZE + GRID_SIZE / 2, y: curr.r * GRID_SIZE + GRID_SIZE / 2 });
          curr = curr.parent;
        }
        return path;
      }

      closed.add(`${current.c},${current.r}`);

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          const nc = current.c + dc;
          const nr = current.r + dr;

          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
          if (grid[nr][nc] === 1) continue;
          
          if (dr !== 0 && dc !== 0) {
            if (grid[current.r][nc] === 1 || grid[nr][current.c] === 1) continue;
          }

          if (closed.has(`${nc},${nr}`)) continue;

          const g = current.g + (dr !== 0 && dc !== 0 ? 1.414 : 1);
          const h = Math.abs(nc - targetC) + Math.abs(nr - targetR);
          const f = g + h;

          const existing = open.find(n => n.c === nc && n.r === nr);
          if (!existing) {
            open.push({ c: nc, r: nr, g, f, parent: current });
          } else if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        }
      }
    }
    return null; 
  }

  // ---------- Camera ----------
  function updateCamera() {
    let targetX = state.player.x - CANVAS_W / 2;
    let targetY = state.player.y - CANVAS_H / 2;
    targetX = Math.max(0, Math.min(targetX, WORLD_W - CANVAS_W));
    targetY = Math.max(0, Math.min(targetY, WORLD_H - CANVAS_H));
    state.camera.x += (targetX - state.camera.x) * 0.1;
    state.camera.y += (targetY - state.camera.y) * 0.1;
  }

  // ---------- Collision ----------
  function distSq(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }

  function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
    const nx = Math.max(rx, Math.min(cx, rx + rw));
    const ny = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }

  function circleHitsAnyWall(cx, cy, cr) {
    if (cy - cr < HUD_HEIGHT) return true;
    for (let i = 0; i < state.walls.length; i++) {
      const w = state.walls[i];
      if (circleRectOverlap(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
    }
    return false;
  }

  function tryMoveCircle(x, y, r, mx, my) {
    if (!circleHitsAnyWall(x + mx, y + my, r)) return { x: x + mx, y: y + my };
    if (!circleHitsAnyWall(x + mx, y, r)) return { x: x + mx, y: y };
    if (!circleHitsAnyWall(x, y + my, r)) return { x: x, y: y + my };

    const backX = x - mx * 0.5;
    const backY = y - my * 0.5;
    if (!circleHitsAnyWall(backX, backY, r)) return { x: backX, y: backY };

    return { x: x, y: y };
  }

  // ---------- Spawning ----------
  function pickEnemyType() {
    const r = Math.random() * 12;
    if (r < 5) return "fast";
    if (r < 8) return "tank";
    if (r < 10) return "splitter";
    return "worm";
  }

  function spawnEnemy(typeName, x, y, sizeOverride, hpOverride) {
    const t = ENEMY_TYPES[typeName] || {
      size: 20, speed: 45, hp: 2, damage: 15, color: "#168BFF", points: 2,
    };

    let sx = x, sy = y;
    const size = sizeOverride ?? t.size;

    if (x === undefined) {
      const buffer = 80;
      const viewLeft = state.camera.x;
      const viewRight = state.camera.x + CANVAS_W;
      const viewTop = state.camera.y;
      const viewBottom = state.camera.y + CANVAS_H;

      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 20) {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { sx = Math.random() * (viewRight - viewLeft) + viewLeft; sy = viewTop - buffer; }
        else if (edge === 1) { sx = viewRight + buffer; sy = Math.random() * (viewBottom - viewTop) + viewTop; }
        else if (edge === 2) { sx = Math.random() * (viewRight - viewLeft) + viewLeft; sy = viewBottom + buffer; }
        else { sx = viewLeft - buffer; sy = Math.random() * (viewBottom - viewTop) + viewTop; }

        sy = Math.max(HUD_HEIGHT + size / 2 + 10, sy);
        const inViewX = sx > viewLeft - size && sx < viewRight + size;
        const inViewY = sy > viewTop - size && sy < viewBottom + size;

        if (!(inViewX && inViewY) && !circleHitsAnyWall(sx, sy, size / 2)) valid = true;
        attempts++;
      }

      if (!valid) {
        sx = viewRight + buffer;
        sy = Math.max(HUD_HEIGHT + size / 2 + 10, viewBottom + buffer);
      }
    }

    if (x !== undefined && circleHitsAnyWall(sx, sy, size / 2)) {
      const pushAngle = Math.atan2(WORLD_H / 2 - sy, WORLD_W / 2 - sx);
      let attempts = 0;
      while (circleHitsAnyWall(sx, sy, size / 2) && attempts < 30) {
        sx += Math.cos(pushAngle) * 8;
        sy += Math.sin(pushAngle) * 8;
        sx = Math.max(size, Math.min(WORLD_W - size, sx));
        sy = Math.max(HUD_HEIGHT + size + 10, Math.min(WORLD_H - size, sy));
        attempts++;
      }
    }

    state.enemies.push({
      x: sx, y: sy, size,
      speed: t.speed,
      hp: hpOverride ?? t.hp,
      maxHp: hpOverride ?? t.hp,
      damage: t.damage,
      color: t.color,
      points: t.points,
      type: typeName,
      wobble: Math.random() * Math.PI * 2,
      aiCooldown: 0,
      currentDir: null,
      hitFlash: 0,
      path: null,
      pathTimer: 0,
    });
  }

  function explode(x, y, color, count = 8) {
    if (state.particles.length > 200) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 180;
      state.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 380, maxLife: 380, color, size: 2 + Math.random() * 3,
      });
    }
  }

  // ---------- Input ----------
  function resolveDirection(up, down, left, right) {
    if (up && left) return DIRECTIONS.NW;
    if (up && right) return DIRECTIONS.NE;
    if (down && left) return DIRECTIONS.SW;
    if (down && right) return DIRECTIONS.SE;
    if (up) return DIRECTIONS.N;
    if (down) return DIRECTIONS.S;
    if (left) return DIRECTIONS.W;
    if (right) return DIRECTIONS.E;
    return null;
  }

  function handleInput(keys, delta) {
    if (!state.alive) return;
    const dt = delta / 1000;
    const p = state.player;

    const moveDir = resolveDirection(keys.has("w"), keys.has("s"), keys.has("a"), keys.has("d"));

    if (moveDir) {
      p.facingX = moveDir.dx;
      p.facingY = moveDir.dy;
      p.aimAngle = moveDir.angle;

      const len = Math.hypot(moveDir.dx, moveDir.dy);
      const step = PLAYER.speed * dt;

      const moved = tryMoveCircle(p.x, p.y, p.size / 2, (moveDir.dx / len) * step, (moveDir.dy / len) * step);
      p.x = Math.max(p.size / 2, Math.min(WORLD_W - p.size / 2, moved.x));
      p.y = Math.max(HUD_HEIGHT + p.size / 2, Math.min(WORLD_H - p.size / 2, moved.y));

      state.trailTimer = (state.trailTimer || 0) + delta;
      if (state.trailTimer >= 60) {
        state.trailTimer = 0;
        const rearDist = p.size / 2 + 3;
        state.particles.push({
          x: p.x - (moveDir.dx / len) * rearDist + (Math.random() - 0.5) * 4,
          y: p.y - (moveDir.dy / len) * rearDist + (Math.random() - 0.5) * 4,
          vx: -(moveDir.dx / len) * 20 + (Math.random() - 0.5) * 15,
          vy: -(moveDir.dy / len) * 20 + (Math.random() - 0.5) * 15,
          life: 200, maxLife: 200, color: "rgba(78, 201, 176, 0.7)", size: 2,
        });
      }
    }

    const wantsToShoot = keys.has(" ");
    if (wantsToShoot && state.elapsed - p.lastShotAt >= PLAYER.fireCooldown) {
      fire();
    }
  }

  function fire() {
    const p = state.player;
    p.lastShotAt = state.elapsed;
    p.muzzleFlash = 40;
    playShoot();

    const muzzle = p.size / 2 + BULLET.size / 2;
    const dirX = p.facingX;
    const dirY = p.facingY;
    const len = Math.hypot(dirX, dirY) || 1;

    const tipX = p.x + (dirX / len) * muzzle;
    const tipY = p.y + (dirY / len) * muzzle;

    state.bullets.push({
      x: tipX, y: tipY, vx: (dirX / len) * BULLET.speed, vy: (dirY / len) * BULLET.speed,
      size: BULLET.size, damage: BULLET.damage, age: 0,
    });

    for (let k = 0; k < 4; k++) {
      const spread = (Math.random() - 0.5) * 1.2;
      const spd = 40 + Math.random() * 80;
      state.particles.push({
        x: tipX, y: tipY,
        vx: (dirX / len) * spd + Math.cos(spread) * 25,
        vy: (dirY / len) * spd + Math.sin(spread) * 25,
        life: 100, maxLife: 100, color: k % 2 === 0 ? "#ffffff" : "#a5f3e0", size: 2.5,
      });
    }
  }

  // ---------- AI ----------
  const ENEMY_DIRS = [
    DIRECTIONS.N, DIRECTIONS.NE, DIRECTIONS.E, DIRECTIONS.SE,
    DIRECTIONS.S, DIRECTIONS.SW, DIRECTIONS.W, DIRECTIONS.NW,
  ];

  function pickEnemyDirection(e, p) {
    // 1. Has Line of Sight? Charge directly!
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.ceil(dist / 15); 
    let clearLOS = true;

    for (let i = 1; i < steps; i++) {
      if (circleHitsAnyWall(e.x + (dx / steps) * i, e.y + (dy / steps) * i, e.size / 2)) {
        clearLOS = false;
        break;
      }
    }

    let targetX = p.x;
    let targetY = p.y;

    // 2. If blocked, use A* Pathfinding
    if (!clearLOS) {
      if (!e.path || e.path.length === 0 || e.pathTimer <= 0) {
        e.path = findPath(e.x, e.y, p.x, p.y);
        e.pathTimer = 300; 
      }

      if (e.path && e.path.length > 1) {
        targetX = e.path[1].x;
        targetY = e.path[1].y;

        if (distSq(e.x, e.y, targetX, targetY) < 15 * 15) {
          e.path.shift();
          return pickEnemyDirection(e, p);
        }
      }
    }

    // 3. Turn towards the Target
    const rawAngle = Math.atan2(targetY - e.y, targetX - e.x);
    let bestDir = e.currentDir || ENEMY_DIRS[0];
    let bestScore = Infinity;

    const isTouchingWall = circleHitsAnyWall(
      e.x + (e.currentDir ? e.currentDir.dx * 2 : 0),
      e.y + (e.currentDir ? e.currentDir.dy * 2 : 0),
      e.size / 2 + 1
    );

    for (let i = 0; i < ENEMY_DIRS.length; i++) {
      const d = ENEMY_DIRS[i];
      let angleDiff = Math.abs(rawAngle - d.angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      let stickPenalty = 0;
      if (isTouchingWall) {
        const nextX = e.x + d.dx * (e.size / 2 + 4);
        const nextY = e.y + d.dy * (e.size / 2 + 4);
        if (circleHitsAnyWall(nextX, nextY, e.size / 2)) {
          stickPenalty = 5.0; 
        }
      }

      const score = angleDiff + stickPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestDir = d;
      }
    }
    return bestDir;
  }

  function computeSpawnInterval(elapsedMs) {
    const t = Math.min(1, elapsedMs / DIFFICULTY.rampDurationMs);
    return DIFFICULTY.initialSpawnMs + (DIFFICULTY.minSpawnMs - DIFFICULTY.initialSpawnMs) * t;
  }

  // ---------- Update ----------
  function update(delta) {
    if (!state.alive) return;

    const dt = delta / 1000;
    state.elapsed += delta;

    if (state.player.muzzleFlash > 0) {
      state.player.muzzleFlash = Math.max(0, state.player.muzzleFlash - delta);
    }

    for (let m = 0; m < state.bgMotes.length; m++) {
      const mote = state.bgMotes[m];
      mote.x += mote.vx * dt;
      mote.y += mote.vy * dt;
      if (mote.x < -30) mote.x = WORLD_W + 30;
      if (mote.x > WORLD_W + 30) mote.x = -30;
      if (mote.y < HUD_HEIGHT) mote.y = WORLD_H + 20;
      if (mote.y > WORLD_H + 20) mote.y = HUD_HEIGHT;
    }

    updateCamera();

    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.age += delta;

      const outOfBounds = b.age > BULLET.lifetime || b.x < -20 || b.x > WORLD_W + 20 || b.y < HUD_HEIGHT || b.y > WORLD_H + 20;
      if (outOfBounds || circleHitsAnyWall(b.x, b.y, b.size / 2)) {
        state.bullets.splice(i, 1);
      }
    }

    state.spawnInterval = computeSpawnInterval(state.elapsed);
    state.spawnAccum += delta;
    if (state.spawnAccum >= state.spawnInterval) {
      state.spawnAccum = 0;
      spawnEnemy(pickEnemyType());
      if (state.elapsed > DIFFICULTY.doubleSpawnAfterMs && Math.random() < DIFFICULTY.doubleSpawnChance) {
        spawnEnemy(pickEnemyType());
      }
    }

    const p = state.player;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];

      // FAILSAFE 1: Keep them inside the map bounds
      e.x = Math.max(0, Math.min(WORLD_W, e.x));
      e.y = Math.max(HUD_HEIGHT, Math.min(WORLD_H, e.y));

      // FAILSAFE 2: Un-stick from walls physically
      if (circleHitsAnyWall(e.x, e.y, e.size / 2)) {
        const pushAngle = Math.atan2(WORLD_H / 2 - e.y, WORLD_W / 2 - e.x);
        let ejectAttempts = 0;
        while (circleHitsAnyWall(e.x, e.y, e.size / 2) && ejectAttempts < 15) {
          e.x += Math.cos(pushAngle) * 4;
          e.y += Math.sin(pushAngle) * 4;
          ejectAttempts++;
        }
        if (ejectAttempts >= 15) {
          e.x = WORLD_W / 2;
          e.y = WORLD_H / 2;
        }
      }

      if (e.hitFlash > 0) {
        e.hitFlash = Math.max(0, e.hitFlash - delta);
      }

      if (e.y - e.size / 2 < HUD_HEIGHT) {
        e.y = HUD_HEIGHT + e.size / 2 + 2;
      }

      e.aiCooldown -= dt;
      e.pathTimer -= delta;

      if (e.aiCooldown <= 0) {
      e.currentDir = pickEnemyDirection(e, p);

      if (e.type === "fast") e.aiCooldown = 0.35;   // Was 0.1 (React 3.5 times a second)
        else if (e.type === "tank") e.aiCooldown = 0.60; // Was 0.25 (Slow, lumbering turns)
        else e.aiCooldown = 0.45;                       // Was 0.15 (Splitter/Worm)
      }

      const dir = e.currentDir;
      const step = e.speed * dt;
      const len = (dir.dx !== 0 && dir.dy !== 0) ? 1.414 : 1;

      const moved = tryMoveCircle(e.x, e.y, e.size / 2, (dir.dx / len) * step, (dir.dy / len) * step);
      e.x = moved.x;
      e.y = moved.y;
      e.wobble += dt * 6;

      const hitRadius = (e.size / 2 + p.size / 2);
      if (state.elapsed > p.invulnUntil && distSq(e.x, e.y, p.x, p.y) < hitRadius * hitRadius) {
        p.health = Math.max(0, p.health - e.damage);
        p.invulnUntil = state.elapsed + PLAYER.invulnMs;
        state.screenShake = 14;
        playHurt();
        explode(p.x, p.y, "#f85149", 12);
        state.enemies.splice(i, 1);

        if (p.health <= 0) {
          state.alive = false;
          state.screenShake = 0;
          playGameOver();
          explode(p.x, p.y, "#4ec9b0", 40);

          if (!state.gameOverFired) {
            state.gameOverFired = true;
            onGameOver({ score: state.score, survivalTime: Math.floor(state.elapsed / 1000) });
          }
          return;
        }
        continue;
      }
    }

    for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
      const b = state.bullets[bi];
      let consumed = false;
      const hitRadius = b.size / 2;

      for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
        const e = state.enemies[ei];
        const totalRadius = hitRadius + e.size / 2;

        if (distSq(b.x, b.y, e.x, e.y) < totalRadius * totalRadius) {
          e.hp -= b.damage;
          explode(b.x, b.y, e.color, 2);
          consumed = true;

          if (e.type === "tank" || e.type === "splitter" || e.type === "worm") {
            e.hitFlash = 60;
          }

          if (e.type === "tank" || e.type === "splitter") {
            const bLen = Math.hypot(b.vx, b.vy) || 1;
            const kx = (b.vx / bLen) * 3;
            const ky = (b.vy / bLen) * 3;
            const kb = tryMoveCircle(e.x, e.y, e.size / 2, kx, ky);
            e.x = kb.x;
            e.y = kb.y;
          }

          if (e.hp <= 0) {
            playKill(e.type);
            state.score += e.points;
            state.screenShake = Math.max(state.screenShake, e.type === "tank" ? 7 : 3);
            explode(e.x, e.y, e.color, 8);

            if (e.type === "splitter" && e.size > 14) {
              spawnEnemy("splitter", e.x - 10, e.y, e.size * 0.6, 1);
              spawnEnemy("splitter", e.x + 10, e.y, e.size * 0.6, 1);
            }
            state.enemies.splice(ei, 1);
          } else {
            playHit();
          }
          break;
        }
      }
      if (consumed) state.bullets.splice(bi, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.94;
      pt.vy *= 0.94;
      pt.life -= delta;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    if (state.screenShake > 0) {
      state.screenShake = Math.max(0, state.screenShake - delta * 0.05);
    }

    // Heartbeat logic
    if (state.alive && p.health <= 25 && p.health > 0) {
      state.heartbeatPhase += dt * 7.4;
      if (state.elapsed - state.lastHeartbeat > 850) {
        state.lastHeartbeat = state.elapsed;
        state.nextHeartbeatDub = state.elapsed + 180;
        state.heartbeatPhase = Math.PI / 2; 
        playHeartbeatLub();
      }
      
      if (state.nextHeartbeatDub > 0 && state.elapsed >= state.nextHeartbeatDub) {
        state.nextHeartbeatDub = 0;
        playHeartbeatDub();
      }
    } else {
      state.lastHeartbeat = 0;
      state.nextHeartbeatDub = 0;
      state.heartbeatPhase = 0;
    }
  }

  // ---------- Draw ----------
  function draw(ctx, isPaused) {
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    if (state.screenShake > 0 && !isPaused) {
      const s = state.screenShake;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    ctx.translate(-Math.round(state.camera.x), -Math.round(state.camera.y));

    const bloodFloor = ctx.createLinearGradient(0, 0, WORLD_W, WORLD_H);
    bloodFloor.addColorStop(0, "#26080d");
    bloodFloor.addColorStop(0.5, "#180609");
    bloodFloor.addColorStop(1, "#30090f");

    ctx.fillStyle = bloodFloor;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    for (let m = 0; m < state.bgMotes.length; m++) {
      const mote = state.bgMotes[m];
      ctx.fillStyle = mote.color;
      ctx.globalAlpha = mote.alpha;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < 100; i++) {
      const x = (i * 347 + 83) % WORLD_W;
      const y = (i * 193 + 47) % WORLD_H;
      const radius = 15 + ((i * 17) % 35);
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.7, radius, (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "rgba(90, 8, 22, 0.16)" : "rgba(130, 25, 40, 0.07)";
      ctx.fill();
    }

    const vessels = [
      [0, 160, 180, 210, 340, 175, 510, 230, 720, 190, 900, 250],
      [120, 0, 160, 150, 220, 280, 190, 430, 260, 600],
      [520, 0, 480, 130, 550, 260, 500, 390, 570, 520, 540, 750],
      [1000, 0, 940, 130, 1010, 250, 950, 390, 1030, 520],
      [WORLD_W, 200, 1420, 240, 1300, 190, 1150, 260, 1020, 230],
      [0, 780, 180, 730, 340, 800, 480, 750, 650, 820],
      [800, WORLD_H, 850, 850, 920, 730, 890, 620],
      [WORLD_W, 760, 1450, 720, 1350, 800, 1200, 760]
    ];

    vessels.forEach((points, index) => {
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (let j = 2; j < points.length; j += 2) {
        ctx.lineTo(points[j], points[j + 1]);
      }
      ctx.strokeStyle = index % 2 === 0 ? "rgba(130, 20, 38, 0.32)" : "rgba(75, 10, 25, 0.45)";
      ctx.lineWidth = index % 2 === 0 ? 24 : 16;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (let j = 2; j < points.length; j += 2) {
        ctx.lineTo(points[j], points[j + 1]);
      }
      ctx.strokeStyle = "rgba(200, 35, 55, 0.09)";
      ctx.lineWidth = 5;
      ctx.stroke();
    });

    for (let i = 0; i < 85; i++) {
      const x = (i * 193 + 71) % WORLD_W;
      const y = (i * 271 + 39) % WORLD_H;
      const rx = 4 + (i % 4);
      const ry = 2.5 + (i % 3) * 0.6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * 37 % 180) * Math.PI / 180);

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190, 35, 55, 0.22)";
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(60, 5, 15, 0.25)";
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 120; i++) {
      const x = (i * 149 + 31) % WORLD_W;
      const y = (i * 227 + 17) % WORLD_H;
      const size = 1 + (i % 3);
      ctx.fillStyle = "rgba(220, 65, 75, 0.13)";
      ctx.fillRect(x, y, size, size);
    }

    for (let i = 0; i < state.walls.length; i++) {
      const w = state.walls[i];
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.roundRect(w.x + 4, w.y + 4, w.w, w.h, 12);
      ctx.fill();

      ctx.fillStyle = "#2a121e";
      ctx.beginPath();
      ctx.roundRect(w.x, w.y, w.w, w.h, 12);
      ctx.fill();

      ctx.strokeStyle = "#f85149";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = "rgba(78, 201, 176, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4, 10);
      ctx.stroke();
    }

    for (let i = 0; i < state.particles.length; i++) {
      const pt = state.particles[i];
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.hitFlash > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.arc(0, 0, e.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (e.type === "worm") {
        const phase = state.elapsed * 0.012 + e.wobble;
        const size = e.size;

        ctx.strokeStyle = "#56B8FF";
        ctx.lineWidth = 1.5;

        for (let j = 0; j < 6; j++) {
          const side = j % 2 === 0 ? -1 : 1;
          const startX = side * size * 0.22;
          const startY = (j - 2.5) * size * 0.06;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          for (let k = 1; k <= 8; k++) {
            const x = startX + side * k * size * 0.045;
            const y = startY + Math.sin(phase + k * 0.9 + j * 1.3) * size * 0.08;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        ctx.rotate(Math.sin(phase) * 0.18);
        ctx.translate(0, Math.sin(phase * 1.5) * size * 0.06);

        ctx.beginPath();
        ctx.roundRect(-size * 0.36, -size * 0.18, size * 0.72, size * 0.36, size * 0.18);
        ctx.fillStyle = "#168BFF";
        ctx.fill();

        ctx.strokeStyle = "#8AD5FF";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let j = 0; j < 5; j++) {
          ctx.beginPath();
          ctx.arc(-size * 0.22 + j * size * 0.11, Math.sin(phase + j * 1.5) * size * 0.05, size * 0.025, 0, Math.PI * 2);
          ctx.fillStyle = "#0754A6";
          ctx.fill();
        }
      } else {
        const sprite = ENEMY_SPRITES[e.type];
        ctx.rotate(e.wobble);
        const scale = (e.size + 4) / sprite.width;
        ctx.scale(scale, scale);
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      }
      ctx.restore();

      if (e.maxHp > 1 && e.hp < e.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size, 3);
        ctx.fillStyle = "#3fb950";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size * (e.hp / e.maxHp), 3);
      }
    }

    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      const scale = b.size / 10;
      const w = BULLET_SPRITE.width * scale;
      const h = BULLET_SPRITE.height * scale;
      ctx.drawImage(BULLET_SPRITE, b.x - w / 2, b.y - h / 2, w, h);
    }

    const p = state.player;
    const r = p.size / 2;
    let visible = true;
    if (p.invulnUntil > state.elapsed) {
      const remaining = p.invulnUntil - state.elapsed;
      if (remaining > 0) visible = Math.floor(remaining / 80) % 2 === 0;
    }
    if (!state.alive) visible = true;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.aimAngle + Math.PI / 2);
    if (visible) {
      ctx.shadowColor = "#4ec9b0";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#4ec9b0";
      ctx.beginPath();
      ctx.arc(0, -r / 2, r, Math.PI, 0);
      ctx.lineTo(r, r / 2 - 2);
      ctx.arc(0, r / 2 - 2, r, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(-r * 0.9, -2, r * 1.8, 4);
      ctx.fillStyle = "#e6edf3";
      ctx.fillRect(-2.5, -r - 7, 5, 10);
      ctx.shadowBlur = 0;
    }

    if (p.muzzleFlash > 0) {
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#a5f3e0";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, -r - 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    ctx.restore();

    if (state.alive && p.health <= 25) {
      const pulse = (Math.sin(state.heartbeatPhase) + 1) * 0.5;
      const vigGrad = ctx.createRadialGradient(
        CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.25,
        CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.62
      );
      vigGrad.addColorStop(0, "rgba(248, 81, 73, 0)");
      vigGrad.addColorStop(1, `rgba(248, 81, 73, ${0.12 + pulse * 0.28})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, CANVAS_W, HUD_HEIGHT);

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, HUD_HEIGHT);
    ctx.lineTo(CANVAS_W, HUD_HEIGHT);
    ctx.stroke();

    const hpW = 220;
    const hp = p.health / PLAYER.maxHealth;
    const barY = (HUD_HEIGHT - 16) / 2;

    ctx.fillStyle = "#21262d";
    ctx.fillRect(14, barY, hpW, 16);
    ctx.fillStyle = hp > 0.5 ? "#3fb950" : hp > 0.25 ? "#d29922" : "#f85149";
    ctx.fillRect(14, barY, hpW * hp, 16);
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(14, barY, hpW, 16);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`HP ${Math.ceil(p.health)}`, 22, barY + 12);

    ctx.textAlign = "right";
    ctx.font = "bold 15px system-ui";
    ctx.fillStyle = "#4ec9b0";
    ctx.fillText(`KILLS ${state.score}`, CANVAS_W - 16, barY + 12);

    ctx.font = "11px system-ui";
    ctx.fillStyle = "#7d8590";
    ctx.fillText(`${(state.elapsed / 1000).toFixed(1)}s · ${state.mapName}`, CANVAS_W - 16, barY + 26);
  }

  return {
    reset, update, draw, handleInput, getState: () => state, isAlive: () => state.alive,
  };
}