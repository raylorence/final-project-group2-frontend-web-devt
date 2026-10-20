import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getUsers, getAllScores, deleteUser, deleteScore } from "../api/adminApi.js";

/**
 * Admin Dashboard Component
 * 
 * Provides administrator moderation capabilities:
 * - View registered player profiles (`getUsers` -> `GET /api/admin/users`)
 * - View all submitted match scores on the leaderboard (`getLeaderboard` -> `GET /api/scores`)
 * - Permanently delete player account and cascade delete scores (`deleteUser` -> `DELETE /api/admin/users/:userId`)
 * - Delete illegitimate or cheated score records (`deleteScore` -> `DELETE /api/admin/scores/:scoreId`)
 */
export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");

  /**
   * Refresh users and leaderboard scores from MongoDB
   */
  async function refresh() {
    try {
      const [userList, scoreList] = await Promise.all([
        getUsers(token),
        getAllScores(token) // Uses the unlimited admin score fetcher
      ]);

      const parsedUsers = Array.isArray(userList) ? userList : (userList?.data || userList?.users || []);
      const parsedScores = Array.isArray(scoreList) ? scoreList : (scoreList?.data || []);

      setUsers(parsedUsers);
      setScores(parsedScores);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Failed to load admin data");
    }
  }

  useEffect(() => {
    if (token) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Delete a player account and cascade remove their associated scores
   */
  async function handleDeleteUser(id) {
    if (!window.confirm("Permanently delete this user and all their scores?")) return;
    try {
      await deleteUser(id, token);
      refresh();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  }

  /**
   * Delete a specific score from the leaderboard
   */
  async function handleDeleteScore(id) {
    if (!window.confirm("Delete this score entry?")) return;
    try {
      await deleteScore(id, token);
      refresh();
    } catch (err) {
      setError(err.message || "Failed to delete score");
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
                  <td style={{ padding: 10 }}>{s.player?.username || s.username || s.userId?.username || "—"}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>{s.score ?? s.totalScore ?? 0}</td>
                  <td style={{ padding: 10 }} className="muted">
                    {s.survivalTime !== undefined && s.survivalTime !== null ? `${s.survivalTime}s` : "—"}
                  </td>
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
