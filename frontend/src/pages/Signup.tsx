import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

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

      {/* ---------- SIGN UP ---------- */}

      <main className="login-content">

        <h2>CREATE ACCOUNT</h2>

        <div className="form">

          <div className="input-row">
            <label>First Name</label>
            <input type="text" />
          </div>

          <div className="input-row">
            <label>Last Name</label>
            <input type="text" />
          </div>

          <div className="input-row">
            <label>University Email</label>
            <input type="email" />
          </div>

          <div className="input-row">
            <label>Username</label>
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

          <div className="input-row">
            <label>Confirm Password</label>

            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

          </div>

                      
            <button
            className="login-btn"
            onClick={() => navigate("/")}
          >
            CREATE ACCOUNT
          </button>


          <div className="signup-bottom">
            Already have an account?{" "}
            <Link to="/">Log In</Link>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Signup;