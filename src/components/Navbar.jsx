import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 24px",
        background: "#0d1117",
        borderBottom: "1px solid #30363d",
      }}
    >
      <Link to="/menu" style={{ fontWeight: 700, fontSize: 18, color: "#4ec9b0" }}>
        🧬 Huling Kapsula
      </Link>
      <Link to="/leaderboard">Leaderboard</Link>
      {user?.role === "admin" && <Link to="/admin">Admin</Link>}
      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span className="muted">Signed in as <strong>{user.username}</strong></span>
            <button
              className="secondary"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}