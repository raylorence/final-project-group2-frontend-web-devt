/**
 * Admin Moderation API Service
 * 
 * Provides administrative endpoints for game moderation:
 * - `getUsers`: fetch all registered player accounts (Admin only)
 * - `deleteUser`: delete a player account and cascade delete all their match scores (Admin only)
 * - `deleteScore`: delete a specific illegitimate or cheated score (Admin only)
 */
import { apiRequest } from './apiClient.js';

/**
 * Fetch all registered users from MongoDB (Admin only)
 * @param {string} [token] - Optional explicit admin token override
 * @returns {Promise<Array<object>>} List of user accounts
 */
export const getUsers = async (token = null) => {
    const data = await apiRequest('/api/admin/users', {
        method: 'GET',
        requiresAuth: true,
        token
    });

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.users)) return data.users;
    return [];
};

export const getAllScores = async (token = null) => {
    const data = await apiRequest('/api/admin/scores', {
        method: 'GET',
        requiresAuth: true,
        token
    });
    return Array.isArray(data) ? data : (data?.data || []);
};


/**
 * Delete a user account and cascade delete all associated scores (Admin only)
 * @param {string} userId - MongoDB ID of user to delete
 * @param {string} [token] - Optional explicit admin token override
 * @returns {Promise<object>} Deletion confirmation response
 */
export const deleteUser = async (userId, token = null) => {
    return await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        requiresAuth: true,
        token
    });
};

/**
 * Delete a specific score record from leaderboard (Admin only)
 * @param {string} scoreId - MongoDB ID of score record to delete
 * @param {string} [token] - Optional explicit admin token override
 * @returns {Promise<object>} Deletion confirmation response
 */
export const deleteScore = async (scoreId, token = null) => {
    return await apiRequest(`/api/admin/scores/${scoreId}`, {
        method: 'DELETE',
        requiresAuth: true,
        token
    });
};

export default {
    getUsers,
    getAllScores,
    deleteUser,
    deleteScore
};
