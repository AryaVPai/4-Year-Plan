import { Routes, Route, Navigate} from "react-router-dom";


import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Information1 from "./pages/Information1";
import Information2 from "./pages/Information2";
import Information3 from "./pages/Information3";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />

      {/* Protected — requires login */}
      <Route path="/information1" element={
        <ProtectedRoute><Information1 /></ProtectedRoute>
      } />
      <Route path="/information2" element={
        <ProtectedRoute><Information2 /></ProtectedRoute>
      } />
      <Route path="/information3" element={
        <ProtectedRoute><Information3 /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;