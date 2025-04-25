import "../styles/custom-colors.css";
import "../styles/Login.css";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert.jsx";
import AxiosInstance from "../components/AxiosInstance.jsx";

function PasswordReset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submitNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await AxiosInstance.post("api/password_reset/confirm/", {
        password: confirmPassword,
        token: token,
      });

      console.log("Response:", response);
      setSuccessMessage("Your password reset was successful, you can now log in with your new password. You will be redirected to the login page in a second.");
      setErrorMessage("");

      setTimeout(() => {
        navigate("/login")}, 3000); // Redirect after 5 seconds
    } catch (error) {
      console.error("Error response:", error.response?.data || error);
      setErrorMessage("Failed to reset password. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>

      <section className="right-panel">
        <h2>Set New Password</h2>

        {errorMessage && <Alert message={errorMessage} type="danger" />}
        {successMessage && <Alert message={successMessage} type="success" />}

        <form onSubmit={submitNewPassword}>
          <fieldset>
            <label>New Password:</label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </fieldset>

          <fieldset>
            <label>Confirm Password:</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </fieldset>
          <button type="submit">Reset Password</button>
        </form>
        <a onClick={() => navigate("/login")}>Login</a>
      </section>
    </main>
  );
}

export default PasswordReset;
