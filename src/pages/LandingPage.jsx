import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getLeaderboard } from "../api/scoreApi.js";
import "./LandingPage.css";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, loading, signOut } = useAuth();

    const [topPlayers, setTopPlayers] = useState([]);
    const [serverStatus, setServerStatus] = useState("WAITING FOR SERVER...");

    useEffect(() => {
            // Instantly pings the backend on load to wake up Render
            getLeaderboard()
                .then((data) => {
                    const scores = Array.isArray(data) ? data : (data?.data || []);
                    setTopPlayers(scores.slice(0, 3));
                    setServerStatus("SERVER ONLINE");
                })
                .catch(() => setServerStatus("SERVER UNREACHABLE"));
        }, []);
    const handleSwitchAccount = () => {
        signOut();
        navigate("/login");
    };

    return (
        <main className="hk-landing">
            <section className="hk-hero">
                <div className="hk-hero-content">
                    <p className="hk-system-label">
                        BIOLOGICAL CONTAINMENT SYSTEM // HK-01
                    </p>

                    <img
                        src="/huling-kapsula-logo.png"
                        alt="Huling Kapsula"
                        className="hk-logo-image"
                    />

                    <div className="hk-divider" />

                    <p className="hk-tagline">
                        THE BODY'S FINAL LINE OF DEFENSE.
                    </p>

                    <p className="hk-description">
                        An experimental antibiotic has been deployed
                        into a compromised immune system. Surrounded
                        by endless swarms of aggressive bacteria and
                        pathogens, your mission is simple: survive,
                        eliminate the threat, and beat your high score.
                    </p>

                    {/* Server Wake Status & Mini Leaderboard */}
                    <div style={{ marginTop: "24px", padding: "12px", border: "1px solid var(--hk-border)", background: "rgba(182, 185, 108, 0.05)", width: "min(350px, 100%)" }}>
                        <p style={{ margin: "0 0 10px", color: "var(--hk-green)", fontSize: "10px", letterSpacing: "1px", fontWeight: "bold" }}>
                            [ INTEL ] TOP AGENTS - {serverStatus}
                            </p>
                            {topPlayers.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {topPlayers.map((p, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "var(--hk-cream)", fontSize: "11px", fontFamily: "inherit" }}>
                                            <span>{i + 1}. {p.player?.username || p.username || p.userId?.username || "UNKNOWN"}</span>
                                            <span>{p.score ?? p.totalScore ?? 0} PTS</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: "var(--hk-muted)", fontSize: "10px" }}>Awaiting database connection...</p>
                            )}
                        </div>
                    <div className="hk-actions">
                        {!loading && user ? (
                            <>
                                <button
                                    className="hk-primary-btn"
                                    onClick={() =>
                                        navigate(
                                            user.role === "admin"
                                                ? "/admin"
                                                : "/menu"
                                        )
                                    }
                                >
                                    RESUME MISSION ({user.username})
                                </button>

                                <button
                                    className="hk-secondary-btn"
                                    onClick={() => navigate("/leaderboard")}
                                >
                                    VIEW INTEL / LEADERBOARD
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="hk-primary-btn"
                                    onClick={() => navigate("/register")}
                                >
                                    CREATE ACCOUNT
                                </button>

                                <button
                                    className="hk-secondary-btn"
                                    onClick={() => navigate("/login")}
                                >
                                    LOGIN
                                </button>
                            </>
                        )}
                    </div>

                    {!loading && user && (
                        <p className="hk-switch-account">
                            Not <strong>{user.username}</strong>?{" "}
                            <button
                                type="button"
                                className="hk-switch-link"
                                onClick={handleSwitchAccount}
                            >
                                Switch account / Log in
                            </button>
                        </p>
                    )}

                    <p className="hk-warning">
                        [ ALERT ] HOSTILE PATHOGENS DETECTED
                    </p>
                </div>

                <div className="hk-status">
                    <span>ZONE: COMPROMISED</span>
                    <span>MISSION: SURVIVE</span>
                    <span>THREAT LEVEL: CRITICAL</span>
                </div>
            </section>
        </main>
    );
}
