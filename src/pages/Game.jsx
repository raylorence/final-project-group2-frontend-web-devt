import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCanvas from "../game/GameCanvas.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { submitScore } from "../api/scoreApi.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { toggleMute, getMuteState } from "../game/sound.js";


export default function Game() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isBestRecord, setIsBestRecord] = useState(false);
    const [error, setError] = useState("");
    const [gameKey, setGameKey] = useState(0);
    const [paused, setPaused] = useState(false);
    const [pendingNav, setPendingNav] = useState(null);
    const [isMuted, setIsMuted] = useState(getMuteState());

    const handleGameOver = useCallback(
        async (matchResult) => {
            setResult(matchResult);
            setPaused(false);
            if (!token) return;

            setSubmitting(true);
            setError("");
            try {
                const response = await submitScore(matchResult.score, matchResult.survivalTime, token);
                if (response?.isPersonalBest) {
                    setIsBestRecord(true);
                }
            } catch (err) {
                console.error("Score submission failed:", err);
                setError(err.message || "Failed to submit score to leaderboard");
            } finally {
                setSubmitting(false);
            }
        },
        [token]
    );

    const handleTogglePause = useCallback(() => {
        if (result) return;
        setPaused((p) => !p);
    }, [result]);

    function restart() {
        setResult(null);
        setIsBestRecord(false);
        setError("");
        setPaused(false);
        setGameKey((k) => k + 1);
    }

    const executeNavigation = () => {
        if (pendingNav) navigate(pendingNav);
    };

    const isRunning = !result;

    return (
        <div className="container" style={{ marginTop: 0, paddingTop: 10 }}>
            {/* Top HUD Control Strip */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    gap: 12,
                }}
            >
                <h2 style={{ margin: 0, fontSize: 20 }}>Huling Kapsula — Survival</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="muted" style={{ fontSize: 13 }}>
                        WASD move • Spacebar shoot • Esc pause
                    </div>
                    <button className="secondary" onClick={() => setIsMuted(toggleMute())}>
                      {isMuted ? "🔇 Unmute" : "🔊 Mute"}
                    </button>
                    <button
                        className="secondary"
                        onClick={handleTogglePause}
                        disabled={!isRunning}
                        style={{ minWidth: 80, padding: "6px 14px", fontSize: 13 }}
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

                {/* In-Game Pause Menu */}
                {paused && isRunning && !pendingNav && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(7, 11, 16, 0.75)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 10,
                            zIndex: 10,
                            backdropFilter: "blur(2px)",
                        }}
                    >
                        <h1 style={{ fontSize: 44, color: "#4ec9b0", marginBottom: 10 }}>PAUSED</h1>
                        <p className="muted" style={{ marginBottom: 30 }}>Press Esc or click Resume</p>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={handleTogglePause}>Resume Game</button>
                            <button className="secondary" onClick={() => setPendingNav("/menu")}>Main Menu</button>
                            <button className="secondary" onClick={() => setPendingNav("/leaderboard")}>Leaderboard</button>
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {result && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(7, 11, 16, 0.88)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 10,
                            textAlign: "center",
                            padding: 24,
                            zIndex: 10,
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {isBestRecord && (
                            <div
                                style={{
                                    background: "rgba(78, 201, 176, 0.15)",
                                    border: "1px solid #4ec9b0",
                                    color: "#4ec9b0",
                                    padding: "4px 14px",
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    marginBottom: 12,
                                    textTransform: "uppercase",
                                }}
                            >
                                ★ New Personal Best! ★
                            </div>
                        )}
                        <h1 style={{ fontSize: 46, color: "#f85149", margin: "0 0 10px 0", letterSpacing: 2 }}>
                            INFECTED
                        </h1>
                        <p style={{ fontSize: 22, margin: "0 0 4px 0" }}>
                            Viral Entities Eliminated: <strong>{result.score}</strong>
                        </p>
                        <p className="muted" style={{ marginBottom: 18, fontSize: 16 }}>
                            Survival Duration: <strong>{result.survivalTime}s</strong>
                        </p>
                        {submitting && <p className="muted" style={{ fontSize: 13 }}>Syncing with central registry...</p>}
                        {error && <p className="error">{error}</p>}
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                            <button onClick={restart}>Redeploy Capsule</button>
                            <button className="secondary" onClick={() => navigate("/menu")}>
                                Return to Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!pendingNav}
                message="Are you sure you want to abort the mission? Your current run will be lost."
                onConfirm={executeNavigation}
                onCancel={() => setPendingNav(null)}
            />
        </div>
    );
}