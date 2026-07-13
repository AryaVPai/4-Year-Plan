import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">
        <img src="/logo.png" alt="logo" />
        <h2>4Year</h2>
      </div>

      <Link to="/">Dashboard</Link>
      <Link to="/planner">Planner</Link>
      <Link to="/courses">Courses</Link>
      <Link to="/progress">Progress</Link>
      <Link to="/settings">Settings</Link>

    </div>
  );
}