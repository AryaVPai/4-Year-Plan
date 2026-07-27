import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Information1.css";

function Information1() {
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

          <div className="progress-fill"></div>

          <div className="divider divider1"></div>

          <div className="divider divider2"></div>

        </div>

        <p className="progress-label">
          Step 1 of 3
        </p>

      </div>

      {/* ---------------- FORM ---------------- */}

      <main className="info-content">

  <div className="form">

    <div className="input-row">

      <label>
        College / University
      </label>

      <input
        type="text"
        placeholder="Type"
      />

    </div>

    <div className="input-row">

      <label>
        Location
      </label>

      <input
        type="text"
        placeholder="Type"
      />

    </div>

  </div>

</main>

      {/* ---------------- BUTTONS ---------------- */}

      <div className="navigation-buttons">

  <button
    className="next-btn"
    onClick={() => navigate("/information2")}
  >
    NEXT
  </button>

</div>

    </div>
  );
}

export default Information1;