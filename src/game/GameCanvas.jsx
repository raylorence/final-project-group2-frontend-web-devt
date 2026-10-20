import { useEffect, useRef } from "react";
import { CANVAS_W, CANVAS_H } from "./constants.js";
import { createEngine } from "./engine.js";

export default function GameCanvas({ onGameOver, onPause, paused = false }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const keysRef = useRef(new Set());
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(paused);
  const frozenRef = useRef(false);   // set true the moment game over fires
  const onGameOverRef = useRef(onGameOver);
  const onPauseRef = useRef(onPause);

  // Keep latest callbacks without re-running the main effect
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
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

      // frozenRef is checked FIRST — once true, nothing updates ever again
      if (!frozenRef.current && !pausedRef.current) {
        engineRef.current.handleInput(keysRef.current, delta, t);
        engineRef.current.update(delta, t);
      }

      engineRef.current.draw(ctx, pausedRef.current);


      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    function onKeyDown(e) {
      if (window.AudioContext || window.webkitAudioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      }
      
      const k = e.key.toLowerCase();
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
      }
      if (k === "escape") {
        e.preventDefault();
        if (frozenRef.current) return;
        if (onPauseRef.current) onPauseRef.current();
        return;
      }
      if (frozenRef.current) return;   // dead players can't move
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
  }, []);  // <-- EMPTY deps: engine created exactly once per mount

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