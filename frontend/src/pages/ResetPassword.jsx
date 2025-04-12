import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reset-password.css";
import "../styles/custom-colors.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleResend = () => {
    setShowPopup(true);
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <main className="reset-password-page">
      <h1>Reset Your Password</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </fieldset>
          <button className="common-button" type="submit">
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="confirmation">
          <h4>If this email is registered, a reset link will be sent shortly.</h4>

          <p>Didn't receive it?</p>
          <button className="common-button" onClick={handleResend}>
            Resend Link
          </button>
          <button className="common-button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      )}

      {/* Local popup implementation */}
      {showPopup && (
        <div className="local-popup-overlay">
          <div className="local-popup">
            <h3>Success!</h3>
            <p>Reset link has been resent.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default ResetPassword;
