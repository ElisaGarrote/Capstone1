//import Form from "../components/Form";
import "../styles/Login.css";
import loginImage from "../images/login_illustration.png";

function Login() {
  // return <Form route="/api/token/" method="login" />
  return (
    <main className="login-page">
      <div className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </div>
      <div className="right-panel">
        <p>Username:</p>
        <input type="text" placeholder="Enter your username" />

        <p>Password:</p>
        <input type="password" placeholder="Enter your password" />

        <button type="submit">Log In</button>
        <a href="#">Forgot Password?</a>
      </div>
    </main>
  );
}

export default Login;
