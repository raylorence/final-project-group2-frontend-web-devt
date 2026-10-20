import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/menu" style={{ fontWeight: 700, fontSize: 16, color: "#4ec9b0" }}>
        🧬 Huling Kapsula
      </Link>
      <Link to="/leaderboard" style={{ fontSize: 14 }}>Leaderboard</Link>
      {user?.role === "admin" && <Link to="/admin" style={{ fontSize: 14 }}>Admin</Link>}
      
      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span className="muted" style={{ fontSize: 13 }}>Signed in as <strong>{user.username}</strong></span>
            <button
              className="secondary"
              style={{ padding: "6px 12px", fontSize: 13 }}
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
            <Link to="/login" style={{ fontSize: 14 }}>Login</Link>
            <Link to="/register" style={{ fontSize: 14 }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}