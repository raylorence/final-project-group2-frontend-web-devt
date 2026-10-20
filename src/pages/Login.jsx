import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(username.trim(), password);
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user || {
        _id: response.data?._id || response._id,
        username: username.trim(),
        role: response.data?.role || response.role || "player"
      };
      signIn(token, user);
      navigate(user.role === "admin" ? "/admin" : "/menu");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="auth-wrapper">
        <div className="card">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />
            <button type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Connecting to host..." : "Enter the body"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: 14 }}>
            No account? <Link to="/register">Register</Link>
          </p>
          {import.meta.env.DEV && (
              <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                Dev admin: <code>admin</code> / <code>admin123</code>
              </p>
          )}
        </div>
      </div>
  );
}