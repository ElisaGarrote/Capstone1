import { useState } from "react";
import { useParams } from "react-router-dom";
import loginImage from "../assets/img/login.png";

function SetPassword() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submitNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("new_password1", newPassword);
      formData.append("new_password2", confirmPassword);

      const response = await fetch(`http://127.0.0.1:8000/reset/${uid}/${token}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setSuccess(true);
        alert('Your password has been reset successfully!');
      } else {
        const data = await response.json();
        const errMsg = data?.new_password2?.[0] || "Something went wrong.";
        alert(errMsg);
      }

    } catch (err) {
      setError("Failed to reset password. Please try again.");
      alert('Network error! Please try again.');
    }
  };

  return (
    <main className="reset-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>

      <section className="right-panel">
        <h2>Set New Password</h2>

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
      </section>
    </main>
  );
}

export default SetPassword;
