/**
 * API Client Bridge & Compatibility Layer
 * 
 * This file re-exports functions from the modular callers:
 * - `apiClient.js` (Token and HTTP requests)
 * - `authApi.js` (Authentication services)
 * - `scoreApi.js` (Score and Leaderboard services)
 * - `adminApi.js` (Admin management services)
 * 
 * You can import either from `src/api/client.js` or directly from `src/api/index.js` / individual modules.
 */

export * from './index.js';

// Re-export specific methods under original names for seamless backward-compatibility
export {
    register,
    login,
    logout
} from './authApi.js';

export {
    getLeaderboard,
    submitScore,
    getMyBest
} from './scoreApi.js';

export {
    getUsers as adminListUsers,
    deleteUser as adminDeleteUser,
    deleteScore as adminDeleteScore
} from './adminApi.js';
