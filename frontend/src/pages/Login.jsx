//import Form from "../components/Form";
import "../styles/custom-colors.css";
import "../styles/login.css";
import loginImage from "../assets/img/login.png";
import closeIcon from "../assets/icons/close.png";

function Login() {
  // return <Form route="/api/token/" method="login" />
  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={loginImage} alt="login-illustration" />
      </section>
      <section className="right-panel">
        <div className="alert-warning">
          <div className="alert-container">
            <img src={closeIcon} alt="close-icon" />
            <p>Invalid credentials.</p>
          </div>
        </div>
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
