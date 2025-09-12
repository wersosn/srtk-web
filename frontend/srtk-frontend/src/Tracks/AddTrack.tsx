import React, { useState, useEffect, type FormEvent } from "react";
import type { Track, Facility } from '../Types/Types';
import { getAllFacilities } from '../Services/Api';
import { useTranslation } from "react-i18next";
import { useAuth } from "../User/AuthContext";
import { useFacilities } from "../Hooks/useFacilities";

interface AddTrackProps {
    onAddTrack: (newTrack: Track) => void;
}

const AddTrack: React.FC<AddTrackProps> = ({ onAddTrack }) => {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const [name, setName] = useState<string>("");
    const [typeofsurface, setTypeofsurface] = useState<string>("");
    const [length, setLength] = useState<number | "">("");
    const [openingHour, setOpeningHour] = useState<string>("");
    const [closingHour, setClosingHour] = useState<string>("");
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const allDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    const { facilityId } = useAuth();
    const [facilityID, setFacilityId] = useState<number | "">("");
    const { facilities } = useFacilities(token);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (token) {
            if (facilityId !== 0) {
                setFacilityId(facilityId!);
            }
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const newTrack = { name, typeofsurface, length, openingHour, closingHour, availableDays: availableDays.join(","), facilityId: facilityID };

        try {
            const response = await fetch("/api/tracks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newTrack)
            });

            if (response.ok) {
                const createdTrack: Track = await response.json();
                setMessage(t("track.trackAdded"));
                setName("");
                setTypeofsurface("");
                setLength(0);
                setOpeningHour("");
                setClosingHour("");
                setAvailableDays([]);
                setFacilityId("");
                onAddTrack(createdTrack);
            } else {
                let errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    setMessage(t("universal.error") + (errorData.detail || JSON.stringify(errorData)));
                } catch {
                    setMessage(t("universal.error") + (errorText));
                }
            }
        } catch (error: any) {
            setMessage(t("universal.error") + error.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    {facilityId === 0 && (
                        <>
                            <label>{t("track.facility")}</label><br />
                            <select id="facilitySelect" value={facilityID} onChange={e => setFacilityId(Number(e.target.value))} required className="info-input">
                                <option value="">{t("track.selectFacility")}</option>
                                {facilities.map(facility => (
                                    <option key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <label htmlFor="trackName">{t("track.name")}</label>
                    <input id="trackName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />

                    <label htmlFor="trackType">{t("track.typeOfSurface")}</label>
                    <input id="trackType" value={typeofsurface} onChange={e => setTypeofsurface(e.target.value)} required maxLength={50} className="info-input" />

                    <label htmlFor="trackLength">{t("track.length")}</label>
                    <input id="trackLength" type="number" value={length} onChange={e => setLength(Number(e.target.value))} required maxLength={50} className="info-input" />

                    <label htmlFor="trackOpeningHour">{t("track.open")}</label>
                    <input id="trackOpeningHour" type="time" value={openingHour} onChange={e => setOpeningHour(e.target.value)} required className="info-input" />

                    <label htmlFor="trackClosingHour">{t("track.close")}</label>
                    <input id="trackClosingHour" type="time" value={closingHour} onChange={e => setClosingHour(e.target.value)} required className="info-input" />

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
                </div>
                <button type="submit">{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddTrack;