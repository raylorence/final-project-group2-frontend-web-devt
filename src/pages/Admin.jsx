import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getUsers, getAllScores, deleteUser, deleteScore } from "../api/adminApi.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  // Search input states
  const [userSearch, setUserSearch] = useState("");
  const [scoreSearch, setScoreSearch] = useState("");

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

  // Exclude admin accounts so only non-admin players appear in the list
  const playerUsers = useMemo(() => {
    return users.filter((u) => u.role !== "admin");
  }, [users]);

  // Real-time filtered players list
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return playerUsers;
    const q = userSearch.toLowerCase().trim();
    return playerUsers.filter((u) => u.username?.toLowerCase().includes(q));
  }, [playerUsers, userSearch]);

  // Real-time filtered scores list
  const filteredScores = useMemo(() => {
    if (!scoreSearch.trim()) return scores;
    const q = scoreSearch.toLowerCase().trim();
    return scores.filter((s) => {
      const name = (s.player?.username || s.username || "").toLowerCase();
      return name.includes(q);
    });
  }, [scores, scoreSearch]);

  return (
      <div className="container">
        <h2>Admin Dashboard</h2>
        {error && <p className="error">{error}</p>}

        {/* Players Moderation Card */}
        <div className="card">
          <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 14,
              }}
          >
            <h3 style={{ margin: 0 }}>
              Players ({filteredUsers.length}
              {userSearch ? ` / ${playerUsers.length}` : ""})
            </h3>
            <input
                type="text"
                placeholder="Search players..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  maxWidth: 240,
                  margin: 0,
                  padding: "7px 12px",
                  fontSize: 13,
                }}
            />
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {filteredUsers.length === 0 ? (
                <p className="muted">
                  {userSearch ? `No players found matching "${userSearch}".` : "No registered players found."}
                </p>
            ) : (
                <table className="selectable-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                  <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #30363d",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "var(--panel, #1a1c15)",
                      }}
                  >
                    <th style={{ padding: 10 }}>Username</th>
                    <th style={{ padding: 10 }}>Role</th>
                    <th style={{ padding: 10 }}></th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredUsers.map((u) => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #21262d" }}>
                        <td style={{ padding: 10 }}>{u.username}</td>
                        <td style={{ padding: 10 }} className="muted">{u.role}</td>
                        <td style={{ padding: 10, textAlign: "right" }}>
                          <button
                              className="danger"
                              onClick={() =>
                                  setPendingAction({
                                    type: "user",
                                    id: u._id,
                                    message: `Permanently delete player "${u.username}" and all their recorded scores?`,
                                  })
                              }
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
        </div>

        {/* Scores Moderation Card */}
        <div className="card">
          <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 14,
              }}
          >
            <h3 style={{ margin: 0 }}>
              Scores ({filteredScores.length}
              {scoreSearch ? ` / ${scores.length}` : ""})
            </h3>
            <input
                type="text"
                placeholder="Search score records..."
                value={scoreSearch}
                onChange={(e) => setScoreSearch(e.target.value)}
                style={{
                  maxWidth: 240,
                  margin: 0,
                  padding: "7px 12px",
                  fontSize: 13,
                }}
            />
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {filteredScores.length === 0 ? (
                <p className="muted">
                  {scoreSearch ? `No scores found matching "${scoreSearch}".` : "No scores recorded."}
                </p>
            ) : (
                <table className="selectable-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                  <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #30363d",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "var(--panel, #1a1c15)",
                      }}
                  >
                    <th style={{ padding: 10 }}>Player</th>
                    <th style={{ padding: 10 }}>Kills</th>
                    <th style={{ padding: 10 }}>Survived</th>
                    <th style={{ padding: 10 }}></th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredScores.map((s) => (
                      <tr key={s._id} style={{ borderBottom: "1px solid #21262d" }}>
                        <td style={{ padding: 10 }}>
                          {s.player?.username || s.username || "unknown"}
                        </td>
                        <td style={{ padding: 10, fontWeight: 700 }}>
                          {s.totalScore ?? s.score ?? 0}
                        </td>
                        <td style={{ padding: 10 }} className="muted">
                          {s.survivalTime ?? 0}s
                        </td>
                        <td style={{ padding: 10, textAlign: "right" }}>
                          <button
                              className="danger"
                              onClick={() =>
                                  setPendingAction({
                                    type: "score",
                                    id: s._id,
                                    message: `Delete score record (${s.totalScore ?? 0} kills) for ${
                                        s.player?.username || "this user"
                                    }?`,
                                  })
                              }
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