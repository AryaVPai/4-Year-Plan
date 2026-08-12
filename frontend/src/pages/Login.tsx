import { loginUser } from "../../api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";
import axios from "axios";

const API = "http://localhost:8000";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(username, password);

      // Save token and user info for the rest of the app
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("first_name", res.data.first_name);

      // Navigate to the main app
      navigate("/information1");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">

      {/* ---------- HEADER ---------- */}

      <header className="header">
        <div className="header-left">
          <img src="/logo.png" alt="Logo" className="logo" />
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
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          {/* Error message */}
          {error && (
            <p style={{ color: "red", fontSize: 14, marginBottom: 8 }}>{error}</p>
          )}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>

        </div>
      </main>
    </div>
  );
}

export default Login;