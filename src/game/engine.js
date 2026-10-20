import { initAudio, playSound } from "./audio.js";

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
  // Center the drawing point
  ctx.translate(size / 2, size / 2);

  // Draw the original glowing circle
  ctx.shadowColor = "#4ec9b0";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#a5f3e0";
  ctx.beginPath();
  ctx.arc(0, 0, size / 2 - 10, 0, Math.PI * 2); // 10px padding for the shadow
  ctx.fill();
}, 30);

// Pre-render all enemy types
Object.entries(ENEMY_TYPES).forEach(([type, t]) => {
  ENEMY_SPRITES[type] = createSprite((ctx, size) => {
    const spikes = 10;
    const outer = size / 2 - 2; // Padding
    const inner = outer * 0.65;
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = t.color;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, t.size + 4); // Add padding for the stroke
});

export function createEngine(onGameOver) {
  let state = null;

  function pickMap() {
    return MAPS[Math.floor(Math.random() * MAPS.length)];
  }

  function reset() {
    initAudio();

    const map = pickMap();

    state = {
      mapName: map.name,
      player: {
        x: map.spawn.x,
        y: Math.max(map.spawn.y, HUD_HEIGHT + 30),
        size: PLAYER.size,
        health: PLAYER.maxHealth,
        invulnUntil: 0,
        lastShotAt: 0,
        facingX: 0,
        facingY: -1,
        aimAngle: -Math.PI / 2,
      },
      walls: map.walls.map((w) => ({ ...w })),
      bullets: [],
      enemies: [],
      particles: [],
      score: 0,
      elapsed: 0,
      spawnAccum: 0,
      spawnInterval: DIFFICULTY.initialSpawnMs,
      alive: true,
      screenShake: 0,
      gameOverFired: false,
      camera: { x: 0, y: 0 },
    };

    updateCamera();
  }

  reset();

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
  // Fast distance check (no Math.hypot)
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
    let nx = x + mx;
    if (circleHitsAnyWall(nx, y, r)) nx = x;
    let ny = y + my;
    if (circleHitsAnyWall(nx, ny, r)) ny = y;
    return { x: nx, y: ny };
  }

  // ---------- Spawning ----------
  function pickEnemyType() {
    // Fast manual weighted pick
    const r = Math.random() * 11; // Sum of weights (6 + 3 + 2)
    if (r < 6) return "fast";
    if (r < 9) return "tank";
    return "splitter";
  }

  function spawnEnemy(typeName, x, y, sizeOverride, hpOverride) {
    const t = ENEMY_TYPES[typeName];
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

      // Ensure enemies spawn off-camera and out of walls
      while (!valid && attempts < 20) {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { // Top
          sx = Math.random() * (viewRight - viewLeft) + viewLeft;
          sy = viewTop - buffer;
        } else if (edge === 1) { // Right
          sx = viewRight + buffer;
          sy = Math.random() * (viewBottom - viewTop) + viewTop;
        } else if (edge === 2) { // Bottom
          sx = Math.random() * (viewRight - viewLeft) + viewLeft;
          sy = viewBottom + buffer;
        } else { // Left
          sx = viewLeft - buffer;
          sy = Math.random() * (viewBottom - viewTop) + viewTop;
        }

        // Prevent spawning in the top HUD area where they get paralyzed
        sy = Math.max(HUD_HEIGHT + size / 2 + 10, sy);

        // Verify it's not inside the camera view and not stuck in a wall
        const inViewX = sx > viewLeft - size && sx < viewRight + size;
        const inViewY = sy > viewTop - size && sy < viewBottom + size;

        if (!(inViewX && inViewY) && !circleHitsAnyWall(sx, sy, size / 2)) {
          valid = true;
        }
        attempts++;
      }

      // Failsafe if we couldn't find an offscreen point after 20 tries
      if (!valid) {
        sx = viewRight + buffer;
        sy = Math.max(HUD_HEIGHT + size / 2 + 10, viewBottom + buffer);
      }
    }

    // Push out of walls (like splitters dying on walls)
    if (x !== undefined && circleHitsAnyWall(sx, sy, size / 2)) {
      const pushAngle = Math.atan2(WORLD_H / 2 - sy, WORLD_W / 2 - sx);
      let attempts = 0;

      while (circleHitsAnyWall(sx, sy, size / 2) && attempts < 30) {
        sx += Math.cos(pushAngle) * 8;
        sy += Math.sin(pushAngle) * 8;

        // FIX: Ensure the push-out logic doesn't shove them into the HUD
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
      currentDir: null
    });
  }

  function explode(x, y, color, count = 8) {
    // Cap particles to prevent lag
    if (state.particles.length > 200) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 180;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 380,
        maxLife: 380,
        color,
        size: 2 + Math.random() * 3,
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

  function handleInput(keys, delta, now) {
    if (!state.alive) return;
    const p = state.player;

    const dir = resolveDirection(keys.has("w"), keys.has("s"), keys.has("a"), keys.has("d"));

    if (dir) {
      p.facingX = dir.dx;
      p.facingY = dir.dy;
      p.aimAngle = dir.angle;

      const len = Math.hypot(dir.dx, dir.dy);
      const step = PLAYER.speed * (delta / 1000);

      const moved = tryMoveCircle(
          p.x, p.y, p.size / 2,
          (dir.dx / len) * step,
          (dir.dy / len) * step
      );

      p.x = Math.max(p.size / 2, Math.min(WORLD_W - p.size / 2, moved.x));
      p.y = Math.max(HUD_HEIGHT + p.size / 2, Math.min(WORLD_H - p.size / 2, moved.y));
    }

    if (keys.has(" ") && now - p.lastShotAt >= PLAYER.fireCooldown) {
      fire(now);
    }
  }

  function fire(now) {
    const p = state.player;
    p.lastShotAt = now;
    playSound("shoot");
    const muzzle = p.size / 2 + BULLET.size / 2;
    const dirX = p.facingX;
    const dirY = p.facingY;
    const len = Math.hypot(dirX, dirY) || 1;

    state.bullets.push({
      x: p.x + (dirX / len) * muzzle,
      y: p.y + (dirY / len) * muzzle,
      vx: (dirX / len) * BULLET.speed,
      vy: (dirY / len) * BULLET.speed,
      size: BULLET.size,
      damage: BULLET.damage,
      age: 0,
    });
  }

  // ---------- AI (Optimized) ----------
  const ENEMY_DIRS = [
    DIRECTIONS.N, DIRECTIONS.NE, DIRECTIONS.E, DIRECTIONS.SE,
    DIRECTIONS.S, DIRECTIONS.SW, DIRECTIONS.W, DIRECTIONS.NW,
  ];

  function pickEnemyDirection(e, p) {
    // Fast manual angle diff check without sorting arrays
    const rawAngle = Math.atan2(p.y - e.y, p.x - e.x);
    let bestDir = ENEMY_DIRS[0];
    let bestDiff = Infinity;

    for (let i = 0; i < ENEMY_DIRS.length; i++) {
      const d = ENEMY_DIRS[i];
      let diff = Math.abs(rawAngle - d.angle);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < bestDiff) {
        // Check if it hits a wall
        const nx = e.x + d.dx * 4;
        const ny = e.y + d.dy * 4;
        if (!circleHitsAnyWall(nx, ny, e.size / 2)) {
          bestDiff = diff;
          bestDir = d;
        }
      }
    }
    return bestDir;
  }

  function computeSpawnInterval(elapsedMs) {
    const t = Math.min(1, elapsedMs / DIFFICULTY.rampDurationMs);
    return (
        DIFFICULTY.initialSpawnMs +
        (DIFFICULTY.minSpawnMs - DIFFICULTY.initialSpawnMs) * t
    );
  }

  // ---------- Update ----------
  function update(delta, now) {
    if (!state.alive) return;

    const dt = delta / 1000;
    state.elapsed += delta;

    updateCamera();

    // Bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.age += delta;

      const outOfBounds =
          b.age > BULLET.lifetime ||
          b.x < -20 || b.x > WORLD_W + 20 ||
          b.y < HUD_HEIGHT || b.y > WORLD_H + 20;

      if (outOfBounds || circleHitsAnyWall(b.x, b.y, b.size / 2)) {
        state.bullets.splice(i, 1);
      }
    }

    // Spawning
    state.spawnInterval = computeSpawnInterval(state.elapsed);
    state.spawnAccum += delta;
    if (state.spawnAccum >= state.spawnInterval) {
      state.spawnAccum = 0;
      spawnEnemy(pickEnemyType());
      if (
          state.elapsed > DIFFICULTY.doubleSpawnAfterMs &&
          Math.random() < DIFFICULTY.doubleSpawnChance
      ) {
        spawnEnemy(pickEnemyType());
      }
    }

// Enemies
    const p = state.player;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];

      // Failsafe for enemies stuck in the top HUD zone
      if (e.y - e.size / 2 < HUD_HEIGHT) {
        e.y = HUD_HEIGHT + e.size / 2 + 2;
      }

      // AI Reaction Time Logic
      e.aiCooldown -= dt;
      if (e.aiCooldown <= 0 || !e.currentDir) {
        e.currentDir = pickEnemyDirection(e, p);

        // Set the reaction delay based on enemy type.
        // Fast enemies react in 0.15s, tanks take 0.5s to turn.
        if (e.type === "fast") e.aiCooldown = 0.15;
        else if (e.type === "tank") e.aiCooldown = 0.50;
        else e.aiCooldown = 0.30;
      }

      const dir = e.currentDir; // Use the stored direction instead of recalculating
      const step = e.speed * dt;
      const len = (dir.dx !== 0 && dir.dy !== 0) ? 1.414 : 1;

      const moved = tryMoveCircle(
          e.x, e.y, e.size / 2,
          (dir.dx / len) * step,
          (dir.dy / len) * step
      );

      e.x = moved.x;
      e.y = moved.y;
      e.wobble += dt * 6;
      // Use squared distance for collision check (fast)
      const hitRadius = (e.size / 2 + p.size / 2);
      if (now > p.invulnUntil && distSq(e.x, e.y, p.x, p.y) < hitRadius * hitRadius) {
        p.health = Math.max(0, p.health - e.damage);
        p.invulnUntil = now + PLAYER.invulnMs;
        playSound("hurt");
        explode(p.x, p.y, "#f85149", 12);
        state.enemies.splice(i, 1);

        if (p.health <= 0) {
          state.alive = false;
          state.screenShake = 0;
          playSound("gameover");
          explode(p.x, p.y, "#4ec9b0", 40);

          if (!state.gameOverFired) {
            state.gameOverFired = true;
            onGameOver({
              score: state.score,
              survivalTime: Math.floor(state.elapsed / 1000),
            });
          }
          return;
        }
        continue;
      }
    }

    // Bullets vs Enemies
    for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
      const b = state.bullets[bi];
      let consumed = false;
      const hitRadius = b.size / 2;

      for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
        const e = state.enemies[ei];
        const totalRadius = hitRadius + e.size / 2;

        if (distSq(b.x, b.y, e.x, e.y) < totalRadius * totalRadius) {
          e.hp -= b.damage;
          playSound("hit");
          explode(b.x, b.y, e.color, 2); // Reduced particles
          consumed = true;

          if (e.hp <= 0) {
            state.score += e.points;
            explode(e.x, e.y, e.color, 8); // Reduced particles
            if (e.type === "splitter" && e.size > 14) {
              spawnEnemy("splitter", e.x - 10, e.y, e.size * 0.6, 1);
              spawnEnemy("splitter", e.x + 10, e.y, e.size * 0.6, 1);
            }
            state.enemies.splice(ei, 1);
          }
          break; // Bullet is consumed, stop checking other enemies
        }
      }
      if (consumed) state.bullets.splice(bi, 1);
    }

    // Particles
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
  }

  // ---------- Draw (Optimized) ----------
  function draw(ctx) {
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();

    if (state.screenShake > 0) {
      const s = state.screenShake;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    ctx.translate(-Math.round(state.camera.x), -Math.round(state.camera.y));

    // World Background
    const grad = ctx.createRadialGradient(
        WORLD_W / 2, WORLD_H / 2, 60,
        WORLD_W / 2, WORLD_H / 2, Math.max(WORLD_W, WORLD_H)
    );
    grad.addColorStop(0, "#1a2430");
    grad.addColorStop(1, "#070b10");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    // World Grid
    ctx.strokeStyle = "rgba(78, 201, 176, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < WORLD_W; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_H); ctx.stroke();
    }
    for (let y = 0; y < WORLD_H; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
    }

    // Walls
    for (let i = 0; i < state.walls.length; i++) {
      const w = state.walls[i];
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(w.x + 3, w.y + 3, w.w, w.h);
      ctx.fillStyle = "#2b3440";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = "#4a5664";
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
      ctx.strokeStyle = "rgba(78, 201, 176, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
    }

    // Particles
    for (let i = 0; i < state.particles.length; i++) {
      const pt = state.particles[i];
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size); // fillRect is faster than arc
    }
    ctx.globalAlpha = 1;

    // Enemies (Using Pre-rendered Sprites)
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      const sprite = ENEMY_SPRITES[e.type];

      // We rotate the canvas slightly to maintain the "wobble" effect
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.wobble);

      const scale = (e.size + 4) / sprite.width;
      ctx.scale(scale, scale);

      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();

      // HP Bar
      if (e.maxHp > 1 && e.hp < e.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size, 3);
        ctx.fillStyle = "#3fb950";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size * (e.hp / e.maxHp), 3);
      }
    }

    // Bullets
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];

      // Fast scaling to bullet size
      const scale = b.size / 10; // Base sprite was drawn at size 10
      const w = BULLET_SPRITE.width * scale;
      const h = BULLET_SPRITE.height * scale;

      ctx.drawImage(BULLET_SPRITE, b.x - w / 2, b.y - h / 2, w, h);
    }

    // Player
    const p = state.player;
    let visible = true;
    if (p.invulnUntil > 0) {
      const remaining = p.invulnUntil - performance.now();
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
      const r = p.size / 2;
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
    ctx.restore();

    ctx.restore(); // End Camera

    // --- DRAW HUD ---
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
    reset,
    update,
    draw,
    handleInput,
    getState: () => state,
    isAlive: () => state.alive,
  };
}