import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { registerUser } from "../../api";

const API = "http://localhost:8000";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    // Basic client-side check before hitting the API
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ first_name: firstName, last_name: lastName, email, username, password, confirm_password: confirmPassword });

      // Save token and username so the rest of the app knows who's logged in
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      // Go to the main app
      navigate("/");
    } catch (err: any) {
      // Show the error message from the backend (e.g. "Email already taken", "Must use .edu email")
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
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

      {/* ---------- SIGN UP ---------- */}

      <main className="login-content">
        <h2>CREATE ACCOUNT</h2>

        <div className="form">

          <div className="input-row">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>University Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>Username</label>
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

          <div className="input-row">
            <label>Confirm Password</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error message from backend */}
          {error && (
            <p style={{ color: "red", fontSize: 14, marginBottom: 8 }}>{error}</p>
          )}

          <button
            className="login-btn"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
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