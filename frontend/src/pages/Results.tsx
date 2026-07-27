import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SemesterCard from "../components/SemesterCard";
import "./Results.css";

function Results() {

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    // Dummy data for now
    // Later this comes directly from the backend

    const semesters = [

        {
            title: "Freshman Year • Fall",
            courses: [
                {
                    code: "CHEM 102",
                    title: "General Chemistry I",
                    credits: 3,
                    type: "Major Core",
                },
                {
                    code: "CHEM 103",
                    title: "General Chemistry Lab",
                    credits: 1,
                    type: "Major Core",
                },
                {
                    code: "MATH 220",
                    title: "Calculus",
                    credits: 5,
                    type: "Math",
                },
                {
                    code: "RHET 105",
                    title: "Writing & Research",
                    credits: 4,
                    type: "Gen Ed",
                },
            ],
        },

        {
            title: "Freshman Year • Spring",
            courses: [
                {
                    code: "MCB 150",
                    title: "Molecular Biology",
                    credits: 4,
                    type: "Major Core",
                },
                {
                    code: "CHEM 104",
                    title: "General Chemistry II",
                    credits: 3,
                    type: "Major Core",
                },
                {
                    code: "CHEM 105",
                    title: "General Chemistry Lab II",
                    credits: 1,
                    type: "Major Core",
                },
                {
                    code: "STAT 100",
                    title: "Statistics",
                    credits: 3,
                    type: "Math",
                },
            ],
        },

        {
            title: "Sophomore Year • Fall",
            courses: [],
        },

        {
            title: "Sophomore Year • Spring",
            courses: [],
        },

        {
            title: "Junior Year • Fall",
            courses: [],
        },

        {
            title: "Junior Year • Spring",
            courses: [],
        },

        {
            title: "Senior Year • Fall",
            courses: [],
        },

        {
            title: "Senior Year • Spring",
            courses: [],
        },

    ];

    return (

        <div className="results-page">

            {/* ================= HEADER ================= */}

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

            {/* ================= PROFILE ================= */}

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

            {/* ================= PROGRESS ================= */}

            <div className="progress-wrapper">

                <div className="progress-bar">

                    <div className="progress-fill-three"></div>

                    <div className="divider divider1"></div>

                    <div className="divider divider2"></div>

                </div>

                <p className="progress-label">
                    Plan Generated
                </p>

            </div>

            {/* ================= MAIN ================= */}

            <div className="results-layout">

                {/* LEFT */}

                <div className="semester-grid">

                    {semesters.map((semester) => (

                        <SemesterCard

                            key={semester.title}

                            title={semester.title}

                            courses={semester.courses}

                        />

                    ))}

                </div>

                {/* RIGHT */}

                <div className="sidebar">

                    <h2>
                        Degree Progress
                    </h2>

                    <div className="progress-item">

                        <span>Major Core</span>

                        <div className="mini-bar">

                            <div
                                className="mini-fill"
                                style={{ width: "72%" }}
                            />

                        </div>

                        <p>72%</p>

                    </div>

                    <div className="progress-item">

                        <span>General Education</span>

                        <div className="mini-bar">

                            <div
                                className="mini-fill"
                                style={{ width: "48%" }}
                            />

                        </div>

                        <p>48%</p>

                    </div>

                    <div className="progress-item">

                        <span>Electives</span>

                        <div className="mini-bar">

                            <div
                                className="mini-fill"
                                style={{ width: "25%" }}
                            />

                        </div>

                        <p>25%</p>

                    </div>

                    <button className="edit-button">

                        Edit My Plan

                    </button>

                    <div className="sources">

                        <h3>Sources</h3>

                        <ul>

                            <li>University Course Catalog</li>

                            <li>Department Requirements</li>

                            <li>Official Degree Audit</li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Results;