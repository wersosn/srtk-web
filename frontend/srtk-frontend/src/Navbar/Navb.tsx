import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import Spinner from 'react-bootstrap/Spinner';
import bellIconLight from '../assets/bell-light.png'
import bellIconDark from '../assets/bell-dark.png'

const Navb: React.FC = () => {
  const { isLoggedIn, logout, isAuthChecked, userRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Dynamiczne ustawianie odpowiedniej ikonki (w zależności od trybu (cielmy/jasny)):
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);
  const icon = isDark ? bellIconLight : bellIconDark;

  // Czekanie na poprawne załadowanie navbara:
  if (!isAuthChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center p-3">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid className="px-4">
        <Navbar.Brand href="/" className="fw-bold">SRTK</Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          {isLoggedIn && userRole === 'Admin' ? (
            <>
              <Nav.Link href="/myReservations">{t("navbar.myReservations")}</Nav.Link>
              <Nav.Link className="me-2" href="/adminPanel">{t("navbar.adminPanel")}</Nav.Link>
              <button className="icon-button me-3" title={t("navbar.notification")}>
                <img src={icon} alt="Powiadomienia" style={{ width: '24px', height: '24px' }} />
              </button>
              <button onClick={handleLogout}>{t("navbar.logout")}</button>
            </>
          ) : isLoggedIn && userRole === 'Client' ? (
            <>
              <Nav.Link href="/myReservations">{t("navbar.myReservations")}</Nav.Link>
              <Nav.Link className="me-2" href="/profile">{t("navbar.profile")}</Nav.Link>
              <button className="icon-button me-3" title={t("navbar.notification")}>
                <img src={icon} alt="Powiadomienia" style={{ width: '24px', height: '24px' }} />
              </button>
              <button onClick={handleLogout}>{t("navbar.logout")}</button>
            </>
          ) : (
            <>
              <Nav.Link href="/login" className="me-2">{t("navbar.login")}</Nav.Link>
              <button onClick={() => window.location.href = '/register'}>{t("navbar.register")}</button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Navb;
