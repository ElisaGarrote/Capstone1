//import Form from "../components/Form";
import "../styles/custom-colors.css";
import "../styles/Login.css";
import loginImage from "../images/login_illustration.png";
import SubmitButton from "../components/button";

function Login() {
  // return <Form route="/api/token/" method="login" />
  return (
    <main className="login-page">
      <div className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </div>
      <div className="right-panel">
        <form action="" method="post">
          <p>Username:</p>
          <input type="text" placeholder="Enter your username" />

          <p>Password:</p>
          <input type="password" placeholder="Enter your password" />

          <button type="submit">Log In</button>
          <a href="#">Forgot Password?</a>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}

export default Login;
