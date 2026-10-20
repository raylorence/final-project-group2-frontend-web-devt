import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      return setError("Username must be at least 3 characters");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const response = await register(username.trim(), password);
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user || {
        _id: response.data?._id || response._id,
        username: username.trim(),
        role: "player"
      };
      signIn(token, user);
      navigate("/menu");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="auth-wrapper">
        <div className="card">
          <h2>Register</h2>
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
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />
            <button type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Deploying agent..." : "Create capsule"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: 14 }}>
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
  );
}