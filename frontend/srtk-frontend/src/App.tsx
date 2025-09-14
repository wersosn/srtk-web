import { lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "./User/AuthContext";
const BlobBackground = lazy(() => import("./BlobBackground"));
const Navb = lazy(() => import("./Navbar/Navb"));
import Login from "./User/Login";
import Register from "./User/Register";
import Footer from "./Footer/Footer";
import Home from "./Home/Home";
import Profile from "./Profile/Profile";
import ConfirmedEmail from "./Email/ConfirmedEmail";
import ForgotPassword from "./Password/ForgotPassword";
import ResetPassword from "./Password/ResetPassword";
import RequireAdmin from "./Admin/RequireAdmin";
import RequireUser from "./Reservations/RequireUser";
import AdminPanel from "./Admin/AdminPanel";
import Dashboard from "./Admin/Dashboard";
import Settings from "./Admin/Settings";
import EquipmentsManagement from "./Equipments/EquipmentsManagement";
import FacilitiesManagement from "./Facilities/FacilitiesManagement";
import RoleManagement from "./Roles/RolesManagement";
import StatusesManagement from "./Statuses/StatusesManagement";
import TrackManagement from "./Tracks/TracksManagement";
import UserManagement from "./User/UserManagement";
import MakeReservation from "./Reservations/MakeReservation";
import MyReservations from "./Reservations/MyReservations";
import ReservationManagement from "./Reservations/ReservationManagement";

function App() {
  const { logout } = useAuth();
  useEffect(() => {
    const token = localStorage.getItem('token');

    const isTokenValid = () => {
      if (!token) {
          return false;
      }

      try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          const exp = decoded?.exp;
          if (!exp) {
             return false; 
          }
          return exp > currentTime;
      } catch (error) {
          return false;
      }
    };

    if (!isTokenValid()) {
        logout();
    }
  }, []);

  return (
    <Router>
      <div className="app-wrapper">
        <BlobBackground />
        <Navb />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-email" element={<ConfirmedEmail />} />
          <Route path="/profile" element={
            <RequireUser>
              <Profile />
            </RequireUser>
          } />

          <Route path="/makeReservation" element={
            <RequireUser>
              <MakeReservation />
            </RequireUser>
          } />

          <Route path="/myReservations" element={
            <RequireUser>
              <MyReservations />
            </RequireUser>
          } />

          <Route path="/adminPanel" element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }>
            <Route index element={<Dashboard />} />
            <Route path="equipmentsManagement" element={<EquipmentsManagement />} />
            <Route path="facilitiesManagement" element={<FacilitiesManagement />} />
            <Route path="reservationsManagement" element={<ReservationManagement />} />
            <Route path="roleManagement" element={<RoleManagement />} />
            <Route path="statusesManagement" element={<StatusesManagement />} />
            <Route path="tracksManagement" element={<TrackManagement />} />
            <Route path="usersManagement" element={<UserManagement />} />
            <Route path="adminPanelSettings" element={<Settings />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
