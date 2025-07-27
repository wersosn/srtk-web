import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import ReservationCalendar from "../Calendar/ReservationCalendar";
import CyclistsSvg from "../assets/track-cycling.svg";
import Spinner from 'react-bootstrap/Spinner';
import "./Home.css";

const Home: React.FC = () => {
   const navigate = useNavigate();
   const { isLoggedIn, isAuthChecked } = useAuth();

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
        <div className="hero-section">
          <div className="hero-text">
            <h1>System rezerwacji toru kolarskiego</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            {!isLoggedIn ? (
            <div className="d-flex gap-2">
                <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/login')}>Zaloguj się</button>
                <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/reserve')}>Zarezerwuj tor</button>
            </div>
            ) : ( 
              <button style={{backgroundColor: "#ED8A62", color:"#030303"}} onClick={() => navigate('/reserve')}>Zarezerwuj tor</button>
            )}
          </div>

          <div className="hero-image">
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