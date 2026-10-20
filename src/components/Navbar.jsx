import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

export default function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        signOut();
        navigate("/login");
    };

    // Reclaim full vertical viewport on the gameplay screen
    if (location.pathname === "/play") {
        return null;
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/menu" style={{ fontWeight: 700, fontSize: 16, color: "#4ec9b0" }}>
                    Huling Kapsula
                </Link>
                <Link to="/leaderboard" style={{ fontSize: 14 }}>Leaderboard</Link>
                {user?.role === "admin" && <Link to="/admin" style={{ fontSize: 14 }}>Admin</Link>}

                <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
                    {user ? (
                        <>
              <span className="muted" style={{ fontSize: 13 }}>
                Signed in as <strong>{user.username}</strong>
              </span>
                            <button
                                className="secondary"
                                style={{ padding: "6px 12px", fontSize: 13 }}
                                onClick={() => setShowLogoutModal(true)}
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

            <ConfirmModal
                isOpen={showLogoutModal}
                message="Are you sure you want to disconnect your session?"
                onConfirm={handleConfirmLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </>
    );
}