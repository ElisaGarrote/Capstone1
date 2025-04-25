//import Form from "../components/Form";
import { useNavigate } from "react-router-dom";
import "../styles/custom-colors.css";
import "../styles/login.css";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert";

function Login() {
  // return <Form route="/api/token/" method="login" />
  const navigate = useNavigate();

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>
      <section className="right-panel">
        <Alert message="Invalid credentials." type="danger" />
        <form action="" method="post">
          <fieldset>
            <label>Email:</label>
            <input type="text" placeholder="Enter your username" />
          </fieldset>

          <fieldset>
            <label>Password:</label>
            <input type="password" placeholder="Enter your password" />
          </fieldset>

          <button type="submit">Log In</button>
        </form>
        <div className="form-btn">
          <button type="button" onClick={() => navigate("/register")} className="register-btn">Register</button>
        </div>
        <a onClick={() => navigate("/reset-password-email")}>Forgot Password?</a>
        <a onClick={() => navigate("/dashboard")}>Go to dashboard</a>
      </section>
    </main>
  );
}

export default Login;
