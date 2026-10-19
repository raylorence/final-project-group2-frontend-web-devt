import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCanvas from "../game/GameCanvas.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { submitScore } from "../api/scoreApi.js";

/**
 * Game Page Component
 *
 * Runs the survival arena game loop on Canvas.
 * Upon Game Over, handles automatic score submission to MongoDB via `submitScore` caller (`POST /api/scores`).
 */
export default function Game() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gameKey, setGameKey] = useState(0);
  const [paused, setPaused] = useState(false);

  /**
   * Invoked when player health reaches 0 (Game Over)
   */
  const handleGameOver = useCallback(
    async (matchResult) => {
      setResult(matchResult);
      setPaused(false); // game over overlay takes over; pause is irrelevant

      // If user is not logged in, skip backend submission
      if (!token) return;

      setSubmitting(true);
      setError("");
      try {
        await submitScore(matchResult.score, matchResult.survivalTime, token);
      } catch (err) {
        console.error("Score submission failed:", err);
        setError(err.message || "Failed to submit score to leaderboard");
      } finally {
        setSubmitting(false);
      }
    },
    [token]
  );

  /**
   * Toggle pause. Disabled once the run is over.
   */
  const handleTogglePause = useCallback(() => {
    if (result) return;
    setPaused((p) => !p);
  }, [result]);

  /**
   * Reset game state and remount canvas for a new match run
   */
  function restart() {
    setResult(null);
    setError("");
    setPaused(false);
    setGameKey((k) => k + 1); // Remount canvas to reset game engine
  }

  const isRunning = !result;

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          gap: 12,
        }}
      >
        <h2>Huling Kapsula — Survival</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="muted" style={{ fontSize: 13 }}>
            WASD move · Spacebar shoot · Esc pause
          </div>
          <button
            className="secondary"
            onClick={handleTogglePause}
            disabled={!isRunning}
            style={{ minWidth: 90 }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <GameCanvas
          key={gameKey}
          onGameOver={handleGameOver}
          onPause={handleTogglePause}
          paused={paused}
        />

        {result && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(7, 11, 16, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              textAlign: "center",
              padding: 24,
              zIndex: 10,
            }}
          >
            <h1 style={{ fontSize: 42, color: "#f85149" }}>INFECTED</h1>
            <p style={{ fontSize: 20, marginBottom: 6 }}>
              Kills: <strong>{result.score}</strong>
            </p>
            <p className="muted" style={{ marginBottom: 18 }}>
              Survived {result.survivalTime}s
            </p>
            {submitting && <p className="muted">Submitting score…</p>}
            {error && <p className="error">{error}</p>}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={restart}>Try Again</button>
              <button className="secondary" onClick={() => navigate("/menu")}>
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}