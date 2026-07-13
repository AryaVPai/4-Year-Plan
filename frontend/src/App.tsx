import "./App.css";

function App() {
  const semesters = [
    "Fall 2026",
    "Spring 2027",
    "Fall 2027",
    "Spring 2028",
    "Fall 2028",
    "Spring 2029",
    "Fall 2029",
    "Spring 2030",
  ];

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="logo">
          <img
            src="/logo.png"
            alt="logo"
          />
          <h2>4Year</h2>
        </div>

        <nav>
          <button>Dashboard</button>
          <button>Planner</button>
          <button>Courses</button>
          <button>Progress</button>
          <button>Settings</button>
        </nav>
      </aside>

      <main className="main">

        <h1>4-Year Plan</h1>

        <div className="progress-card">
          <h3>Degree Progress</h3>
          <p>72% Complete</p>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>

        <h2>Semesters</h2>

        <div className="semester-grid">
          {semesters.map((semester) => (
            <div className="semester-card" key={semester}>
              <h3>{semester}</h3>

              <ul>
                <li>Course 1</li>
                <li>Course 2</li>
                <li>Course 3</li>
              </ul>
            </div>
          ))}
        </div>

      </main>

    </div>
  );
}

export default App;