import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Information2.css";

function Information2() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="info-page">

      {/* ---------------- HEADER ---------------- */}

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

      {/* ---------------- PROFILE ---------------- */}

      <div className="profile-container">

        <button
          className="profile-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          👤
        </button>

        {menuOpen && (
          <div className="profile-menu">
            <button
              className="logout-btn"
              onClick={() => navigate("/")}
            >
              Log Out
            </button>
          </div>
        )}

      </div>

      {/* ---------------- PROGRESS BAR ---------------- */}

      <div className="progress-wrapper">

        <div className="progress-bar">

          <div className="progress-fill-two"></div>

          <div className="divider divider1"></div>
          <div className="divider divider2"></div>

        </div>

        <p className="progress-label">
          Step 2 of 3
        </p>

      </div>

      {/* ---------------- CONTENT ---------------- */}

      <main className="info-content">

        <div className="college-form">

          <div className="college-row">

            <label>COLLEGE</label>

            <input
              type="text"
              placeholder="Type"
              className="college-input"
            />

          </div>

          <p className="college-example">
            ex: College of LAS
          </p>

        </div>

      </main>

      {/* ---------------- BUTTONS ---------------- */}

      <div className="navigation-buttons">

        <button
          className="back-btn"
          onClick={() => navigate("/information1")}
        >
          BACK
        </button>

        <button
          className="next-btn"
          onClick={() => navigate("/information3")}
        >
          NEXT
        </button>

      </div>

    </div>
  );
}

export default Information2;