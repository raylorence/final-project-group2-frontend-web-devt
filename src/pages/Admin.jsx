import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  adminListUsers,
  adminDeleteUser,
  adminDeleteScore,
  getLeaderboard,
} from "../api/client.js";

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [u, s] = await Promise.all([adminListUsers(token), getLeaderboard()]);
      setUsers(u);
      setScores(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDeleteUser(id) {
    if (!window.confirm("Permanently delete this user and all their scores?")) return;
    try {
      await adminDeleteUser(token, id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteScore(id) {
    if (!window.confirm("Delete this score entry?")) return;
    try {
      await adminDeleteScore(token, id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Players ({users.length})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #30363d" }}>
              <th style={{ padding: 10 }}>Username</th>
              <th style={{ padding: 10 }}>Role</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #21262d" }}>
                <td style={{ padding: 10 }}>{u.username}</td>
                <td style={{ padding: 10 }} className="muted">{u.role}</td>
                <td style={{ padding: 10, textAlign: "right" }}>
                  {u.role !== "admin" && (
                    <button className="danger" onClick={() => handleDeleteUser(u._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Scores ({scores.length})</h3>
        {scores.length === 0 ? (
          <p className="muted">No scores.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #30363d" }}>
                <th style={{ padding: 10 }}>Player</th>
                <th style={{ padding: 10 }}>Kills</th>
                <th style={{ padding: 10 }}>Survived</th>
                <th style={{ padding: 10 }}></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s._id} style={{ borderBottom: "1px solid #21262d" }}>
                  <td style={{ padding: 10 }}>{s.username || s.userId?.username || "—"}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>{s.score}</td>
                  <td style={{ padding: 10 }} className="muted">{s.survivalTime ?? "—"}s</td>
                  <td style={{ padding: 10, textAlign: "right" }}>
                    <button className="danger" onClick={() => handleDeleteScore(s._id)}>
                      Delete
                    </button>
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