import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import SystemLoading from "./Loading/SystemLoading";

function ProtectedRoute({ roles }) {
  const navigate = useNavigate();
  // const token = sessionStorage.getItem(ACCESS_TOKEN);
  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  // console.log("currentUser:", currentUser);

  const role = currentUser?.system_roles[0].role_name?.toLowerCase() || "";
  const isAuthenticated = currentUser ? true : false;
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
