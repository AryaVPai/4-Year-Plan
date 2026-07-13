const semesters = [
  "Fall 2026",
  "Spring 2027",
  "Fall 2027",
  "Spring 2028"
];

export default function Planner() {
  return (
    <div>

      <h1>4-Year Plan</h1>

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

    </div>
  );
}