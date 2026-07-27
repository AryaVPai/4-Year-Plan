import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  return (
    <div className="login-page">

      {/* ---------- HEADER ---------- */}

      <header className="header">

        <div className="header-left">

          <img
            src="/logo.png"
            alt="Logo"
            className="logo"
          />

          <div className="title-group">
            <h1>4-YEAR PLAN</h1>
            <p>GENERATOR</p>
          </div>

        </div>

      </header>

      {/* ---------- FORGOT PASSWORD ---------- */}

      <main className="login-content">

        <h2>FORGOT PASSWORD</h2>

        <div className="form">

          <div className="input-row">
            <label>Email</label>
            <input type="email" />
          </div>

          <button className="login-btn">
            SEND PASSWORD RESET LINK
          </button>

          <div className="signup-bottom">
            Remember your password?{" "}
            <Link to="/">Log In</Link>
          </div>

        </div>

      </main>

    </div>
  );
}

export default ForgotPassword;