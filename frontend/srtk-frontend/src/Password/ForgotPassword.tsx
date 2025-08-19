import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import '../User/Login.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [info, setInfo] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');

        try {
            const res = await fetch(`/api/users/email?email=${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(t("profile.userFetchError"));

            const data = await res.json();

            if (data.emailConfirmed === false) {
                setError(t("auth.emailNotConfirmed"));
                return;
            }

            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            setInfo(t("auth.resetPasswordEmail"));
            setTimeout(() => navigate('/'), 1000);
        }
        catch (err: any) {
            setError(err.message || t("auth.passwordResetError"));
        }
    }

    return (
        <>
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-form-container">
                        <form className="login-form" onSubmit={handleReset}>
                            <h2>{t("auth.resetPassword")}</h2>
                            <hr />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="login-input" />
                            <button type="submit">{t("auth.resetPasswordSubmit")}</button>
                            {info && <p className="login-info">{info}</p>}
                            {error && <p className="login-error">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword;