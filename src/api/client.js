const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Toggle this to true when your Express backend is running.
const USE_MOCK = true;

// ---------- Mock in-memory store (dev only) ----------
const mockUsers = [
  { _id: "u_admin", username: "admin", password: "admin123", role: "admin" },
];
const mockScores = [];
let mockTokenCounter = 0;

function mockToken(user) {
  mockTokenCounter++;
  return `mock.${user._id}.${mockTokenCounter}`;
}

function mockDecode(token) {
  if (!token) return null;
  const [, userId] = token.split(".");
  return mockUsers.find((u) => u._id === userId) || null;
}

// ---------- Auth ----------
export async function register(username, password) {
  if (USE_MOCK) {
    if (mockUsers.some((u) => u.username === username)) {
      throw new Error("Username already taken");
    }
    const user = {
      _id: `u_${Date.now()}`,
      username,
      password,
      role: "player",
    };
    mockUsers.push(user);
    return { token: mockToken(user), user: { _id: user._id, username, role: user.role } };
  }
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Registration failed");
  return res.json();
}

export async function login(username, password) {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.username === username && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return { token: mockToken(user), user: { _id: user._id, username, role: user.role } };
  }
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

// ---------- Scores ----------
export async function getLeaderboard() {
  if (USE_MOCK) {
    return [...mockScores].sort((a, b) => b.score - a.score).slice(0, 20);
  }
  const res = await fetch(`${BASE}/api/scores`);
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json();
}

export async function submitScore(token, score, survivalTime) {
  if (USE_MOCK) {
    const user = mockDecode(token);
    if (!user) throw new Error("Not authenticated");
    mockScores.push({
      _id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user._id,
      username: user.username,
      score,
      survivalTime,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
  const res = await fetch(`${BASE}/api/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score, survivalTime }),
  });
  if (!res.ok) throw new Error("Failed to submit score");
  return res.json();
}

export async function getMyBest(token) {
  if (USE_MOCK) {
    const user = mockDecode(token);
    if (!user) return 0;
    const mine = mockScores.filter((s) => s.userId === user._id);
    return mine.length ? Math.max(...mine.map((s) => s.score)) : 0;
  }
  const res = await fetch(`${BASE}/api/scores/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.best || 0;
}

// ---------- Admin ----------
export async function adminListUsers(token) {
  if (USE_MOCK) {
    return mockUsers.map(({ password, ...u }) => u);
  }
  const res = await fetch(`${BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function adminDeleteUser(token, userId) {
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u._id === userId);
    if (idx >= 0) mockUsers.splice(idx, 1);
    for (let i = mockScores.length - 1; i >= 0; i--) {
      if (mockScores[i].userId === userId) mockScores.splice(i, 1);
    }
    return { ok: true };
  }
  const res = await fetch(`${BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export async function adminDeleteScore(token, scoreId) {
  if (USE_MOCK) {
    const idx = mockScores.findIndex((s) => s._id === scoreId);
    if (idx >= 0) mockScores.splice(idx, 1);
    return { ok: true };
  }
  const res = await fetch(`${BASE}/api/admin/scores/${scoreId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete score");
  return res.json();
}