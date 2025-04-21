import "../styles/custom-colors.css";
import "../styles/login.css";
import "../styles/alert.css";
import loginImage from "../assets/img/login.png";

import Alert from "../components/Alert";
import AxiosInstance from "../components/AxiosInstance.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

function Register() {
  // State handling initializations
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirects to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  // Form handling initializations
  const {control, handleSubmit, formState: { errors }, watch, getValues} = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Uses watch function to monitor password input
  const password = watch("password", "");
  // Password requirements for validation
  const passwordRequirements = [
    {
      test: password.length >= 8,
      message: "Password must be at least 8 characters long",
    },
    {
      test: /[a-z]/.test(password),
      message: "Password must contain at least one lowercase letter",
    },
    {
      test: /[A-Z]/.test(password),
      message: "Password must contain at least one uppercase letter",
    },
    {
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: "Password must contain at least one special character",
    },
  ];

  // Function to handle form submission
  const onSubmit = async (data) => {
    console.log("Submitting to backend:", {
      email: data.email,
      password: data.password,
    });
    try {
      await AxiosInstance.post("register/", {
        email: data.email,
        password: data.password,
      });
      setSuccessMessage("Registration successful! Please log in.");
      setErrorMessage("");
      navigate("/login"); 
    } catch (error) {
      console.error("Error response:", error.response?.data || error);
      setErrorMessage("Registration failed.");
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
        <div className="form-header">
          <h1>Admin Registration</h1>
          <p>Welcome! Please register to create an admin account.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email field with validation */}
          <fieldset>
            <label>Email:</label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                  message: "Email must be a valid Gmail address",
                },
              }}
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

          {/* Password field with validation */}
          <fieldset>
            <label>Password:</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              )}
            />
            {errors.password && <span className="error-msg">{errors.password.message}</span>}
            {password && (
              <div className="password-requirements">
                {passwordRequirements.map((requirement, index) =>
                  !requirement.test ? (
                    <div key={index} className="error-msg">
                      {requirement.message}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </fieldset>

          {/* Confirm password field with validation */}
          <fieldset>
            <label>Confirm Password:</label>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match", // use getValues here
              }}
              render={({ field }) => (
                <input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
              )}
            />
            {errors.confirmPassword && (
              <span className="error-msg">{errors.confirmPassword.message}</span>
            )}
          </fieldset>

          <button type="submit">Register</button>
        </form>
        <a onClick={() => navigate("/login")}>Login</a>
      </section>
    </main>
  );
}

export default Register;
