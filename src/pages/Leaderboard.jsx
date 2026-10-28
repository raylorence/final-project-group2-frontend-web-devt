import { useEffect, useState, useMemo } from "react";
import { getLeaderboard } from "../api/scoreApi.js";

const PAGE_SIZE = 10;

export default function Leaderboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getLeaderboard()
            .then((data) => {
                const scores = Array.isArray(data) ? data : (data?.data || []);
                // Preserve original ranking position
                const rankedScores = scores.map((s, index) => ({
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

    // Filter rows by username
    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return rows;
        const q = searchQuery.toLowerCase().trim();
        return rows.filter((r) => {
            const name = (r.player?.username || r.username || r.userId?.username || "").toLowerCase();
            return name.includes(q);
        });
    }, [rows, searchQuery]);

    // Reset to page 1 whenever the search filter changes
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const activePage = Math.min(currentPage, totalPages);
    const startIndex = (activePage - 1) * PAGE_SIZE;
    const currentRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="container">
            <div className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                    }}
                >
                    <h2 style={{ margin: 0 }}>Global Leaderboard</h2>
                    <input
                        type="text"
                        placeholder="Search player username..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            maxWidth: 260,
                            margin: 0,
                            padding: "8px 12px",
                            fontSize: 13,
                        }}
                    />
                </div>

                {loading ? (
                    <p className="muted">Loading scores...</p>
                ) : filteredRows.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px 0" }}>
                            <p className="muted">
                                {searchQuery ? `No players found matching "${searchQuery}".` : "No scores recorded yet."}
                            </p>
                            {searchQuery && (
                                <button className="secondary" onClick={() => setSearchQuery("")} style={{ marginTop: 8 }}>
                                    Clear Search
                                </button>
                            )}
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
                            {currentRows.map((r) => (
                                <tr key={r._id || r.rank} style={{ borderBottom: "1px solid #21262d" }}>
                                    <td style={{ padding: 10, color: "#4ec9b0", fontWeight: 700 }}>
                                        {r.rank}
                                    </td>
                                    <td style={{ padding: 10 }}>
                                        {r.player?.username || r.username || r.userId?.username || "unknown"}
                                    </td>
                                    <td style={{ padding: 10, fontWeight: 700 }}>
                                        {r.score ?? r.totalScore ?? 0}
                                    </td>
                                    <td style={{ padding: 10 }} className="muted">
                                        {r.survivalTime !== undefined && r.survivalTime !== null
                                            ? `${r.survivalTime}s`
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
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
                  Page {activePage} of {totalPages} ({filteredRows.length} total)
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