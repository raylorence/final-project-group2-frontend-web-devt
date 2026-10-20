import {
  CANVAS_W, CANVAS_H, WORLD_W, WORLD_H, HUD_HEIGHT,
  PLAYER, BULLET, ENEMY_TYPES, DIFFICULTY, DIRECTIONS, MAPS,
} from "./constants.js";

export function createEngine(onGameOver) {
  let state = null;

  function pickMap() {
    return MAPS[Math.floor(Math.random() * MAPS.length)];
  }

  function reset() {
    const map = pickMap();
    
    state = {
      mapName: map.name,
      player: {
        x: map.spawn.x,
        // Push spawn down if a map spawns them too close to the top
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

    // Clamp camera to world bounds
    targetX = Math.max(0, Math.min(targetX, WORLD_W - CANVAS_W));
    
    // Clamp camera so it doesn't scroll up past the HUD
    targetY = Math.max(0, Math.min(targetY, WORLD_H - CANVAS_H));

    state.camera.x += (targetX - state.camera.x) * 0.1;
    state.camera.y += (targetY - state.camera.y) * 0.1;
  }

  // ---------- Collision ----------
  function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
    const nx = Math.max(rx, Math.min(cx, rx + rw));
    const ny = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }

  function circleHitsAnyWall(cx, cy, cr) {
    // Prevent walking into the HUD dead zone
    if (cy - cr < HUD_HEIGHT) return true; 

    for (const w of state.walls) {
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

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function circlesOverlap(ax, ay, ar, bx, by, br) {
    return distance(ax, ay, bx, by) < ar + br;
  }

  // ---------- Spawning ----------
  function pickEnemyType() {
    const entries = Object.entries(ENEMY_TYPES);
    const total = entries.reduce((s, [, t]) => s + t.spawnWeight, 0);
    let r = Math.random() * total;
    for (const [name, t] of entries) {
      r -= t.spawnWeight;
      if (r <= 0) return name;
    }
    return "fast";
  }

  function spawnEnemy(typeName, x, y, sizeOverride, hpOverride) {
    const t = ENEMY_TYPES[typeName];
    let sx = x, sy = y;
    if (x === undefined) {
      const edge = Math.floor(Math.random() * 4);
      // Don't spawn on the top edge if it's inside the HUD
      if (edge === 0) { sx = Math.random() * WORLD_W; sy = HUD_HEIGHT + 10; } 
      else if (edge === 1) { sx = WORLD_W + 30; sy = Math.random() * WORLD_H; }
      else if (edge === 2) { sx = Math.random() * WORLD_W; sy = WORLD_H + 30; }
      else { sx = -30; sy = Math.random() * WORLD_H; }
    }
    const size = sizeOverride ?? t.size;
    if (circleHitsAnyWall(sx, sy, size / 2)) {
      sx += size * 2;
      sy += size * 2;
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
    });
  }

  function explode(x, y, color, count = 8) {
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

  function handleInput(keys, now) {
    if (!state.alive) return;
    const p = state.player;

    const dir = resolveDirection(keys.has("w"), keys.has("s"), keys.has("a"), keys.has("d"));

    if (dir) {
      p.facingX = dir.dx;
      p.facingY = dir.dy;
      p.aimAngle = dir.angle;

      const len = Math.hypot(dir.dx, dir.dy);
      const step = PLAYER.speed * (1 / 60);
      
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

  // ---------- AI ----------
  const ENEMY_DIRS = [
    DIRECTIONS.N, DIRECTIONS.NE, DIRECTIONS.E, DIRECTIONS.SE,
    DIRECTIONS.S, DIRECTIONS.SW, DIRECTIONS.W, DIRECTIONS.NW,
  ];

  function pickEnemyDirection(e, p) {
    const rawAngle = Math.atan2(p.y - e.y, p.x - e.x);
    const candidates = [...ENEMY_DIRS].sort((a, b) => {
      const da = Math.abs(rawAngle - a.angle);
      const db = Math.abs(rawAngle - b.angle);
      const wa = da > Math.PI ? Math.PI * 2 - da : da;
      const wb = db > Math.PI ? Math.PI * 2 - db : db;
      return wa - wb;
    });
    const r = e.size / 2;
    for (const d of candidates) {
      const nx = e.x + d.dx * 4;
      const ny = e.y + d.dy * 4;
      if (!circleHitsAnyWall(nx, ny, r)) return d;
    }
    return candidates[0];
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
        b.y < HUD_HEIGHT || b.y > WORLD_H + 20; // Bullets die if they hit the HUD

      const hitWall = circleHitsAnyWall(b.x, b.y, b.size / 2);

      if (outOfBounds || hitWall) {
        if (hitWall) explode(b.x, b.y, "#7d8590", 3);
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
      
      const dir = pickEnemyDirection(e, p);
      const len = Math.hypot(dir.dx, dir.dy) || 1;
      const step = e.speed * dt;
      
      const moved = tryMoveCircle(
        e.x, e.y, e.size / 2,
        (dir.dx / len) * step,
        (dir.dy / len) * step
      );
      
      e.x = moved.x;
      e.y = moved.y;
      e.wobble += dt * 6;

      if (
        now > p.invulnUntil &&
        circlesOverlap(e.x, e.y, e.size / 2, p.x, p.y, p.size / 2)
      ) {
        p.health = Math.max(0, p.health - e.damage);
        p.invulnUntil = now + PLAYER.invulnMs;
        explode(p.x, p.y, "#f85149", 12);
        state.enemies.splice(i, 1);

        if (p.health <= 0) {
          state.alive = false;
          state.screenShake = 0;
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
      for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
        const e = state.enemies[ei];
        if (circlesOverlap(b.x, b.y, b.size / 2, e.x, e.y, e.size / 2)) {
          e.hp -= b.damage;
          explode(b.x, b.y, e.color, 4);
          consumed = true;
          if (e.hp <= 0) {
            state.score += e.points;
            explode(e.x, e.y, e.color, 12);
            if (e.type === "splitter" && e.size > 14) {
              spawnEnemy("splitter", e.x - 10, e.y, e.size * 0.6, 1);
              spawnEnemy("splitter", e.x + 10, e.y, e.size * 0.6, 1);
            }
            state.enemies.splice(ei, 1);
          }
          break;
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

  // ---------- Draw ----------
  function draw(ctx) {
    // 1. Draw the game world
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
    for (const w of state.walls) {
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
    for (const pt of state.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Enemies
    for (const e of state.enemies) {
      const spikes = 10;
      const outer = e.size / 2;
      const inner = outer * 0.65;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (spikes * 2)) * Math.PI * 2 + e.wobble;
        const px = e.x + Math.cos(a) * r;
        const py = e.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = e.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      if (e.maxHp > 1 && e.hp < e.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size, 3);
        ctx.fillStyle = "#3fb950";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 8, e.size * (e.hp / e.maxHp), 3);
      }
    }

    // Bullets
    for (const b of state.bullets) {
      const angle = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.shadowColor = "#4ec9b0";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#a5f3e0";
      const w = b.size * 0.7; 
      const h = b.size * 1.5; 
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, w / 2);
      else ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

    ctx.restore(); // End camera translation

    // 2. Draw the HUD Dead Zone (Always on top)
    // Draw a solid background for the HUD
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, CANVAS_W, HUD_HEIGHT);
    
    // Draw a border line under the HUD
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, HUD_HEIGHT);
    ctx.lineTo(CANVAS_W, HUD_HEIGHT);
    ctx.stroke();

    // Draw Health Bar (Centered vertically in the 40px space)
    const hpW = 220;
    const hp = p.health / PLAYER.maxHealth;
    const barY = (HUD_HEIGHT - 16) / 2; // Centers a 16px tall bar in 40px
    
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

    // Draw Score & Time (Centered vertically in the 40px space)
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