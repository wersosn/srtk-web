import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

const Navb: React.FC = () => {
  const { isLoggedIn, logout, isAuthChecked } = useAuth();
  const navigate = useNavigate();

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
        <Navbar.Brand href="/" className="fw-bold text-dark">SRTK</Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          {isLoggedIn ? (
            <>
              <Nav.Link href="/profile" className="text-dark">Profil</Nav.Link>
              <button onClick={handleLogout}>Wyloguj</button>
            </>
          ) : (
            <>
              <Nav.Link href="/login" className="text-dark me-2">Logowanie</Nav.Link>
              <button onClick={() => window.location.href = '/register'}>Rejestracja</button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>

  );
};

export default Navb;
