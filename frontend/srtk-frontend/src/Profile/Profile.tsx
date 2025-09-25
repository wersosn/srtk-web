import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import i18n from "../Locales/i18next";
import type { Client, UserPreference } from '../Types/Types';
import { getUserInfo } from '../Api/Api';
import EditMyInfo from './EditMyInfo';
import profileImage from '../assets/profile.svg';
import './Profile.css';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import api from "../Api/axios";

function Profile() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [user, setUser] = useState<Client>();
    const [email, setEmail] = useState<string>("");
    const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
    const { elementsPerPage, setElementsPerPage } = useUserPreferences(userId!, token, t);
    const [language, setLanguage] = useState(i18n.language);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserInfo = useCallback(async () => {
        if (!userId) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
          if(token) {
              const data = await getUserInfo(userId, token);
              setUser(data);
              setEmail(data.email);
              setEmailConfirmed(data.emailConfirmed);
          }
      } catch (err: any) {
          setError(err.message || t("profile.userFetchError"));
      } finally {
          setLoading(false);
      }
    }, [userId, token]);

    useEffect(() => {
        if (userId) {
          fetchUserInfo();
        }
    }, [userId, fetchUserInfo]);

    const handleEdit = (updatedUser: Client) => {
        setUser(updatedUser);
        alert(t("profile.infoUpdated"));
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
        if (lang == "en") {
            alert("Changed language");
        }
        else {
            alert("Zmieniono język");
        }
    };

    // Obsługa wysyłania maila z linkiem do potwierdzenia adresu e-mail:
    const handleSendingEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/email-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }
            alert(t("profile.sendConfirmation"))
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdatingElementsPerPage = async () => {
        if (elementsPerPage <= 0) {
            alert(t("profile.invalidElements"));
            return;
        }

        try {
            await api.put<UserPreference>(`/users/${userId}/preferences`, { elementsPerPage });
            alert(t("profile.preferencesUpdated"));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
      <>
        <div className="profile-container">
          <div className="profile-card-wrapper">
            <div className="profile-image-container">
                <img src={profileImage} alt="Logowanie" className="profile-image" />
            </div>

            <main className="profile-main">
                <h2 className="mt-4">{t("profile.myProfile")}</h2>
                <hr />

                {loading ? (
                  <p>{t("profile.loading")}</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  user && (
                    <>
                      <h5>{t("profile.edit")}</h5>
                      <EditMyInfo
                        key={user.id}
                        userId={user.id}
                        currentEmail={user.email}
                        currentName={user.name}
                        currentSurname={user.surname}
                        currentPhoneNumber={user.phoneNumber}
                        onUpdated={handleEdit} />

                      <hr />
                      <h5>{t("profile.settings")}</h5>
                      <div className="setting-item">
                          <label htmlFor="language">{t("profile.language")}</label>
                          <select id="language" name="language" value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="info-input">
                              <option value="pl">Polski</option>
                              <option value="en">English</option>
                          </select>
                      </div>

                      <div className="setting-item">
                          <label htmlFor="elementsPerPage">{t("profile.elementsPerPage")}</label>
                          <div className="d-flex gap-2">
                            <input id="elementsPerPage" name="elementsPerPage" value={elementsPerPage} type="number" onChange={(e) => setElementsPerPage(parseInt(e.target.value))} min={1} className="info-input"/>
                            <button onClick={handleUpdatingElementsPerPage} className="btn-filter">{t("universal.save")}</button>
                          </div>
                      </div>

                      {emailConfirmed !== null && emailConfirmed === false && (
                        <div className="setting-item">
                            <button onClick={handleSendingEmail}>{t("profile.confirmation")}</button>
                        </div>
                      )}
                    </>
                  ))}
            </main>
          </div>
        </div>
      </>
    );
  };

export default Profile;