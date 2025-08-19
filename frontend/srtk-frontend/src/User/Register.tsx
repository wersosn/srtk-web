import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import './Register.css';
import ComputerImage from "../assets/auth-panel.svg";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [info, setInfo] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

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

            setInfo(t("auth.registerSuccessful"));
            setTimeout(() => navigate('/login'), 5000);
        } catch (err: any) {
            setInfo(err.message || t("auth.registerError"));
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
                        <h2>{t("auth.registerTitle")}</h2>
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
                            placeholder={t("auth.name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="register-input"
                        />
                        <input
                            type="text"
                            placeholder={t("auth.surname")}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="register-input"
                        />
                        <input
                            type="password"
                            placeholder={t("auth.passwd")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="register-input"
                        />
                        <button type="submit">
                            {t("auth.signin")}
                        </button>
                        {info && <p className="register-info">{info}</p>}
                        <hr />
                        <a href="/login" className="link">
                            {t("auth.accountLogin")}
                        </a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
