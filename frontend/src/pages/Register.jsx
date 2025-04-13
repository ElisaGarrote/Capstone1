// src/pages/Register.jsx
import "../styles/custom-colors.css";
import "../styles/login.css";
import "../styles/alert.css";
import loginImage from "../assets/img/login.png";

import Alert from "../components/Alert";
import AxiosInstance from "../components/AxiosInstance";  // Import Axios instance
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

function Register() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues:{
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
  
    console.log("Submitting to backend:", {
      email: data.email,
      password: data.password,
    });
  
    try {
      await AxiosInstance.post("register/", {
        email: data.email,
        password: data.password,
      });
      navigate("/");
    } catch (error) {
      console.error("Error response:", error.response?.data || error);
      setErrorMessage("Registration failed.");
    }
  };
  
  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>

      <section className="right-panel">
        {errorMessage && <Alert message={errorMessage} type="danger" />}

        <form onSubmit={handleSubmit(onSubmit)}>
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
                  {...field} // Spread the field props to bind the input
                />
              )}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </fieldset>

          <fieldset>
            <label>Password:*</label>
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
            {errors.password && <span>{errors.password.message}</span>}
          </fieldset>

          <fieldset>
            <label>Confirm Password:*</label>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{ required: "Please confirm your password" }}
              render={({ field }) => (
                <input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
              )}
            />
            {errors.confirmPassword && (
              <span>{errors.confirmPassword.message}</span>
            )}
          </fieldset>

          <button type="submit">Register</button>
        </form>

        <Link to="/login">Login</Link>
      </section>
    </main>
  );
}

export default Register;
