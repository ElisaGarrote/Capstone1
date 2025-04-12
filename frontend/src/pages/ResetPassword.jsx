import "../styles/custom-colors.css";
import "../styles/Register.css";
import loginImage from "../assets/img/login.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const csrfToken = getCookie('csrftoken');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include', // This sends cookies along with the request
        body: new URLSearchParams({
          email: email,
        }),
      });
  
      if (response.ok) {
        alert('Reset link sent! Please check your email.');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to send reset link.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Network error occurred.');
    }
  };  
  
  return (
    <main className="register-page">
      <section className="left-panel">
        <img src={loginImage} alt="reset-illustration" />
      </section>
      <section className="right-panel">
        <h2>Reset Your Password</h2>
        {error && <p className="error-message">{error}</p>}
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label>Email:</label>
              <input
                id="email"
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
          </div>
        )}
        <div className="confirmation-box">
          <button onClick={() => navigate("/login")}>Back to Login</button>
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
