import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from 'react-router-dom';
import '../User/Login.css';

function ConfirmedEmail() {
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        const confirmEmail = async () => {
            if (!token) {
                setError(t("auth.emailConfirmedError"));
                return;
            }

            try {
                const response = await fetch('/api/auth/confirm-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
                    body: JSON.stringify({ token }),
                });
                
                const data = await response.json();
                if (!response.ok) {
                    alert(data.message);
                }
                setConfirmed(true);
                setTimeout(() => navigate('/'), 5000);
            }
            catch (err: any) {
                setError(err.message || t("auth.emailConfirmedError"));
            }
        };

        confirmEmail();
    }, [token, navigate, t]);

    return (
        <>
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-form-container">
                        <div className="login-form">
                            {confirmed ? (
                                <>
                                    <h2>{t("auth.emailConfirmedTitle")}</h2>
                                    <hr />
                                    <p>{t("auth.emailConfirmedDesc")}</p>
                                    {error && <p className="login-error">{error}</p>}
                                </>
                            ) : (
                                <>
                                    {error && <p className="login-error">{error}</p>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfirmedEmail;