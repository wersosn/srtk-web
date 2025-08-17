import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from "react-i18next";
import i18n from "../Locales/i18next";
import type { Client } from '../Types/Types';
import EditMyInfo from './EditMyInfo';
import profileImage from '../assets/profile.svg';
import './Profile.css';

function Profile() {
  const [userId, setUserId] = useState<number>();
  const [user, setUser] = useState<Client>();
  const [language, setLanguage] = useState(i18n.language);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  // Pobieranie danych użytkownika:
  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/clients/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Błąd podczas pobierania danych użytkownika');
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userIdFromToken = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        if (userIdFromToken) {
          setUserId(parseInt(userIdFromToken, 10));
        }
      } catch {
        setUserId(undefined);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Obsługa zmiany danych:
  const handleEdit = (updatedUser: Client) => {
    setUser(updatedUser);
    alert("Zaktualizowano dane");
  };

  // Obsługa zmiany języka:
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

  return (
    <>
      <div className="profile-container">

        <div className="profile-card-wrapper">
          <div className="profile-image-container">
            <img src={profileImage} alt="Logowanie" className="profile-image" />
          </div>

          <main className="profile-main">
            <h2 className="mt-4">Mój profil</h2>
            <hr />

            {loading ? (
              <p>Ładowanie profilu...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              user && (
                <>
                  <h5>Zmiana danych</h5>
                  <EditMyInfo
                    key={user.id}
                    userId={user.id}
                    currentEmail={user.email}
                    currentName={user.name}
                    currentSurname={user.surname}
                    currentPhoneNumber={user.phoneNumber}
                    onUpdated={handleEdit} />

                  <hr />
                  <h5>Ustawienia</h5>
                  <div className="setting-item">
                    <label htmlFor="language">Język</label>
                    <select id="language" name="language" value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="info-input">
                      <option value="pl">Polski</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </>
              ))}
          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;