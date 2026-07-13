export default function Dashboard() {
  return (
    <div>

      <h1>Dashboard</h1>

      <div className="stat-grid">

        <div className="card">
          <h2>Credits Completed</h2>
          <p>52</p>
        </div>

        <div className="card">
          <h2>Credits Remaining</h2>
          <p>68</p>
        </div>

        <div className="card">
          <h2>Current GPA</h2>
          <p>3.75</p>
        </div>

      </div>

    </div>
  );
}