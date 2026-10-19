/**
 * Frontend API SDK / Caller Helpers
 * Huling Kapsula Game
 * 
 * Central export point for all backend service callers:
 * - `apiClient`: Base HTTP request utility and token management
 * - `authApi`: User registration, login, and logout handlers
 * - `scoreApi`: Leaderboard fetch and score submission handlers
 * - `adminApi`: Administrative user and score deletion handlers
 */

import apiClient, {
    setBaseUrl,
    getBaseUrl,
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    apiRequest
} from './apiClient.js';

import authApi, {
    register,
    login,
    logout
} from './authApi.js';

import scoreApi, {
    getLeaderboard,
    submitScore,
    getMyBest
} from './scoreApi.js';

import adminApi, {
    getUsers,
    deleteUser,
    deleteScore
} from './adminApi.js';

/**
 * Health check endpoint
 * @returns {Promise<object>} Server health status
 */
export const checkHealth = async () => {
    return await apiRequest('/api/health', { method: 'GET' });
};

// Export individual modules & helpers
export {
    // Client & Token Management
    apiClient,
    setBaseUrl,
    getBaseUrl,
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    apiRequest,

    // Auth API
    authApi,
    register,
    login,
    logout,

    // Score & Leaderboard API
    scoreApi,
    getLeaderboard,
    submitScore,
    getMyBest,

    // Admin API
    adminApi,
    getUsers,
    deleteUser,
    deleteScore
};

// Default unified API object
export default {
    client: apiClient,
    auth: authApi,
    scores: scoreApi,
    admin: adminApi,
    checkHealth,
    setBaseUrl,
    getBaseUrl,
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    apiRequest,
    register,
    login,
    logout,
    getLeaderboard,
    submitScore,
    getMyBest,
    getUsers,
    deleteUser,
    deleteScore
};
