import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddFacility from "./Facilities/AddFacility";
import AddRole from "./Roles/AddRole";
import Login from "./User/Login";
import Register from "./User/Register";
import Navb from "./Navbar/Navb";
import Home from "./Home/Home";

function App() {
  return (
    <Router>
      <Navb />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addFacility" element={<AddFacility />} />
        <Route path="/addRole" element={<AddRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
