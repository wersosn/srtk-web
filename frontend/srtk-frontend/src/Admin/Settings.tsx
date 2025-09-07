import { useState } from 'react';
import { useTranslation } from "react-i18next";
import i18n from "../Locales/i18next";
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';

function Settings() {
    const [language, setLanguage] = useState(i18n.language);
    const { t } = useTranslation();
    const { userId } = useAuth();
    const token = localStorage.getItem('token');
    const { elementsPerPage, setElementsPerPage } = useUserPreferences(userId!, token, t);

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

    // Obsługa zmiany ilości elementów na listach (np. rezerwacji itp.):
    const handleUpdatingElementsPerPage = async () => {
        if (elementsPerPage <= 0) {
            alert(t("profile.invalidElements"));
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ elementsPerPage })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg);
            }

            alert(t("profile.preferencesUpdated"));
        } catch (err: any) {
            console.log(err.message);
        }
    };

    return (
        <>
            <div className="admin-content p-4">
                <h2 className="mb-3">{t("profile.settings")}</h2>
                <hr />
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
                        <input id="elementsPerPage" name="elementsPerPage" value={elementsPerPage} type="number" onChange={(e) => setElementsPerPage(parseInt(e.target.value))} min={1} className="info-input" />
                        <button onClick={handleUpdatingElementsPerPage} className="btn-filter">{t("universal.save")}</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;