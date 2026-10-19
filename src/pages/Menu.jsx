import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyBest, getLeaderboard } from "../api/scoreApi.js";

export default function Menu() {
  const { user, token } = useAuth();
  const [bestStats, setBestStats] = useState({ kills: 0, survivalTime: 0 });
  const [top, setTop] = useState([]);

  useEffect(() => {
    // Fetch user's personal best record if logged in
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

    // Fetch global leaderboard from backend
    getLeaderboard()
        .then((rows) => {
          const scores = Array.isArray(rows) ? rows : (rows?.data || []);
          setTop(scores.slice(0, 5));
        })
        .catch(() => setTop([]));
  }, [token]);

  return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <h1>🧬 Huling Kapsula</h1>
          <p className="muted" style={{ marginBottom: 22 }}>
            You are the body's final line of defense. Survive the viral swarm.
          </p>
          <Link to="/play">
            <button style={{ fontSize: 18, padding: "14px 42px" }}>▶ Deploy Capsule</button>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card">
            <h3>Your Best</h3>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: "#4ec9b0", margin: 0 }}>
                {bestStats.kills}
              </p>
              <p className="muted" style={{ marginBottom: 14 }}>kills</p>

              <p style={{ fontSize: 24, fontWeight: 600, color: "#e6edf3", margin: 0 }}>
                {bestStats.survivalTime}s
              </p>
              <p className="muted" style={{ margin: 0 }}>survival time</p>
            </div>
          </div>

          <div className="card">
            <h3>Top 5</h3>
            {top.length === 0 && <p className="muted">No scores yet — be the first.</p>}
            {top.map((s, i) => (
                <div
                    key={s._id || i}
                    style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}
                >
              <span>
                {i + 1}. {s.player?.username || s.username || s.userId?.username || "unknown"}
              </span>
                  <span>
                <strong>{s.score ?? s.totalScore ?? 0}</strong>
                <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>
                  ({s.survivalTime ?? 0}s)
                </span>
              </span>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}