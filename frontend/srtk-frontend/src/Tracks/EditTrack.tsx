import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

interface EditTrackProps {
    trackId: number;
    currentName: string;
    currentTypeOfSurface: string;
    currentLength: number;
    currentOpeningHour: string;
    currentClosingHour: string;
    currentAvailableDays: string;
    currentFacilityId: number;
    onUpdated: (updatedTrack: { id: number; name: string; typeOfSurface: string; length: number; openingHour: string, closingHour: string, availableDays: string, facilityId: number }) => void;
    onCancel: () => void;
}

const EditTrack: React.FC<EditTrackProps> = ({ trackId, currentName, currentTypeOfSurface, currentLength, currentOpeningHour, currentClosingHour, currentAvailableDays, currentFacilityId, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [typeofsurface, setTypeofsurface] = useState(currentTypeOfSurface);
    const [length, setLength] = useState(currentLength);
    const [openingHour, setOpeningHour] = useState(currentOpeningHour);
    const [closingHour, setClosingHour] = useState(currentClosingHour);
    const [availableDays, setAvailableDays] = useState<string[]>(currentAvailableDays ? currentAvailableDays.split(",") : []); // Odpowiednie ustawienie dni w tablicy
    const allDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    const facilityId = currentFacilityId;
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/tracks/${trackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, typeofsurface, length, openingHour, closingHour, availableDays: availableDays.join(","), facilityId })
            });
            if (response.ok) {
                const updatedTrack = await response.json();
                onUpdated(updatedTrack);
                setMessage('');
            } else {
                const error = await response.text();
                setMessage(t("universal.error") + error);
            }
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="trackName">{t("track.name")}</label>
                    <input id="trackName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackType">{t("track.typeOfSurface")}</label>
                    <input id="trackType" value={typeofsurface} onChange={e => setTypeofsurface(e.target.value)} required className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackLength">{t("track.length")}</label>
                    <input id="trackLength" value={length} onChange={e => setLength(Number(e.target.value))} required className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackOpeningHour">{t("track.open")}</label>
                    <input id="trackOpeningHour" type="time" value={openingHour} onChange={e => setOpeningHour(e.target.value)} required className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackClosingHour">{t("track.close")}</label>
                    <input id="trackClosingHour" type="time" value={closingHour} onChange={e => setClosingHour(e.target.value)} required className="info-input" />
                </div>
                <div className="mb-2">
                        <label>{t("track.availableDays")}</label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                            {allDays.map(day => (
                                <label key={day} className="form-check">
                                    <input
                                        type="checkbox"
                                        checked={availableDays.includes(day)}
                                        onChange={() =>
                                            setAvailableDays(prev =>
                                                prev.includes(day)
                                                    ? prev.filter(d => d !== day)
                                                    : [...prev, day]
                                            )
                                        }
                                    />
                                    <span style={{ marginLeft: "8px" }}>{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                <div className="d-flex gap-2">
                    <button type="submit">{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditTrack;
