import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Added navigate here

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

      {/* ---------- LOGIN ---------- */}

      <main className="login-content">

        <h2>LOGIN</h2>

        <div className="form">

          <div className="input-row">
            <label>Email / Username</label>
            <input type="text" />
          </div>

          <div className="input-row">
            <label>Password</label>

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="links">
            <Link to="/forgot-password" className="link-button">
              Forgot Password
            </Link>
            <Link to="/signup" className="link-button">
              Sign Up
            </Link>
          </div>

          {/* Updated button with onClick navigation */}
          <button 
            className="login-btn"
            onClick={() => navigate("/information1")}
          >
            LOG IN
          </button>

        </div>

      </main>

    </div>
  );
}

export default Login;