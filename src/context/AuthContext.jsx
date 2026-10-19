import { createContext, useContext, useEffect, useState } from "react";
import {
  getToken,
  getStoredUser,
  setToken as saveToken,
  setStoredUser as saveStoredUser,
  removeToken,
  removeStoredUser,
} from "../api/apiClient.js";
import { logout as apiLogout } from "../api/authApi.js";

/**
 * Authentication Context
 * 
 * Provides global state and methods for:
 * - Active authenticated user profile (`user`)
 * - JWT authorization token (`token`)
 * - Loading status during initial session hydration (`loading`)
 * - `signIn`: stores credentials in React state & browser storage
 * - `signOut`: clears authentication state from React state & browser storage
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and hydrate authentication state on initial page load
  useEffect(() => {
    try {
      // 1. Try reading token and user directly from API client storage helper
      const existingToken = getToken();
      const existingUser = getStoredUser();

      if (existingToken && existingUser) {
        setToken(existingToken);
        setUser(existingUser);
      } else {
        // Fallback: check legacy session storage if present
        const savedSession = sessionStorage.getItem("hk_session");
        if (savedSession) {
          const { token: t, user: u } = JSON.parse(savedSession);
          if (t && u) {
            setToken(t);
            setUser(u);
            saveToken(t);
            saveStoredUser(u);
          }
        }
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
    } finally {
      setLoading(false);
    }

    // Listen for unauthorized 401 events (e.g. user deleted / token invalid)
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:unauthorized", handleUnauthorized);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      }
    };
  }, []);

  /**
   * Updates state and persists JWT token and user profile
   * @param {string} tokenValue - JWT token received from backend
   * @param {object} userValue - User profile (id, username, role)
   */
  function signIn(tokenValue, userValue) {
    setToken(tokenValue);
    setUser(userValue);

    // Save to persistent storage using API client helpers
    saveToken(tokenValue);
    saveStoredUser(userValue);

    // Also keep sessionStorage updated for legacy compatibility
    sessionStorage.setItem("hk_session", JSON.stringify({ token: tokenValue, user: userValue }));
  }

  /**
   * Clears state and wipes stored tokens across storage mechanisms
   */
  function signOut() {
    setToken(null);
    setUser(null);

    // Call API caller logout method to clear stored tokens
    apiLogout();
    removeToken();
    removeStoredUser();
    sessionStorage.removeItem("hk_session");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 */
export function useAuth() {
  return useContext(AuthContext);
}
