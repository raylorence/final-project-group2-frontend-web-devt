import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/client.js";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Global Leaderboard</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">No scores submitted yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #30363d" }}>
                <th style={{ padding: 10 }}>#</th>
                <th style={{ padding: 10 }}>Player</th>
                <th style={{ padding: 10 }}>Kills</th>
                <th style={{ padding: 10 }}>Survived</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id || i} style={{ borderBottom: "1px solid #21262d" }}>
                  <td style={{ padding: 10, color: "#4ec9b0", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: 10 }}>{r.username || r.userId?.username || "unknown"}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>{r.score}</td>
                  <td style={{ padding: 10 }} className="muted">
                    {r.survivalTime ?? "—"}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}