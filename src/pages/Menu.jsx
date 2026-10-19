import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyBest, getLeaderboard } from "../api/client.js";

export default function Menu() {
  const { user, token } = useAuth();
  const [best, setBest] = useState(0);
  const [top, setTop] = useState([]);

  useEffect(() => {
    if (!token) return;
    getMyBest(token).then(setBest).catch(() => {});
    getLeaderboard().then((rows) => setTop(rows.slice(0, 5))).catch(() => {});
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
          <p style={{ fontSize: 40, fontWeight: 700, color: "#4ec9b0" }}>{best}</p>
          <p className="muted">kills</p>
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
                {i + 1}. {s.username || "unknown"}
              </span>
              <strong>{s.score}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}