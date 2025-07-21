import React, { createContext, useContext, useEffect, useState } from 'react';

// Kontekst autoryzacji - przechowuje stan zalogowania użytkownika i potrzebne funkcje:
interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthChecked: boolean;
}

// Tworzenie kontekstu:
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
    setIsAuthChecked(true);
  }, []);

  // Funkcja logowania:
  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  // Funkcja wylogowania:
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // Udostępnienie stanu i funkcji:
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook do korzystania z AuthContext:
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  }
  return context;
};
