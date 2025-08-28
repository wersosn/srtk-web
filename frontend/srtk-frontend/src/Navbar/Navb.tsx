import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import Spinner from 'react-bootstrap/Spinner';
import NotificationBell from '../Notifications/NotificationBell';

const Navb: React.FC = () => {
  const { isLoggedIn, logout, isAuthChecked, userRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
              <NotificationBell/>
              <button onClick={handleLogout}>{t("navbar.logout")}</button>
            </>
          ) : isLoggedIn && userRole === 'Client' ? (
            <>
              <Nav.Link href="/myReservations">{t("navbar.myReservations")}</Nav.Link>
              <Nav.Link className="me-2" href="/profile">{t("navbar.profile")}</Nav.Link>
              <NotificationBell />
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
