import authService from "./authService";

/**
 * API interceptor to add authentication token to requests
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
const apiRequest = async (url, options = {}) => {
  // Get the token from auth service
  const token = authService.getToken();

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request with updated headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized responses (token expired or invalid)
  if (response.status === 401) {
    // Clear auth data and redirect to login
    authService.logout();
    window.location.href = "/login";
    return Promise.reject(new Error("Session expired. Please log in again."));
  }

  return response;
};

export default apiRequest;
