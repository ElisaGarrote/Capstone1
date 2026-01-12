// src/context/AuthContext.jsx
// Centralized auth context for AMS - matches TTS/BMS pattern
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import {
  hasAccessToken,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getUserFromToken,
  hasSystemRole,
  hasAnySystemRole,
  isTokenExpired,
  getSystemRole,
  getAccessTokenFromCookie,
} from "../api/TokenUtils";
import { read } from "xlsx";

const AuthContext = createContext();

// Auth service URL - points to centralized auth service
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://165.22.247.50:8003";
console.log("pointed at -> ", `${AUTH_URL}/api/v1/token/obtain/`);

// API endpoints
const PROFILE_URL = `${AUTH_URL}/api/v1/users/profile/`;
const TOKEN_OBTAIN_URL = `${AUTH_URL}/api/v1/token/obtain/`;
const TOKEN_VERIFY_URL = `${AUTH_URL}/api/v1/token/verify/`;
const TOKEN_REFRESH_URL = `${AUTH_URL}/api/v1/token/refresh/`;
const LOGOUT_URL = `${AUTH_URL}/logout/`;
const USERS_LIST_URL = `${AUTH_URL}/api/v1/users/list/`;

// Create auth API instance for auth service requests
const createAuthRequest = () => {
  return axios.create({
    baseURL: AUTH_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check if user has Admin role for AMS system
  const isAdmin = useCallback(() => {
    return user && hasSystemRole(user, "ams", "Admin");
  }, [user]);

  // Check if user has Operator role for AMS system
  const isOperator = useCallback(() => {
    return user && hasSystemRole(user, "ams", "Operator");
  }, [user]);

  // Check if user has any role for AMS system
  const hasAmsAccess = useCallback(() => {
    return user && hasAnySystemRole(user, "ams");
  }, [user]);

  // Get user's AMS role
  const getAmsRole = useCallback(() => {
    console.log("User in getAmsRole:", user);
    console.log("return getamsrole:", user ? getSystemRole(user, "ams") : null);
    return user ? getSystemRole(user, "ams") : null;
  }, [user]);

  // Verify token with auth service
  const verifyToken = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) return false;

      // First check if token is expired locally
      if (isTokenExpired(token)) {
        return false;
      }

      const authApi = createAuthRequest();
      const response = await authApi.post(TOKEN_VERIFY_URL, {
        token,
      });

      return response.status === 200;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  }, []);

  // Fetch user profile (token + full profile)
  const fetchUserProfile = useCallback(async () => {
    try {
      const tokenUser = getUserFromToken();
      if (!tokenUser) throw new Error("Invalid token");

      const authApi = createAuthRequest();
      const response = await authApi.get(PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });

      if (response.data) {
        return {
          ...tokenUser,
          ...response.data,
          roles: tokenUser.roles, // preserve roles from token
        };
      }

      throw new Error("Failed to fetch user profile");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If profile fetch fails, at least return token user data
      return getUserFromToken();
    }
  }, []);

  /**
   * Update current user's profile on the auth service.
   * Accepts a payload object. If payload contains an `image` dataURL
   * it will be sent as `profile_picture` in the JSON body.
   */
  const updateUserProfile = useCallback(
    async (payload) => {
      try {
        const authApi = createAuthRequest();

        let body = payload || {};

        // If frontend provided a File under profile_picture, send as multipart FormData
        const hasFile =
          body.profile_picture &&
          typeof File !== "undefined" &&
          body.profile_picture instanceof File;

        if (hasFile) {
          const formData = new FormData();
          Object.keys(body).forEach((key) => {
            const value = body[key];
            if (value === undefined || value === null) return;
            // If it's an object/array (not file), stringify
            if (typeof value === "object" && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          });

          console.debug("updateUserProfile: sending FormData", formData);

          // Don't set default application/json header when sending FormData
          const res = await authApi
            .patch(PROFILE_URL, formData, {
              headers: { Authorization: `Bearer ${getAccessToken()}` },
            })
            .catch(async (err) => {
              // fallback to PUT when PATCH is not allowed
              if (err?.response?.status === 405) {
                return await authApi.put(PROFILE_URL, formData, {
                  headers: { Authorization: `Bearer ${getAccessToken()}` },
                });
              }
              throw err;
            });

          const updated = res.data || (await fetchUserProfile());
          setUser((prev) => ({ ...prev, ...updated, roles: prev?.roles }));
          console.debug("updateUserProfile: success", updated);
          return { success: true, data: updated };
        }

        // No file: send JSON body
        // If the frontend passed an image as a dataURL, include as profile_picture
        if (
          body.image &&
          typeof body.image === "string" &&
          body.image.startsWith("data:")
        ) {
          body = { ...body, profile_picture: body.image };
          delete body.image;
        }

        console.debug("updateUserProfile: sending JSON body", body);

        const res = await authApi
          .patch(PROFILE_URL, body, {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
          })
          .catch(async (err) => {
            if (err?.response?.status === 405) {
              return await authApi.put(PROFILE_URL, body, {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
              });
            }
            throw err;
          });

        // Normalize response and update context user state
        const updated = res.data || (await fetchUserProfile());
        setUser((prev) => ({ ...prev, ...updated, roles: prev?.roles }));

        console.debug("updateUserProfile: success", updated);
        return { success: true, data: updated };
      } catch (error) {
        console.error("Failed to update user profile:", error);
        const err = error.response?.data || error.message || "Update failed";
        return { success: false, error: err };
      }
    },
    [fetchUserProfile]
  );

  // Central auth checker (single source of truth)
  const checkAuthStatus = useCallback(async () => {
    if (!hasAccessToken()) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return false;
    }

    try {
      const isValid = await verifyToken();

      if (isValid) {
        const userData = await fetchUserProfile();

        // Check if user has AMS access
        if (!hasAnySystemRole(userData, "ams")) {
          console.warn("User does not have AMS access");
          removeAccessToken();
          setUser(null);
          setLoading(false);
          setInitialized(true);
          return false;
        }

        setUser(userData);
        setLoading(false);
        setInitialized(true);
        return true;
      }

      removeAccessToken();
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      removeAccessToken();
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return false;
    }
  }, [verifyToken, fetchUserProfile]);

  // Initial auth check on app load
  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
    };
    init();
  }, [checkAuthStatus]);

  // Periodic token refresh
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const authApi = createAuthRequest();
      authApi
        .post(TOKEN_REFRESH_URL)
        .then((res) => {
          if (res.data?.access) {
            setAccessToken(res.data.access);
          }
        })
        .catch(() => {
          checkAuthStatus();
        });
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => clearInterval(interval);
  }, [user, checkAuthStatus]);

  const getToken = useCallback(() => {
    return getAccessToken();
  }, []);

  /**
   * Fetch all users from the auth service.
   * Returns an array of user objects or an empty array on error.
   */
  const fetchAllUsers = useCallback(async () => {
    try {
      const authApi = createAuthRequest();
      const res = await authApi.get(USERS_LIST_URL, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });

      // API may return an object with shape { users_count, users: [...] }
      // Normalize to always return an array of user objects.
      if (!res || !res.data) return [];
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.users)) return res.data.users;
      return [];
    } catch (error) {
      console.error("Failed to fetch users list:", error);
      return [];
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      return await checkAuthStatus();
    } finally {
      setLoading(false);
    }
  }, [checkAuthStatus]);

  // Login function
  const login = async (credentials) => {
    try {
      const loginData = {
        email: credentials.email,
        password: credentials.password,
      };

      const authApi = createAuthRequest();
      const response = await authApi.post(TOKEN_OBTAIN_URL, loginData);

      const readResponse = response.data;
      console.log("read response:", readResponse);

      if (response.data?.access) {
        setAccessToken(response.data.access);
      } else {
        // Get access token on cookie
        setAccessToken(getAccessTokenFromCookie());
      }

      // Let checkAuthStatus fetch & set FULL user
      const authSuccess = await checkAuthStatus();

      const readAuthSucess = authSuccess.data;
      console.log("auth sucess:", readAuthSucess);

      if (!authSuccess) {
        return {
          success: false,
          error: "You do not have access to the Asset Management System.",
        };
      }

      setInitialized(true);
      setLoading(false);

      return { success: true, user: getUserFromToken() };
    } catch (error) {
      console.error("Login failed:", error);

      let errorDetail = "Login failed. Please check your credentials.";

      if (error.response?.data?.detail) {
        errorDetail = error.response.data.detail;
      }

      return { success: false, error: errorDetail };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const authApi = createAuthRequest();
      await authApi.post(LOGOUT_URL).catch(() => {});
    } finally {
      removeAccessToken();
      setUser(null);
      setInitialized(true);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  /**
   * Updates the user state in the context.
   * This is called after a successful profile update.
   * @param {object} updatedUserData - The updated user object.
   */
  const updateUserContext = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
      roles: prevUser?.roles, // Preserve roles from token
    }));
  };

  const value = {
    user,
    setUser,
    loading,
    logout,
    login,
    refreshAuth,
    initialized,
    isAuthenticated: !!user,
    hasAuth: !!user,
    isAdmin,
    isOperator,
    hasAmsAccess,
    getAmsRole,
    checkAuthStatus,
    getToken,
    updateUserContext,
    fetchUserProfile,
    updateUserProfile,
    fetchAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
