import "../styles/custom-colors.css";
import "../styles/Login.css";
import loginImage from "../assets/img/login.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import AxiosInstance from "../components/AxiosInstance.jsx"; // Assuming this is your Axios instance
import Alert from "../components/Alert"; // Assuming you have an Alert component

function ResetPasswordEmail() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form handling initializations
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
    },
  });

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      await AxiosInstance.post("reset-password/", {
        email: data.email,
      });
      setSuccessMessage("Password reset link has been sent to your email. Please check your inbox.");
      setErrorMessage("");
    } catch (error) {
      console.error("Error response:", error.response?.data || error);
      setErrorMessage("Failed to send reset password link. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>

      <section className="right-panel">
        {errorMessage && <Alert message={errorMessage} type="danger" />}
        {successMessage && <Alert message={successMessage} type="success" />}

        <div className="form-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email field with validation */}
          <fieldset>
            <label>Email:</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                />
              )}
            />
            {errors.email && <span className="error-msg">{errors.email.message}</span>}
          </fieldset>

          <button type="submit">Submit</button>
        </form>
        <a onClick={() => navigate("/login")}>Login</a>
      </section>
    </main>
  );
}

export default ResetPasswordEmail;
