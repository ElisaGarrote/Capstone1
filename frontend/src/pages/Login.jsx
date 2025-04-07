//import Form from "../components/Form";
import "../styles/custom-colors.css";
import "../styles/Login.css";
import loginImage from "../images/login.png";

function Login() {
  // return <Form route="/api/token/" method="login" />
  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>
      <section className="right-panel">
        <form action="" method="post">
          <p>Username:</p>
          <input type="text" placeholder="Enter your username" />

          <p className="password">Password:</p>
          <input type="password" placeholder="Enter your password" />

          <button type="submit">Log In</button>
          <a href="#">Forgot Password?</a>
        </form>
      </section>
    </main>
  );
}

export default Login;
