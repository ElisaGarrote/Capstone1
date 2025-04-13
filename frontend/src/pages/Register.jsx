//import Form from "../components/Form";
import "../styles/custom-colors.css";
import "../styles/login.css";
import loginImage from "../assets/img/login.png";
import Alert from "../components/Alert";
import "../styles/alert.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Register() {
  // return <Form route="/api/token/" method="login" />
  const navigate = useNavigate();

  // Redirect to "/" if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);
  
  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>
      <section className="right-panel">
        <form action="" method="post">
          <fieldset>
            <label>Email:*</label>
            <input type="text" placeholder="Enter your username" />
          </fieldset>

          <fieldset>
            <label>Username:</label>
            <input type="text" placeholder="Enter your username" />
          </fieldset>

          <fieldset>
            <label>First Name:</label>
            <input type="text" placeholder="Enter your username" />
          </fieldset>

          <fieldset>
            <label>Last Name:</label>
            <input type="text" placeholder="Enter your username" />
          </fieldset>

          <fieldset>
            <label>Password:*</label>
            <input type="password" placeholder="Enter your password" />
          </fieldset>

          <fieldset>
            <label>Confirm Password:*</label>
            <input type="password" placeholder="Enter your password" />
          </fieldset>

          <button type="submit">Log In</button>
        </form>
      </section>
    </main>
  );
}

export default Register;
