import { createContext, useContext, useEffect, useState } from "react";
import {
  getToken,
  getStoredUser,
  setToken as saveToken,
  setStoredUser as saveStoredUser,
  setMemoryToken,
  setMemoryUser,
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
      const activeToken = getToken();
      const activeUser = getStoredUser();

// If stored user is an admin, wipe it immediately: admins cannot survive refresh
      if (activeUser && activeUser.role === "admin") {
        removeToken();
        removeStoredUser();
      } else if (activeToken && activeUser) {
        // Normal players survive refresh
        setToken(activeToken);
        setUser(activeUser);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
    } finally {
      setLoading(false);
    }

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

    if (userValue.role === "admin") {
      // Admins: strictly in-memory. Zero browser storage.
      // Refreshing the tab or closing the window completely dumps this state.
      removeToken();
      removeStoredUser();
      setMemoryToken(tokenValue);
      setMemoryUser(userValue);
    } else {
      // Regular players: persist across refreshes and restarts
      saveToken(tokenValue);
      saveStoredUser(userValue);
    }
  }

  /**
   * Clears state and wipes stored tokens across storage mechanisms
   */
  function signOut() {
    setToken(null);
    setUser(null);
    apiLogout();
    removeToken();
    removeStoredUser();
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
