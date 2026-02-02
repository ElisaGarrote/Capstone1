import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { selectUser } from "../features/counter/userSlice";
import { useSelector } from "react-redux";
import {
  getUserFromToken,
  getUserRoleFromToken,
  getAccessToken,
} from "../api/TokenUtils";

function ProtectedRoute({ roles }) {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const userRole = getUserRoleFromToken();
  const currentUser = getUserFromToken();
  const token = getAccessToken();
  console.log("current user:", currentUser);

  // const role = currentUser?.role?.toLowerCase() || "";
  const role = currentUser?.roles?.[0]?.role?.toLowerCase() ?? "";
  console.log("role:", role);
  const isAuthenticated = !!token;

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
