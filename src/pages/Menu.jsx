import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyBest, getLeaderboard } from "../api/scoreApi.js";

// Matching visual styling for Top 3
const TOP_RANK_STYLES = {
    1: {
        badge: "🥇 1ST",
        rankColor: "#ffd700",
        accentBorder: "3px solid #ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
    },
    2: {
        badge: "🥈 2ND",
        rankColor: "#d1d5db",
        accentBorder: "3px solid #9ca3af",
        bg: "rgba(209, 213, 219, 0.05)",
    },
    3: {
        badge: "🥉 3RD",
        rankColor: "#cd7f32",
        accentBorder: "3px solid #cd7f32",
        bg: "rgba(205, 127, 50, 0.05)",
    },
};

export default function Menu() {
    const { user, token } = useAuth();
    const [bestStats, setBestStats] = useState({ kills: 0, survivalTime: 0 });
    const [top, setTop] = useState([]);

    useEffect(() => {
        if (token) {
            getMyBest(token)
                .then((res) => {
                    setBestStats({
                        kills: res?.best ?? 0,
                        survivalTime: res?.survivalTime ?? 0,
                    });
                })
                .catch(() => setBestStats({ kills: 0, survivalTime: 0 }));
        }

        getLeaderboard()
            .then((rows) => {
                const scores = Array.isArray(rows) ? rows : (rows?.data || []);

                // Sort descending with survivalTime tie-breaker
                const sorted = [...scores].sort((a, b) => {
                    const scoreA = a.score ?? a.totalScore ?? 0;
                    const scoreB = b.score ?? b.totalScore ?? 0;
                    if (scoreB !== scoreA) return scoreB - scoreA;
                    return (b.survivalTime ?? 0) - (a.survivalTime ?? 0);
                });

                // Assign ranks and take top 5
                const rankedTop5 = sorted.slice(0, 5).map((s, idx) => ({
                    ...s,
                    rank: idx + 1,
                }));

                setTop(rankedTop5);
            })
            .catch(() => setTop([]));
    }, [token]);

    return (
        <div className="container">
            <div className="card" style={{ textAlign: "center" }}>
                    <img
    src="/huling-kapsula-logo.png"
    alt="Huling Kapsula"
    className="menu-logo"
/>
                <p className="muted" style={{ marginBottom: 22 }}>
                    You are the body's final line of defense. Survive the viral swarm.
                </p>
                {user?.role === "admin" ? (
                    <div>
                        <p style={{ color: "#f85149", marginBottom: 12 }}>
                            Admin accounts cannot play or submit scores. Use the Admin Dashboard to moderate users and scores.
                        </p>
                        <Link to="/admin">
                            <button style={{ fontSize: 18, padding: "14px 42px" }}>Open Admin Dashboard</button>
                        </Link>
                    </div>
                ) : (
                    <Link to="/play">
                        <button style={{ fontSize: 18, padding: "14px 42px" }}>Deploy Capsule</button>
                    </Link>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Your Personal Best */}
                <div className="card">
                    <h3>Your Best</h3>
                    <div style={{ marginTop: 12 }}>
                        <p style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>
                            {bestStats.kills}
                        </p>
                        <p className="muted" style={{ marginBottom: 14 }}>Score</p>
                        <p style={{ fontSize: 36, fontWeight: 600, margin: 0 }}>
                            {bestStats.survivalTime}s
                        </p>
                        <p className="muted" style={{ marginTop: -12 }}>Survival Time</p>
                    </div>
                </div>

                {/* Top 5 Survivors with Leaderboard Design */}
                <div className="card">
                    <h3>Top 5</h3>

                    {top.length === 0 ? (
                        <p className="muted">No scores yet — be the first.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 10 }}>
                            <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid #30363d" }}>
                                <th style={{ padding: "8px 6px" }}>#</th>
                                <th style={{ padding: "8px 6px" }}>Player</th>
                                <th style={{ padding: "8px 6px" }}>Score</th>
                                <th style={{ padding: "8px 6px" }}>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {top.map((s) => {
                                const isTopThree = s.rank <= 3;
                                const topStyle = TOP_RANK_STYLES[s.rank];

                                return (
                                    <tr
                                        key={s._id || s.rank}
                                        style={{
                                            borderBottom: "1px solid #21262d",
                                            borderLeft: isTopThree ? topStyle.accentBorder : "3px solid transparent",
                                            background: isTopThree ? topStyle.bg : "transparent",
                                        }}
                                    >
                                        <td style={{ padding: "8px 6px", verticalAlign: "middle" }}>
                                            {isTopThree ? (
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "1px 6px",
                                                        borderRadius: 3,
                                                        background: "rgba(16, 18, 14, 0.8)",
                                                        border: `1px solid ${topStyle.rankColor}`,
                                                        color: topStyle.rankColor,
                                                        fontWeight: 800,
                                                        fontFamily: "var(--mono, monospace)",
                                                        fontSize: 10,
                                                    }}
                                                >
                                                        {topStyle.badge}
                                                    </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        paddingLeft: 4,
                                                        color: "#4ec9b0",
                                                        fontWeight: 700,
                                                        fontFamily: "var(--mono, monospace)",
                                                    }}
                                                >
                                                        #{s.rank}
                                                    </span>
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding: "8px 6px",
                                                fontWeight: isTopThree ? 700 : 500,
                                                color: isTopThree ? topStyle.rankColor : "inherit",
                                            }}
                                        >
                                            {s.player?.username || s.username || s.userId?.username || "unknown"}
                                        </td>

                                        <td
                                            style={{
                                                padding: "8px 6px",
                                                fontWeight: 800,
                                                color: isTopThree ? "var(--text, #e8e4d6)" : "inherit",
                                            }}
                                        >
                                            {s.score ?? s.totalScore ?? 0}
                                        </td>

                                        <td style={{ padding: "8px 6px" }} className="muted">
                                            {s.survivalTime ?? 0}s
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}