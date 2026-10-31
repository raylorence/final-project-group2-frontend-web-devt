import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/scoreApi.js";

const PAGE_SIZE = 10;

// Color and accent configuration for the Top 3 ranks
const TOP_RANK_STYLES = {
    1: {
        badge: "🥇 1ST",
        rankColor: "#ffd700", // Gold
        accentBorder: "3px solid #ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
    },
    2: {
        badge: "🥈 2ND",
        rankColor: "#d1d5db", // Silver
        accentBorder: "3px solid #9ca3af",
        bg: "rgba(209, 213, 219, 0.05)",
    },
    3: {
        badge: "🥉 3RD",
        rankColor: "#cd7f32", // Bronze
        accentBorder: "3px solid #cd7f32",
        bg: "rgba(205, 127, 50, 0.05)",
    },
};

export default function Leaderboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getLeaderboard()
            .then((data) => {
                const scores = Array.isArray(data) ? data : (data?.data || []);

                // 1. Sort by score descending, with survivalTime as the tie-breaker
                const sortedScores = [...scores].sort((a, b) => {
                    const scoreA = a.score ?? a.totalScore ?? 0;
                    const scoreB = b.score ?? b.totalScore ?? 0;

                    if (scoreB !== scoreA) {
                        return scoreB - scoreA;
                    }

                    // Tie-breaker: higher survival time takes the lead
                    const timeA = a.survivalTime ?? 0;
                    const timeB = b.survivalTime ?? 0;
                    return timeB - timeA;
                });

                // 2. Assign ranks based on sorted order
                const rankedScores = sortedScores.map((s, index) => ({
                    ...s,
                    rank: index + 1,
                }));

                setRows(rankedScores);
            })
            .catch((err) => {
                console.error("Failed to load leaderboard:", err);
                setRows([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const activePage = Math.min(currentPage, totalPages);
    const startIndex = (activePage - 1) * PAGE_SIZE;
    const currentRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="container">
            <div className="card">
                <div style={{ marginBottom: 16 }}>
                    <h2 style={{ margin: 0 }}>Global Leaderboard</h2>
                </div>

                {loading ? (
                    <p className="muted">Loading scores...</p>
                ) : rows.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <p className="muted">No scores recorded yet.</p>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid #30363d" }}>
                                <th style={{ padding: 10 }}>#</th>
                                <th style={{ padding: 10 }}>Player</th>
                                <th style={{ padding: 10 }}>Score</th>
                                <th style={{ padding: 10 }}>Survived</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentRows.map((r) => {
                                const isTopThree = r.rank <= 3;
                                const topStyle = TOP_RANK_STYLES[r.rank];

                                return (
                                    <tr
                                        key={r._id || r.rank}
                                        style={{
                                            borderBottom: "1px solid #21262d",
                                            borderLeft: isTopThree ? topStyle.accentBorder : "3px solid transparent",
                                            background: isTopThree ? topStyle.bg : "transparent",
                                            transition: "background 0.2s ease",
                                        }}
                                    >
                                        {/* Rank column */}
                                        <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                                            {isTopThree ? (
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "2px 8px",
                                                        borderRadius: 3,
                                                        background: "rgba(16, 18, 14, 0.8)",
                                                        border: `1px solid ${topStyle.rankColor}`,
                                                        color: topStyle.rankColor,
                                                        fontWeight: 800,
                                                        fontFamily: "var(--mono, monospace)",
                                                        fontSize: 11,
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                        {topStyle.badge}
                                                    </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        paddingLeft: 6,
                                                        color: "#4ec9b0",
                                                        fontWeight: 700,
                                                        fontFamily: "var(--mono, monospace)",
                                                    }}
                                                >
                                                        #{r.rank}
                                                    </span>
                                            )}
                                        </td>

                                        {/* Player name */}
                                        <td
                                            style={{
                                                padding: "12px 10px",
                                                fontWeight: isTopThree ? 700 : 500,
                                                color: isTopThree ? topStyle.rankColor : "inherit",
                                            }}
                                        >
                                            {r.player?.username || r.username || r.userId?.username || "unknown"}
                                        </td>

                                        {/* Score */}
                                        <td
                                            style={{
                                                padding: "12px 10px",
                                                fontWeight: 800,
                                                fontSize: isTopThree ? 15 : 13,
                                                color: isTopThree ? "var(--text, #e8e4d6)" : "inherit",
                                            }}
                                        >
                                            {r.score ?? r.totalScore ?? 0}
                                        </td>

                                        {/* Survived Duration */}
                                        <td style={{ padding: "12px 10px" }} className="muted">
                                            {r.survivalTime !== undefined && r.survivalTime !== null
                                                ? `${r.survivalTime}s`
                                                : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: 18,
                                    paddingTop: 10,
                                    borderTop: "1px solid #30363d",
                                }}
                            >
                                <button
                                    className="secondary"
                                    disabled={activePage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    style={{ padding: "6px 14px", fontSize: 12 }}
                                >
                                    Previous
                                </button>
                                <span className="muted" style={{ fontSize: 13 }}>
                                    Page {activePage} of {totalPages} ({rows.length} total)
                                </span>
                                <button
                                    className="secondary"
                                    disabled={activePage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    style={{ padding: "6px 14px", fontSize: 12 }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}