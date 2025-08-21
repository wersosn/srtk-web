import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from 'react-router-dom';
import '../User/Login.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [info, setInfo] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');

        if(newPassword !== repeatNewPassword) {
            setError(t("auth.differentPassword"));
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            setInfo(t("auth.newPassword"));
            setTimeout(() => navigate('/login'), 1000);
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
                                type="password"
                                placeholder={t("auth.passwd")}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="login-input" />
                            <input
                                type="password"
                                placeholder={t("auth.repeatPassword")}
                                value={repeatNewPassword}
                                onChange={(e) => setRepeatNewPassword(e.target.value)}
                                required
                                className="login-input" />
                            <button type="submit">{t("auth.saveChanges")}</button>
                            {info && <p className="login-info">{info}</p>}
                            {error && <p className="login-error">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ResetPassword;