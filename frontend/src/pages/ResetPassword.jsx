import "../styles/custom-colors.css";
import "../styles/Register.css";
import loginImage from "../assets/img/login.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate backend call or trigger an alert/popup here
    alert("Reset link sent! Please Check your email.");
  };

  return (
    <main className="register-page">
      <section className="left-panel">
        <img src={loginImage} alt="reset-illustration" />
      </section>
      <section className="right-panel">
        <h2>Reset Your Password</h2>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </fieldset>

            <button type="submit">Send Reset Link</button>
          </form>
        ) : (
          <div className="confirmation-box">
            <p>If this email is registered, a reset link will be sent shortly.</p>
            <p className="resend-label">Didn't receive the email?</p>
            <button onClick={handleSubmit} className="resend-button">
              Resend Link
            </button>
            <button onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
