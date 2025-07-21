import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
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
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">SRTK</Navbar.Brand>
        <Nav className="me-auto">
          {isLoggedIn ? (
            <>
              <Nav.Link href="/profile">Profil</Nav.Link>
              <button onClick={handleLogout}>
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <Nav.Link href="/login">Logowanie</Nav.Link>
              <Nav.Link href="/register">Rejestracja</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Navb;
