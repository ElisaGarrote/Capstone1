/**
 * Utility functions for working with JWT authentication tokens
 * Matches TTS/BMS frontend pattern for centralized auth integration
 */

/**
 * Check if access token exists in local storage or cookies
 * @returns {boolean} True if access token exists
 */
export const hasAccessToken = () => {
  // Check localStorage first (using same key as TTS/BMS)
  if (localStorage.getItem("accessToken")) {
    return true;
  }

  // Fall back to checking cookies
  return !!(getCookie("access_token") || getCookie("accessToken"));
};

/**
 * Get access token from local storage or cookies
 * @returns {string|null} The access token or null if not found
 */
export const getAccessToken = () => {
  // First try to get token from localStorage
  const localToken = localStorage.getItem("accessToken");
  if (localToken) {
    return localToken;
  }

  // Fall back to cookies if not in localStorage
  return getAccessTokenFromCookie();
};

/**
 * Get a cookie value by name (safe regex, decoded)
 * @param {string} name
 * @returns {string|null}
 */
export const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
  const regex = new RegExp("(?:^|; )" + escapedName + "=([^;]*)");
  const match = document.cookie.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Convenience accessor specifically for the `access_token` cookie
 * Tries both `access_token` and legacy `accessToken` cookie names
 * @returns {string|null}
 */
export const getAccessTokenFromCookie = () => {
  return getCookie("access_token") || getCookie("accessToken") || null;
};

/**
 * Set access token in local storage
 * @param {string} token - The access token to store
 */
export const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
};

/**
 * Remove access token from local storage and cookies (if possible)
 */
export const removeAccessToken = () => {
  // Remove from localStorage
  localStorage.removeItem("accessToken");

  // Also remove legacy keys for backwards compatibility
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user");

  // Try to expire the cookie
  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

/**
 * Parse the JWT token to extract payload data
 * @param {string} token - JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    // Get the payload part of the JWT (second part)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

/**
 * Check if user has a specific role for a specific system
 * @param {object} user - User object with roles array
 * @param {string} system - System name to check (e.g., 'ams', 'tts', 'bms')
 * @param {string} roleName - Role name to check (e.g., 'Admin', 'Operator')
 * @returns {boolean} True if user has the role for the system
 */
export const hasSystemRole = (user, system, roleName) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  return user.roles.some(
    (role) =>
      role.system?.toLowerCase() === system?.toLowerCase() &&
      role.role?.toLowerCase() === roleName?.toLowerCase()
  );
};

/**
 * Check if user has any role for a specific system
 * @param {object} user - User object with roles array
 * @param {string} system - System name to check
 * @returns {boolean} True if user has any role for the system
 */
export const hasAnySystemRole = (user, system) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  return user.roles.some(
    (role) => role.system?.toLowerCase() === system?.toLowerCase()
  );
};

/**
 * Get user information from the JWT token
 * @returns {object|null} User information or null if no valid token
 */
export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  return parseJwt(token);
};

/**
 * Get user role from the JWT token
 * @returns {object|null} User role or null if no valid token
 */
export const getUserRoleFromToken = () => {
  const userRole = getAccessToken();
  if (!userRole) return null;

  return userRole.roles?.[0]?.role?.toLowerCase() ?? "";
};

/**
 * Get the user's role for a specific system
 * @param {object} user - User object with roles array
 * @param {string} system - System name to check
 * @returns {string|null} The role name or null if no role found
 */
export const getSystemRole = (user, system) => {
  console.log("Token Utils User:", user);
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return null;
  }

  const roleEntry = user.roles.find(
    (role) => role.system?.toLowerCase() === system?.toLowerCase()
  );
  console.log("Role entry:", roleEntry);
  console.log("return role entry:", roleEntry ? roleEntry.role : null);
  return roleEntry ? roleEntry.role : null;
};

/**
 * Check if the token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};
