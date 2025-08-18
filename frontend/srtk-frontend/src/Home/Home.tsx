import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import { useTranslation } from "react-i18next";
import ReservationCalendar from "../Calendar/ReservationCalendar";
import CyclistsSvg from "../assets/track-cycling.svg";
import Spinner from 'react-bootstrap/Spinner';
import "./Home.css";

const Home: React.FC = () => {
   const navigate = useNavigate();
   const { isLoggedIn, isAuthChecked } = useAuth();
   const { t } = useTranslation();

   // Czekanie na poprawne załadowanie danych:
  if (!isAuthChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center p-3">
        <Spinner animation="border" role="status" />
      </div>
    );
  }
  
  return (
    <>
      <div className="home-container">
        <div className="home-section">
          <div className="home-text">
            <h1>{t("home.title")}</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            {!isLoggedIn ? (
            <div className="d-flex gap-2">
                <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/login')}>{t("navbar.login")}</button>
                <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/makeReservation')}>{t("home.reserve")}</button>
            </div>
            ) : ( 
              <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/makeReservation')}>{t("home.reserve")}</button>
            )}
          </div>

          <div className="home-image">
            <img
              src={CyclistsSvg}
              alt="Kolarze na torze"
              className="animated"
              id="freepik_stories-track-cycling"
            />
          </div>
        </div>
        <div className="calendar-section">
          <ReservationCalendar />
        </div>
      </div>
      );
    </>
  );
};

export default Home;