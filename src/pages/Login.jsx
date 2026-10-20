import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Login Page Component
 * 
 * Authenticates players or administrators against the MongoDB backend.
 * Uses `login` caller from `authApi.js` which sends credentials to `POST /api/auth/login`.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle login form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // Call backend login endpoint via authApi service
      const response = await login(username.trim(), password);

      // Extract token and user object
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user || {
        _id: response.data?._id || response._id,
        username: username.trim(),
        role: response.data?.role || response.role || "player"
      };

      // Store in auth context
      signIn(token, user);

      // Navigate based on user role (Admins go to dashboard, players go to main menu)
      navigate(user.role === "admin" ? "/admin" : "/menu");
    } catch (err) {
      // Display error message from server
      setError(err.message || "Invalid credentials. Please try again.");
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
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={{ width: "100%" }}>
            Enter the body
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
