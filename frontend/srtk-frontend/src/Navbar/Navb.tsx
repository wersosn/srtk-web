import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

function Navb() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">SRTK</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/facilities">Obiekty</Nav.Link>
            <Nav.Link as={Link} to="/about">O nas</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/login">Zaloguj</Nav.Link>
            <Nav.Link as={Link} to="/register">Zarejestruj</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navb;