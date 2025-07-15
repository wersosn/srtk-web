import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import AddFacility from "./Facilities/AddFacility";
import AddRole from "./Roles/AddRole";
import Login from "./User/Login";
import Register from "./User/Register";
import Navb from "./Navbar/Navb";
import "./App.css";

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
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
