import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import ComputerImage from "../assets/auth-panel.svg";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [info, setInfo] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfo('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, lastName }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            setInfo('Rejestracja przebiegła pomyślnie, przekierowanie na stronę logowania');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setInfo(err.message || 'Błąd rejestracji');
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <div className="register-image-container">
                    <img src={ComputerImage} alt="Logowanie" className="login-image" />
                </div>

                <div className="register-form-container">
                    <form className="register-form" onSubmit={handleRegister}>
                        <h2>Rejestracja</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="register-input"
                        />
                        <input
                            type="text"
                            placeholder="Imię"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="register-input"
                        />
                        <input
                            type="text"
                            placeholder="Nazwisko"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="register-input"
                        />
                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="register-input"
                        />
                        <button type="submit">
                            Zarejestruj się
                        </button>
                        {info && <p className="register-info">{info}</p>}
                        <hr />
                        <a href="/login" style={{ fontSize: '0.9rem', color: '#101d26' }}>
                            Masz już konto? Zaloguj się
                        </a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
