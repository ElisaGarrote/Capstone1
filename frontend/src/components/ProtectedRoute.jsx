import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute() {
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Check if the user is authorized when the component mounts
  // If the user is not authorized, redirect to the login page
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  // Function to refresh the token
  // This function will be called when the token is expired
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };
  // Check if the token is expired and refresh it if necessary
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    // Check if the token is expired, if so, refresh it
    // If the token is not expired, set isAuthorized to true
    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
