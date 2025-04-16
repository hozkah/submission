import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";
import axios from "axios";

// Create and export the authentication context
export const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

/**
 * Authentication provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authService.getToken();
        const currentUser = authService.getCurrentUser();

        if (token && currentUser) {
          // Set the basic user data immediately
          setUser(currentUser);

          try {
            // Then try to fetch full user data
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // Update with full user data if successful
            setUser(response.data);
          } catch (error) {
            console.error("Error fetching user details:", error);
            // Keep using the basic user data if fetch fails
            if (error.response?.status === 401) {
              // Token is invalid, clear everything
              authService.logout();
              setUser(null);
            }
          }
        } else {
          // No token or user data, ensure we're logged out
          authService.logout();
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Failed to load user data");
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Login result
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      // Set the full user data from the login response
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  const register = async (
    firstName,
    lastName,
    email,
    password,
    role,
    additionalData
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName,
        lastName,
        email,
        password,
        role,
        additionalData: {
          ...additionalData,
          nextOfKin: {
            name: additionalData.nextOfKin.name,
            phone: additionalData.nextOfKin.phone,
            relationship: additionalData.nextOfKin.relationship,
          },
        },
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("You have been logged out");
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
