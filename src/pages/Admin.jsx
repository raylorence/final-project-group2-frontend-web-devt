import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getUsers, getAllScores, deleteUser, deleteScore } from "../api/adminApi.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  async function refresh() {
    try {
      const [userList, scoreList] = await Promise.all([
        getUsers(token),
        getAllScores(token),
      ]);
      setUsers(Array.isArray(userList) ? userList : userList?.data || []);
      setScores(Array.isArray(scoreList) ? scoreList : scoreList?.data || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Failed to load admin data");
    }
  }

  useEffect(() => {
    if (token) refresh();
  }, [token]);

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === "user") {
        await deleteUser(pendingAction.id, token);
      } else if (pendingAction.type === "score") {
        await deleteScore(pendingAction.id, token);
      }
      refresh();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setPendingAction(null);
    }
  };

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
                        <button
                            className="danger"
                            onClick={() => setPendingAction({
                              type: "user",
                              id: u._id,
                              message: `Permanently delete user "${u.username}" and all their recorded scores?`
                            })}
                        >
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
              <p className="muted">No scores recorded.</p>
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
                      <td style={{ padding: 10 }}>{s.player?.username || s.username || "unknown"}</td>
                      <td style={{ padding: 10, fontWeight: 700 }}>{s.totalScore ?? s.score ?? 0}</td>
                      <td style={{ padding: 10 }} className="muted">{s.survivalTime ?? 0}s</td>
                      <td style={{ padding: 10, textAlign: "right" }}>
                        <button
                            className="danger"
                            onClick={() => setPendingAction({
                              type: "score",
                              id: s._id,
                              message: `Delete score record (${s.totalScore ?? 0} kills) for ${s.player?.username || "this user"}?`
                            })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </div>

        <ConfirmModal
            isOpen={!!pendingAction}
            message={pendingAction?.message || "Are you sure?"}
            onConfirm={confirmPendingAction}
            onCancel={() => setPendingAction(null)}
        />
      </div>
  );
}