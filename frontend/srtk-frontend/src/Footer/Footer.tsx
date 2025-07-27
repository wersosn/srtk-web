import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#222',
      color: '#eee',
      padding: '1rem 2rem',
      textAlign: 'center',
      marginTop: '2rem'
    }}>
      <p>© 2025 System rezerwacji toru kolarskiego</p>
      <nav>
        <a href="/about" style={{ color: '#ED8A62', margin: '0 1rem', textDecoration: 'none' }}>O nas</a>
        <a href="/contact" style={{ color: '#ED8A62', margin: '0 1rem', textDecoration: 'none' }}>Kontakt</a>
        <a href="https://storyset.com/people" style={{ color: '#ED8A62', margin: '0 1rem', textDecoration: 'none' }}>People illustrations by Storyset</a>
      </nav>
    </footer>
  );
};

export default Footer;
