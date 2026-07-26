import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Information3.css";

function Information3() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Later the backend will decide whether to show this
  const [showConcentration, setShowConcentration] = useState(false);

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

          <div className="progress-fill-three"></div>

          <div className="divider divider1"></div>
          <div className="divider divider2"></div>

        </div>

        <p className="progress-label">
          Step 3 of 3
        </p>

      </div>

      {/* ---------------- FORM ---------------- */}

      <main className="info-content">

        <div className="major-form">

          <div className="major-row">

            <label>MAJOR</label>

            <input
              type="text"
              placeholder="Type"
            />

          </div>

          <p className="major-example">
            ex: Mechanical Engineering
          </p>

          <p className="major-note">
            note: for double majors include "AND" in between
          </p>

          {showConcentration && (

            <div className="major-row concentration-row">

              <label>CONCENTRATION</label>

              <input
                type="text"
                placeholder="Type"
              />

            </div>

          )}

        </div>

      </main>

      {/* ---------------- BUTTONS ---------------- */}

      <div className="navigation-buttons">

        <button
          className="back-btn"
          onClick={() => navigate("/information2")}
        >
          BACK
        </button>

        <button
          className="next-btn"
          onClick={() => navigate("/results")}
        >
          NEXT
        </button>

      </div>

    </div>
  );
}

export default Information3;