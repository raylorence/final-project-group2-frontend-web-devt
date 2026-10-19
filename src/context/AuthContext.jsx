import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("hk_session");
    if (saved) {
      const { token: t, user: u } = JSON.parse(saved);
      setToken(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  function signIn(tokenValue, userValue) {
    setToken(tokenValue);
    setUser(userValue);
    sessionStorage.setItem("hk_session", JSON.stringify({ token: tokenValue, user: userValue }));
  }

  function signOut() {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("hk_session");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}