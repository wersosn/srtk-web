import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import Spinner from 'react-bootstrap/Spinner';

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn, userRole, isAuthChecked } = useAuth();

    // Oczekiwanie na sprawdzenie auth:
    if (!isAuthChecked) {
        return (
            <div className="d-flex justify-content-center align-items-center p-3">
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    // Jeśli użytkownik nie jest zalogowany -> przejdź do strony logowania
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    // Jeśli użytkownik nie ma roli 'Admin' -> wróć na stronę główną
    if (userRole !== 'Admin') {
        alert("Nie masz dostępu do tej strony");
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default RequireAdmin;