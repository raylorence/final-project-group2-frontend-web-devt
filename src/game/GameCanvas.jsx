import { useEffect, useRef } from "react";
import { CANVAS_W, CANVAS_H } from "./constants.js";
import { createEngine } from "./engine.js";
import { initAudio, unlockAudio } from "./sound.js";

export default function GameCanvas({ onGameOver, onPause, paused = false }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const keysRef = useRef(new Set());
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(paused);
  const frozenRef = useRef(false);

  // Keep latest callbacks without re-running the main effect
  const onGameOverRef = useRef(onGameOver);
  const onPauseRef = useRef(onPause);

  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    initAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Auto-focus canvas on mount so WASD and Space register immediately
    canvas.focus();

    const ctx = canvas.getContext("2d");
    frozenRef.current = false;

    engineRef.current = createEngine((result) => {
      if (frozenRef.current) return;
      frozenRef.current = true;
      
      // Render one final frame so the corpse + HUD sit under the overlay
      engineRef.current.draw(ctx);
      
      // Notify React AFTER drawing, so the overlay appears over a frozen scene
      if (onGameOverRef.current) onGameOverRef.current(result);
    });

    function loop(t) {
      const delta = Math.min(50, t - lastTimeRef.current || 16);
      lastTimeRef.current = t;

      // frozenRef is checked FIRST - once true, nothing updates ever again
      if (!frozenRef.current && !pausedRef.current) {
        engineRef.current.handleInput(keysRef.current, t); // FIXED: Removed 'delta'
        engineRef.current.update(delta, t);
      }
      
      engineRef.current.draw(ctx); // FIXED: Removed 'pausedRef.current'

      // Draw Pause Overlay manually on top of the canvas
      if (pausedRef.current && !frozenRef.current) {
        ctx.fillStyle = "rgba(7, 11, 16, 0.65)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#4ec9b0";
        ctx.font = "bold 44px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", CANVAS_W / 2, CANVAS_H / 2 - 10);
        ctx.fillStyle = "#7d8590";
        ctx.font = "16px system-ui";
        ctx.fillText("Press Esc to resume", CANVAS_W / 2, CANVAS_H / 2 + 30);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    function onKeyDown(e) {
      // Unlock audio safely (without creating new contexts)
      unlockAudio();
      
      const k = e.key.toLowerCase();

      // Prevent accidental reload keys during gameplay
      if (k === "f5" || ((e.ctrlKey || e.metaKey) && k === "r")) {
        e.preventDefault();
        return;
      }

      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
      }
      if (k === "escape") {
        e.preventDefault();
        if (frozenRef.current) return;
        if (onPauseRef.current) onPauseRef.current();
        return;
      }
      if (frozenRef.current) return; // dead players can't move
      keysRef.current.add(k);
    }

    function onKeyUp(e) {
      keysRef.current.delete(e.key.toLowerCase());
    }

    function onBlur() {
      keysRef.current.clear();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
        cursor: "default",
        outline: "none",
      }}
      tabIndex={0}
    />
  );
}