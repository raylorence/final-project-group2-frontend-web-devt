import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await login(username.trim(), password);
      signIn(token, user);
      navigate(user.role === "admin" ? "/admin" : "/menu");
    } catch (err) {
      setError(err.message);
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
        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Dev admin: <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}