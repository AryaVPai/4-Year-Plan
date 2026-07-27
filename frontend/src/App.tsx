import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Information1 from "./pages/Information1";
import Information2 from "./pages/Information2";
import Information3 from "./pages/Information3";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />

      <Route path="/information1" element={<Information1 />} />
      <Route path="/information2" element={<Information2 />} />
      <Route path="/information3" element={<Information3 />} />
    </Routes>
  );
}

export default App;