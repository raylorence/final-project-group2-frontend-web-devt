import {
  CANVAS_W, CANVAS_H, PLAYER, BULLET, ENEMY_TYPES, DIFFICULTY,
} from "./constants.js";

export function createEngine(onGameOver) {
  // ---------- internal state ----------
  let state = null;

  function reset() {
    state = {
      player: {
        x: CANVAS_W / 2,
        y: CANVAS_H / 2,
        size: PLAYER.size,
        health: PLAYER.maxHealth,
        invulnUntil: 0,
        lastShotAt: 0,
        aimAngle: -Math.PI / 2,
      },
      bullets: [],
      enemies: [],
      particles: [],
      score: 0,
      elapsed: 0,
      spawnAccum: 0,
      spawnInterval: DIFFICULTY.initialSpawnMs,
      alive: true,
      screenShake: 0,
    };
  }

  reset();

  // ---------- helpers ----------
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
    const edge = Math.floor(Math.random() * 4);
    let sx = x, sy = y;
    if (x === undefined) {
      if (edge === 0) { sx = Math.random() * CANVAS_W; sy = -30; }
      else if (edge === 1) { sx = CANVAS_W + 30; sy = Math.random() * CANVAS_H; }
      else if (edge === 2) { sx = Math.random() * CANVAS_W; sy = CANVAS_H + 30; }
      else { sx = -30; sy = Math.random() * CANVAS_H; }
    }
    state.enemies.push({
      x: sx,
      y: sy,
      size: sizeOverride ?? t.size,
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

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function circlesOverlap(ax, ay, ar, bx, by, br) {
    return distance(ax, ay, bx, by) < ar + br;
  }

  // ---------- public API ----------
  function handleInput(keys, mouse, now) {
    if (!state.alive) return;
    const p = state.player;
    let dx = 0, dy = 0;
    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len; dy /= len;
      p.x += dx * PLAYER.speed * (1 / 60);
      p.y += dy * PLAYER.speed * (1 / 60);
      p.x = Math.max(p.size / 2, Math.min(CANVAS_W - p.size / 2, p.x));
      p.y = Math.max(p.size / 2, Math.min(CANVAS_H - p.size / 2, p.y));
    }
    if (mouse) {
      p.aimAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
    }
    
if (
  (keys.has(" ") || mouse?.shooting) &&
  now - p.lastShotAt >= PLAYER.fireCooldown
) {
  fire(now);
}

  }

  function fire(now) {
    const p = state.player;
    p.lastShotAt = now;
    const muzzle = p.size / 2 + BULLET.size / 2;
    state.bullets.push({
      x: p.x + Math.cos(p.aimAngle) * muzzle,
      y: p.y + Math.sin(p.aimAngle) * muzzle,
      vx: Math.cos(p.aimAngle) * BULLET.speed,
      vy: Math.sin(p.aimAngle) * BULLET.speed,
      size: BULLET.size,
      damage: BULLET.damage,
      age: 0,
    });
  }

  function update(delta, now) {
    if (!state.alive) return;
    const dt = delta / 1000;
    state.elapsed += delta;

    // --- bullets ---
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.age += delta;
      if (
        b.age > BULLET.lifetime ||
        b.x < -20 || b.x > CANVAS_W + 20 ||
        b.y < -20 || b.y > CANVAS_H + 20
      ) {
        state.bullets.splice(i, 1);
      }
    }

    // --- spawn ---
    state.spawnAccum += delta;
    if (state.spawnAccum >= state.spawnInterval) {
      state.spawnAccum = 0;
      spawnEnemy(pickEnemyType());
      // small chance for an extra spawn as difficulty climbs
      if (state.score > 20 && Math.random() < 0.35) spawnEnemy(pickEnemyType());
    }

    // --- enemies ---
    const p = state.player;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      const ang = Math.atan2(p.y - e.y, p.x - e.x);
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;
      e.wobble += dt * 6;

      // enemy hits player
      if (
        now > p.invulnUntil &&
        circlesOverlap(e.x, e.y, e.size / 2, p.x, p.y, p.size / 2)
      ) {
        p.health -= e.damage;
        p.invulnUntil = now + PLAYER.invulnMs;
        state.screenShake = 12;
        explode(p.x, p.y, "#f85149", 12);
        state.enemies.splice(i, 1);
        if (p.health <= 0) {
          p.health = 0;
          state.alive = false;
          explode(p.x, p.y, "#4ec9b0", 40);
          onGameOver({ score: state.score, survivalTime: Math.floor(state.elapsed / 1000) });
          return;
        }
        continue;
      }
    }

    // --- bullet vs enemy ---
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
            if (e.type === "splitter" && e.size > 20) {
              spawnEnemy("splitter", e.x - 14, e.y, e.size * 0.6, 1);
              spawnEnemy("splitter", e.x + 14, e.y, e.size * 0.6, 1);
            }
            state.enemies.splice(ei, 1);
            state.spawnInterval = Math.max(
              DIFFICULTY.minSpawnMs,
              DIFFICULTY.initialSpawnMs - state.score * DIFFICULTY.spawnRampPerKill
            );
          }
          break;
        }
      }
      if (consumed) state.bullets.splice(bi, 1);
    }

    // --- particles ---
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

  function draw(ctx) {
    ctx.save();
    if (state.screenShake > 0) {
      const s = state.screenShake;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    // background
    const grad = ctx.createRadialGradient(
      CANVAS_W / 2, CANVAS_H / 2, 60,
      CANVAS_W / 2, CANVAS_H / 2, Math.max(CANVAS_W, CANVAS_H)
    );
    grad.addColorStop(0, "#1a2430");
    grad.addColorStop(1, "#070b10");
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

    // faint grid (cell-like)
    ctx.strokeStyle = "rgba(78, 201, 176, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // particles
    for (const pt of state.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // enemies (spiky viruses)
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
      ctx.lineWidth = 2;
      ctx.stroke();
      // hp pips for tanks
      if (e.maxHp > 1 && e.hp < e.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 10, e.size, 4);
        ctx.fillStyle = "#3fb950";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2 - 10, e.size * (e.hp / e.maxHp), 4);
      }
    }

    // bullets (glowing capsules)
    for (const b of state.bullets) {
      ctx.shadowColor = "#4ec9b0";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#a5f3e0";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // player (capsule)
    const p = state.player;
    const flashing = p.invulnUntil > performance.now() && Math.floor(p.invulnUntil / 80) % 2 === 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.aimAngle + Math.PI / 2);
    if (!flashing) {
      ctx.shadowColor = "#4ec9b0";
      ctx.shadowBlur = 18;
      // capsule body
      ctx.fillStyle = "#4ec9b0";
      const r = p.size / 2;
      ctx.beginPath();
      ctx.arc(0, -r / 2, r, Math.PI, 0);
      ctx.lineTo(r, r / 2 - 2);
      ctx.arc(0, r / 2 - 2, r, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      // stripe
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(-r * 0.9, -3, r * 1.8, 6);
      // barrel
      ctx.fillStyle = "#e6edf3";
      ctx.fillRect(-4, -r - 10, 8, 14);
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, CANVAS_W, 42);

    // health bar
    const hpW = 220;
    const hp = p.health / PLAYER.maxHealth;
    ctx.fillStyle = "#21262d";
    ctx.fillRect(14, 12, hpW, 18);
    ctx.fillStyle = hp > 0.5 ? "#3fb950" : hp > 0.25 ? "#d29922" : "#f85149";
    ctx.fillRect(14, 12, hpW * hp, 18);
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 12, hpW, 18);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`HP ${Math.ceil(p.health)}`, 22, 26);

    // score + time
    ctx.textAlign = "right";
    ctx.font = "bold 16px system-ui";
    ctx.fillStyle = "#4ec9b0";
    ctx.fillText(`KILLS ${state.score}`, CANVAS_W - 16, 26);
    ctx.font = "12px system-ui";
    ctx.fillStyle = "#7d8590";
    ctx.fillText(`${(state.elapsed / 1000).toFixed(1)}s`, CANVAS_W - 16, 42 + 14);

    ctx.restore();
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