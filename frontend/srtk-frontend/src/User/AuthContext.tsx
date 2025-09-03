import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

// Kontekst autoryzacji - przechowuje stan zalogowania użytkownika i potrzebne funkcje:
interface AuthContextType {
  isLoggedIn: boolean;
  isAuthChecked: boolean;
  userId: number | null;
  userRole: string | null;
  facilityId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

// Tworzenie kontekstu:
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [facilityId, setFacilityId] = useState<number | null>(null);

    useEffect(() => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(Boolean(token));
      setIsAuthChecked(true);
      if (token) {
          try {
              const decoded: any = jwtDecode(token);
              setUserId(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
              setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
              setFacilityId(decoded["FacilityId"] ? parseInt(decoded["FacilityId"]) : null);
          } catch {
              setUserId(null);
              setUserRole(null);
              setFacilityId(null);
          }
      }
    }, []);

    // Funkcja logowania i ustawienie roli użytkownika:
    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        try {
            const decoded: any = jwtDecode(token);
            setUserId(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
            setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
            setFacilityId(decoded["FacilityId"] ? parseInt(decoded["FacilityId"]) : null);
        } catch {
            setUserRole(null);
            setFacilityId(null);
            setUserId(null);
        }
    };

    // Funkcja wylogowania:
    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserRole(null);
    };

    // Udostępnienie stanu i funkcji:
    return (
        <AuthContext.Provider value={{ isLoggedIn, isAuthChecked, userId, userRole, facilityId, login, logout }}>
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
