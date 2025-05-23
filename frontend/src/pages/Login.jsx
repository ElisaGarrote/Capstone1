//import Form from "../components/Form";
import { useNavigate } from "react-router-dom";
import "../styles/custom-colors.css";
import "../styles/Login.css";
import "../styles/LoadingButton.css";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert";
import { useForm } from "react-hook-form";
import authService from "../services/auth-service";
import { useEffect, useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [isInvalidCredentials, setInvalidCredentials] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
  });

  const submission = async (data) => {
    const { email, password } = data;
    setSubmitting(true);

    try {
      const success = await authService.login(email, password);

      if (success) {
        setInvalidCredentials(false);

        navigate("/dashboard");
      } else {
        setInvalidCredentials(true);
      }
    } catch (error) {
      console.log("login failed!");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isInvalidCredentials) {
      setTimeout(() => {
        setInvalidCredentials(false);
      }, 5000);
    }
  }, [isInvalidCredentials]);

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>
      <section className="right-panel">
        {isInvalidCredentials && (
          <Alert message="Invalid credentials." type="danger" />
        )}
        <form onSubmit={handleSubmit(submission)}>
          <fieldset>
            <label>Email:</label>

            {errors.email && <span>{errors.email.message}</span>}

            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Must not empty",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                  message: "Invalid email format",
                },
              })}
            />
          </fieldset>

          <fieldset>
            <label>Password:</label>

            {errors.password && <span>{errors.password.message}</span>}

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              {...register("password", { required: "Must not empty" })}
            />
          </fieldset>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="log-in-button"
          >
            {isSubmitting && <span className="loading-button"></span>}
            {!isSubmitting && "Log In"}
          </button>
        </form>
        <div className="form-btn">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="register-btn"
          >
            Register
          </button>
        </div>
        <a onClick={() => navigate("/request/password_reset")}>
          Forgot Password?
        </a>
      </section>
    </main>
  );
}

export default Login;
