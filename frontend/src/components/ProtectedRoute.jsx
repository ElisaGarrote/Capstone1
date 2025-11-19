import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import SystemLoading from "./Loading/SystemLoading";
import authService from "../services/auth-service";

function ProtectedRoute({ roles }) {
  const navigate = useNavigate();
  // const token = sessionStorage.getItem(ACCESS_TOKEN);

  // Prefer authService user info, fallback to raw sessionStorage
  const currentUser =
    authService.getUserInfo?.() || JSON.parse(sessionStorage.getItem("user"));
  // console.log("currentUser:", currentUser);

  const rawRole =
    currentUser?.system_roles?.[0]?.role_name ||
    currentUser?.role ||
    currentUser?.user_role ||
    "";

  const role = rawRole.toLowerCase();
  const isAuthenticated = !!currentUser;
  // const isAuthenticated = token ? true : false;

  // Redirect the user back to the previous page.
  useEffect(() => {
    // Redirect user back to the previous page if authenticated and not authorized.
    if (isAuthenticated && !roles.includes(role)) {
      navigate(-1);
    }
  }, [isAuthenticated, roles, role]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(role)) {
    return null;
  }

  return <Outlet />;
}

export default ProtectedRoute;