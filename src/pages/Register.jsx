import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Register Page Component
 * 
 * Allows new players to create an account in the MongoDB database.
 * Uses `register` caller from `authApi.js` which communicates with `POST /api/auth/register`.
 */
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle registration form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation checks
    if (username.trim().length < 3) {
      return setError("Username must be at least 3 characters");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      // Call backend registration endpoint via authApi service
      const response = await register(username.trim(), password);

      // Extract auth token & user profile from standardized or raw response
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user || {
        _id: response.data?._id || response._id,
        username: username.trim(),
        role: "player"
      };

      // Sign user into global auth context
      signIn(token, user);

      // Redirect player to main menu
      navigate("/menu");
    } catch (err) {
      // Display error message from server response or fallback
      setError(err.message || "Registration failed. Please try again.");
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
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={{ width: "100%" }}>
            Create capsule
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
