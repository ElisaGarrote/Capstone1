//import Form from "../components/Form";
import { useNavigate } from "react-router-dom";
import "../styles/custom-colors.css";
import "../styles/login.css";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert";
<<<<<<< HEAD
import "../styles/alert.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
=======
>>>>>>> benj/dev

function Login() {
  // return <Form route="/api/token/" method="login" />
  const navigate = useNavigate();

<<<<<<< HEAD
  // Redirect to "/" if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);
  
=======
>>>>>>> benj/dev
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
<<<<<<< HEAD
        <Link to="/reset-password-email">Forgot Password?</Link>
        <Link to="/register">Register</Link>
=======
        <a href="#">Forgot Password?</a>
        <a onClick={() => navigate("/dashboard")}>Go to dashboard</a>
>>>>>>> benj/dev
      </section>
    </main>
  );
}

export default Login;
