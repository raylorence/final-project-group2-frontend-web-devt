/**
 * Frontend API Configuration and Base Fetch Utility
 * 
 * This module manages:
 * 1. Base URL configuration (from Vite environment or fallback to localhost:5000)
 * 2. Token storage (persisted in localStorage with in-memory fallback)
 * 3. User session storage (persisted in localStorage with in-memory fallback)
 * 4. Generic `apiRequest` helper that automatically injects JWT Authorization headers,
 *    handles JSON serialization/deserialization, and formats error responses.
 */

const getInitialBaseUrl = () => {
    // Check Vite environment variable first (VITE_API_URL)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Check Node/process environment variable if available
    if (typeof process !== 'undefined' && process.env && (process.env.VITE_API_URL || process.env.API_BASE_URL)) {
        return process.env.VITE_API_URL || process.env.API_BASE_URL;
    }
    // Default fallback to local Express server
    return 'http://localhost:5000';
};

const API_CONFIG = {
    BASE_URL: getInitialBaseUrl(),
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'auth_user'
};

/**
 * Configure API Base URL dynamically at runtime
 * @param {string} url - Base URL of the backend (e.g. 'http://localhost:5000')
 */
export const setBaseUrl = (url) => {
    API_CONFIG.BASE_URL = url.replace(/\/+$/, '');
};

/**
 * Get current API Base URL
 * @returns {string} The active backend base URL
 */
export const getBaseUrl = () => {
    return API_CONFIG.BASE_URL;
};

/**
 * Get stored token from localStorage or in-memory fallback
 * @returns {string|null} The stored JWT token or null if unauthenticated
 */
export const getToken = () => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    }
    return API_CONFIG._token || null;
};

/**
 * Store auth token in localStorage and memory cache
 * @param {string} token - JWT token string
 */
export const setToken = (token) => {
    if (token) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
        }
        API_CONFIG._token = token;
    } else {
        removeToken();
    }
};

/**
 * Remove stored auth token on logout
 */
export const removeToken = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    }
    delete API_CONFIG._token;
};

/**
 * Get current stored user info from localStorage
 * @returns {object|null} Parsed user profile object or null
 */
export const getStoredUser = () => {
    if (typeof localStorage !== 'undefined') {
        const user = localStorage.getItem(API_CONFIG.USER_KEY);
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }
    return API_CONFIG._user || null;
};

/**
 * Store user info in localStorage
 * @param {object} user - User profile object (e.g. { _id, username, role })
 */
export const setStoredUser = (user) => {
    if (user) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
        }
        API_CONFIG._user = user;
    } else {
        removeStoredUser();
    }
};

/**
 * Remove stored user info on logout
 */
export const removeStoredUser = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(API_CONFIG.USER_KEY);
    }
    delete API_CONFIG._user;
};

/**
 * Generic API request wrapper around native `fetch`
 * Automatically handles:
 * - Base URL resolution
 * - Content-Type headers
 * - JWT Authorization header insertion (if authenticated or token provided)
 * - JSON body serialization
 * - Unified HTTP error parsing
 * 
 * @param {string} endpoint - API endpoint path (e.g. '/api/auth/login')
 * @param {object} options - Fetch options (method, headers, body, requiresAuth, token, etc.)
 * @returns {Promise<any>} Parsed response data from server
 */
export const apiRequest = async (endpoint, options = {}) => {
    const {
        method = 'GET',
        body,
        headers = {},
        requiresAuth = false,
        token = null,
        ...customConfig
    } = options;

    const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // Attach Bearer token if explicitly provided or required from local storage
    const authToken = token || (requiresAuth ? getToken() : null);
    if (authToken) {
        requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const config = {
        method,
        headers: requestHeaders,
        ...customConfig
    };

    // Serialize request body to JSON if an object or array is provided
    if (body !== undefined && body !== null) {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Construct full URL
    const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? endpoint
        : `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
        const response = await fetch(url, config);
        
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // Handle non-2xx HTTP responses gracefully
        if (!response.ok) {
            const errorMessage = (responseData && responseData.message)
                || (responseData && typeof responseData === 'string' ? responseData : null)
                || `Request failed with status ${response.status}`;
                
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        throw error;
    }
};

export default {
    API_CONFIG,
    setBaseUrl,
    getBaseUrl,
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    apiRequest
};
