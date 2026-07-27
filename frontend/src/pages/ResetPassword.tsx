import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ResetPassword.css";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      {/* ---------- RESET PASSWORD ---------- */}

      <main className="login-content">

        <h2>RESET PASSWORD</h2>

        <div className="form">

          <div className="input-row">
            <label>Email / Username</label>
            <input type="text" />
          </div>

          <div className="input-row">
            <label>New Password</label>

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

          <button className="login-btn">
            RESET PASSWORD
          </button>

        </div>

      </main>

    </div>
  );
}

export default ResetPassword;