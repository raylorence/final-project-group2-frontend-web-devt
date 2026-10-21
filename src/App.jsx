
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { checkHealth } from "./api/index.js";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Menu from "./pages/Menu.jsx";
import Game from "./pages/Game.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Admin from "./pages/Admin.jsx";
import LandingPage from "./pages/LandingPage.jsx";

function Protected({ children, adminOnly = false, playerOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: 40 }}>
        Loading session...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/menu" replace />;
  if (playerOnly && user.role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    checkHealth().catch(() => {});
  }, []);

  return (
    <>
      {!isLandingPage && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Protected><Menu /></Protected>} />
        <Route path="/play" element={<Protected playerOnly><Game /></Protected>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
