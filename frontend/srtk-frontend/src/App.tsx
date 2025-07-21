import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddFacility from "./Facilities/AddFacility";
import AddRole from "./Roles/AddRole";
import Login from "./User/Login";
import Register from "./User/Register";
import Navb from "./Navbar/Navb";
import ReservationCalendar from "./Calendar/ReservationCalendar";
//import "./App.css";

function Home() {
  return (
    <>
      <button>
        <Link to="/addFacility" style={{ color: "inherit", textDecoration: "none" }}>
          Dodaj nowy obiekt
        </Link>
      </button>
      <button>
        <Link to="/addRole" style={{ color: "inherit", textDecoration: "none" }}>
          Dodaj nową rolę
        </Link>
      </button>
    </>
  );
}

function App() {
  return (
    <Router>
      <Navb />
      <ReservationCalendar />
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
