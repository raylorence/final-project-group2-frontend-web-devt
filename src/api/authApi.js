/**
 * Authentication API Service
 * 
 * Provides methods for player and administrator account operations:
 * - `register`: creates a new user in MongoDB and auto-saves the returned auth token and profile.
 * - `login`: validates user credentials with the backend, returning and saving JWT session.
 * - `logout`: clears cached authentication state and tokens from browser storage.
 */
import { apiRequest, setToken, setStoredUser, removeToken, removeStoredUser } from './apiClient.js';

/**
 * Helper to normalize and persist authentication payload from backend response
 * @param {object} res - Response from backend auth endpoint
 * @returns {object} Normalized auth object containing { token, user, raw }
 */
const handleAuthResponse = (res) => {
    if (!res) return { token: null, user: null };

    // Extract token from either { token, user } or { success, data: { token, user } } or { data: { token } }
    const token = res.token || (res.data && res.data.token) || null;
    
    // Extract user profile object
    let user = res.user || (res.data && res.data.user) || (res.data && res.data.username ? res.data : null);
    
    // If user object contains token field inside data, omit token from user object
    if (user && user.token && !user.user) {
        const { token: _t, ...userWithoutToken } = user;
        user = userWithoutToken;
    }

    if (token) {
        setToken(token);
    }
    if (user) {
        setStoredUser(user);
    }

    return {
        token,
        user,
        ...res
    };
};

/**
 * Register a new player or admin user
 * @param {string} username - Chosen player username
 * @param {string} password - Account password
 * @param {string} [role='player'] - Account role ('player' or 'admin')
 * @returns {Promise<object>} Auth payload with token & user details
 */
export const register = async (username, password, role = 'player') => {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { username, password, role }
    });

    return handleAuthResponse(data);
};

/**
 * Authenticate existing player or admin user
 * @param {string} username - Player username
 * @param {string} password - Account password
 * @returns {Promise<object>} Auth payload with token & user details
 */
export const login = async (username, password) => {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { username, password }
    });

    return handleAuthResponse(data);
};

/**
 * Logout current user (clears local token & stored user data)
 */
export const logout = () => {
    removeToken();
    removeStoredUser();
};

export default {
    register,
    login,
    logout
};
