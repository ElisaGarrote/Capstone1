import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../features/counter/userSlice";
import authService from "../services/auth-service";
import SystemLoading from "../components/Loading/SystemLoading";
import { setAccessToken, getUserFromToken } from "../api/TokenUtils";
import { useAuth } from "../context/AuthContext";
import "../styles/custom-colors.css";
import "../styles/Login.css";

function TokenLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const processTokens = async () => {
      try {
        // Get tokens from URL parameters
        const accessToken = searchParams.get("accesstoken");
        const refreshToken = searchParams.get("refreshtoken");

        // Validate tokens exist
        if (!accessToken || !refreshToken) {
          setStatus("error");
          setMessage("Missing authentication tokens. Please try logging in again.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Store tokens using TokenUtils
        setAccessToken(accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Update auth context
        const authSuccess = await checkAuthStatus();

        if (authSuccess) {
          // Get user data from token for Redux
          const currentUser = getUserFromToken();
          
          if (currentUser) {
            // Store full user object in Redux so UI components can read
            // `roles`, `full_name`, etc. directly (matches backend payload)
            dispatch(setUser({ ...currentUser, loggedIn: true }));
            
            setStatus("success");
            setMessage("Authentication successful! Redirecting to dashboard...");
            
            // Redirect to dashboard after short delay
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            throw new Error("Failed to parse user from token");
          }
        } else {
          throw new Error("Authentication check failed");
        }
      } catch (error) {
        console.error("Token login error:", error);
        setStatus("error");
        setMessage("Authentication failed. Please try logging in again.");
        
        // Clear invalid tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refresh_token");
        
        // Redirect to login after delay
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    processTokens();
  }, [searchParams, navigate, dispatch]);

  if (status === "processing") {
    return <SystemLoading />;
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="status-card">
          <div className={`status-icon ${status}`}>
            {status === "success" && (
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="28" stroke="var(--success-color)" strokeWidth="4"/>
                <path d="M17 30L26 39L43 22" stroke="var(--success-color)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {status === "error" && (
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="28" stroke="var(--error-color)" strokeWidth="4"/>
                <path d="M20 20L40 40M40 20L20 40" stroke="var(--error-color)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <h2 className={`status-title ${status}`}>{message}</h2>
          <p className="status-description">
            {status === "success" && "You will be redirected shortly."}
            {status === "error" && "Redirecting to login page..."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TokenLogin;
