import { useNavigate } from "react-router-dom";
import "../styles/custom-colors.css";
import "../styles/Login.css";
import "../styles/LoadingButton.css";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert";
import { useForm } from "react-hook-form";
import authService from "../services/auth-service";
import { useEffect, useState } from "react";
import LoadingButton from "../components/LoadingButton";
import eyeOpen from "../assets/icons/eye-open.svg";
import eyeClose from "../assets/icons/eye-close.svg";

function Login() {
  const navigate = useNavigate();
  const [isInvalidCredentials, setInvalidCredentials] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isShowPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "all",
  });

  const password = watch("password", "");

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

  // Reset the value of isShowPassword state when the password input is empty.
  useEffect(() => {
    if (password.length == 0) {
      setShowPassword(false);
    }
  }, [password]);

  return (
    <>
      {isInvalidCredentials && (
        <Alert message="Invalid credentials." type="danger" />
      )}

      <main className="login-page">
        <section className="left-panel">
          <img src={loginImage} alt="login-illustration" />
        </section>
        <section className="right-panel">
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

              <div className="password-container">
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  {...register("password", { required: "Must not empty" })}
                />

                {password.length > 0 && (
                  <img
                    src={isShowPassword ? eyeClose : eyeOpen}
                    className="show-password"
                    alt="Toggle password visibility"
                    onClick={() => setShowPassword(!isShowPassword)}
                  />
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="log-in-button"
            >
              {isSubmitting && <LoadingButton />}
              {!isSubmitting ? "Log In" : "Verifying..."}
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
    </>
  );
}

export default Login;
