import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import SystemLoading from "./Loading/SystemLoading";

function ProtectedRoute() {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
          // Try to refresh the token
          const refreshToken = localStorage.getItem(REFRESH_TOKEN);

          if (!refreshToken) {
            setIsAuthorized(false);
            return;
          }

          const res = await api.post("/api/token/refresh/", {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <SystemLoading />;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
