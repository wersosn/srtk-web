import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';

const Navb: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white px-6 py-3 shadow">
      <Link to="/" className="text-xl font-bold">SRTK</Link>

      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="hover:underline">Profil</Link>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Wyloguj
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Zaloguj</Link>
            <Link to="/register" className="hover:underline">Rejestracja</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navb;
