/**
 * Score & Leaderboard API Service
 * 
 * Provides methods for:
 * - `getLeaderboard`: fetching top ranked scores from MongoDB
 * - `submitScore`: saving a match result (score and survival time) upon Game Over
 * - `getMyBest`: retrieving the current authenticated user's personal best score
 */
import { apiRequest } from './apiClient.js';

/**
 * Fetch top leaderboard scores
 * @returns {Promise<Array<object>>} List of top leaderboard records
 */
export const getLeaderboard = async () => {
    const data = await apiRequest('/api/scores', {
        method: 'GET'
    });

    // Normalize response if backend returns an array or wrapped in { data: [...] } or { success: true, data: [...] }
    if (Array.isArray(data)) {
        return data;
    }
    if (data && Array.isArray(data.data)) {
        return data.data;
    }
    return data || [];
};

/**
 * Submit player match score upon Game Over (requires authentication)
 * 
 * Accepts flexible parameters:
 * - `submitScore(score, survivalTime, token)`
 * - `submitScore(totalScore, token)`
 * - `submitScore(token, score, survivalTime)`
 * 
 * @param {number|string} arg1 - Score or Token
 * @param {number|string} [arg2] - Survival time or Score or Token
 * @param {string|number} [arg3] - Token or Survival time
 * @returns {Promise<object>} Match submission response
 */
export const submitScore = async (arg1, arg2, arg3, kills = 0) => {
    let score = 0;
    let survivalTime = 0;
    let token = null;

    if (typeof arg1 === 'string' && typeof arg2 === 'number') {
        // Signature: (token, score, survivalTime)
        token = arg1;
        score = arg2;
        survivalTime = typeof arg3 === 'number' ? arg3 : 0;
    } else if (typeof arg1 === 'number') {
        score = arg1;
        if (typeof arg2 === 'number') {
            // Signature: (score, survivalTime, token)
            survivalTime = arg2;
            token = typeof arg3 === 'string' ? arg3 : null;
        } else if (typeof arg2 === 'string') {
            // Signature: (totalScore, token)
            token = arg2;
            survivalTime = typeof arg3 === 'number' ? arg3 : 0;
        }
    }

    // Sends both `score` and `totalScore` for maximum compatibility with backend controllers
    return await apiRequest('/api/scores', {
        method: 'POST',
        body: {
            score,
            totalScore: score,
            kills,
            survivalTime
        },
        requiresAuth: true,
        token
    });
};

/**
 * Retrieve the authenticated user's highest personal score
 * @param {string} [token] - Optional explicit auth token override
 * @returns {Promise<number>} Personal best score
 */
export const getMyBest = async (token = null) => {
    try {
        const data = await apiRequest('/api/scores/me', {
            method: 'GET',
            requiresAuth: true,
            token
        });

        if (typeof data === 'number') {
            return { best: data, survivalTime: 0 };
        }

        const scoreObj = data?.data || data || {};
        return {
            best: scoreObj.best ?? scoreObj.totalScore ?? scoreObj.score ?? 0,
            survivalTime: scoreObj.survivalTime ?? 0
        };
    } catch (err) {
        return { best: 0, survivalTime: 0 };
    }
};

export default {
    getLeaderboard,
    submitScore,
    getMyBest
};
