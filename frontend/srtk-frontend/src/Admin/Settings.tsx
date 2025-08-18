import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from "react-i18next";
import i18n from "../Locales/i18next";

function Settings() {
    const [language, setLanguage] = useState(i18n.language);
    const { t } = useTranslation();

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
            <div className="admin-content p-4">
                <h2 className="mb-3">Ustawienia</h2>
                <hr />
                <div className="setting-item">
                    <label htmlFor="language">Język</label>
                    <select id="language" name="language" value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="info-input">
                        <option value="pl">Polski</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default Settings;