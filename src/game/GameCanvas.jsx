import { useEffect, useRef } from "react";
import { CANVAS_W, CANVAS_H } from "./constants.js";
import { createEngine } from "./engine.js";

export default function GameCanvas({ onGameOver, paused = false }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const keysRef = useRef(new Set());
  const mouseRef = useRef({
  x: CANVAS_W / 2,
  y: CANVAS_H / 2 - 100,
  shooting: false,
});
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(paused);
  const gameOverFiredRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    engineRef.current = createEngine((result) => {
      if (gameOverFiredRef.current) return;
      gameOverFiredRef.current = true;
      onGameOver(result);
    });
    gameOverFiredRef.current = false;

    function loop(t) {
      const delta = Math.min(50, t - lastTimeRef.current || 16);
      lastTimeRef.current = t;
      if (!pausedRef.current && engineRef.current.isAlive()) {
        engineRef.current.handleInput(keysRef.current, mouseRef.current, t);
        engineRef.current.update(delta, t);
      }
      engineRef.current.draw(ctx);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // ----- input listeners -----
    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
      }
      keysRef.current.add(k);
    }
    function onKeyUp(e) {
      keysRef.current.delete(e.key.toLowerCase());
    }
    function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;

  mouseRef.current = {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
    shooting: mouseRef.current.shooting,
  };
}

function onMouseDown(e) {
  if (e.button === 0) {
    mouseRef.current.shooting = true;
  }
}

function onMouseUp(e) {
  if (e.button === 0) {
    mouseRef.current.shooting = false;
  }
}
    function onBlur() {
      keysRef.current.clear();
    }

    window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
window.removeEventListener("keyup", onKeyUp);
canvas.removeEventListener("mousemove", onMouseMove);
canvas.removeEventListener("mousedown", onMouseDown);
window.removeEventListener("mouseup", onMouseUp);
window.removeEventListener("blur", onBlur);
    };
  }, [onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        width: "100%",
        maxWidth: CANVAS_W,
        borderRadius: 10,
        border: "1px solid #30363d",
        display: "block",
        margin: "0 auto",
        cursor: "crosshair",
      }}
    />
  );
}