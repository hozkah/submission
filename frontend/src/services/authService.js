// API base URL - update this to match your backend URL
const API_URL = "http://localhost:5000/api";

/**
 * Encode user data to make it less readable
 * @param {Object} user - User object to encode
 * @returns {string} - Encoded user data
 */
const encodeUserData = (user) => {
  const userData = {
    id: user.id,
    role: user.role,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
    email: user.email,
    username: user.username
  };
  return btoa(JSON.stringify(userData));
};

/**
 * Decode user data
 * @param {string} encodedData - Encoded user data
 * @returns {Object|null} - Decoded user data or null if invalid
 */
const decodeUserData = (encodedData) => {
  try {
    return JSON.parse(atob(encodedData));
  } catch (error) {
    console.error('Error decoding user data:', error);
    return null;
  }
};

/**
 * Authentication service for handling login, signup, and token management
 */
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} role - User's role (manager or babysitter)
   * @returns {Promise} - Promise with user data and token
   */
  login: async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and encoded user data in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", encodeUserData(data.user));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with user data
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  /**
   * Logout user and clear stored data
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} - User object or null if not logged in
   */
  getCurrentUser: () => {
    const encodedUser = localStorage.getItem("user");
    return encodedUser ? decodeUserData(encodedUser) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is logged in
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Get authentication token
   * @returns {string|null} - Token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default authService;
