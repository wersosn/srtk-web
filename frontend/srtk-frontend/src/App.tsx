import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./User/Login";
import Register from "./User/Register";
import Navb from "./Navbar/Navb";
import Footer from "./Footer/Footer";
import Home from "./Home/Home";
import RequireAdmin from "./Admin/RequireAdmin";
import RequireUser from "./Reservations/RequireUser";
import AdminPanel from "./Admin/AdminPanel";
import Dashboard from "./Admin/Dashboard";
import EquipmentsManagement from "./Equipments/EquipmentsManagement";
import FacilitiesManagement from "./Facilities/FacilitiesManagement";
import RoleManagement from "./Roles/RolesManagement";
import StatusesManagement from "./Statuses/StatusesManagement";
import TrackManagement from "./Tracks/TracksManagement";
import UserManagement from "./User/UserManagement";
import BlobBackground from "./BlobBackground";
import MakeReservation from "./Reservations/MakeReservation";
import MyReservations from "./Reservations/MyReservations";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <BlobBackground />
        <Navb />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/makeReservation" element={
            <RequireUser>
              <MakeReservation />
            </RequireUser>
          }/>

           <Route path="/myReservations" element={
            <RequireUser>
              <MyReservations />
            </RequireUser>
          }/>

          <Route path="/adminPanel" element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }>
            <Route index element={<Dashboard />} />
            <Route path="equipmentsManagement" element={<EquipmentsManagement />} />
            <Route path="facilitiesManagement" element={<FacilitiesManagement />} />
            <Route path="roleManagement" element={<RoleManagement />} />
            <Route path="statusesManagement" element={<StatusesManagement />} />
            <Route path="tracksManagement" element={<TrackManagement />}/>
            <Route path="usersManagement" element={<UserManagement />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
