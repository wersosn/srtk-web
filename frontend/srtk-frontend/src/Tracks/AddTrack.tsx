import React, { useState, useEffect, type FormEvent } from "react";
import type { Track } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useAuth } from "../User/AuthContext";
import { useFacilities } from "../Hooks/useFacilities";
import api from "../Api/axios";
interface AddTrackProps {
    onAddTrack: (newTrack: Track) => void;
}

const AddTrack: React.FC<AddTrackProps> = ({ onAddTrack }) => {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const [name, setName] = useState<string>("");
    const [typeofsurface, setTypeofsurface] = useState<string>("");
    const [length, setLength] = useState<number | 0>(0);
    const [openingHour, setOpeningHour] = useState<string>("");
    const [closingHour, setClosingHour] = useState<string>("");
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const allDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    const { facilityId } = useAuth();
    const [facilityID, setFacilityId] = useState<number | "">("");
    const { facilities } = useFacilities(token);
    const [message, setMessage] = useState<string>("");
    const isFormValid = !!name && !!typeofsurface && length > 0 && !!openingHour && !!closingHour && availableDays.length > 0 && (facilityId !== 0 || facilityID);

    useEffect(() => {
        if (token) {
            if (facilityId !== 0) {
                setFacilityId(facilityId!);
            }
        }
    }, [token]);

    const validateInputs = () => {
        if (length <= 0) {
            alert(t("track.positiveLength"));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if(!validateInputs()) {
            return;
        }

        const newTrack = { name, typeofsurface, length, openingHour, closingHour, availableDays: availableDays.join(","), facilityId: facilityID };

        try {
            const { data: createdTrack } = await api.post<Track>("/tracks", newTrack);
            setMessage(t("track.trackAdded"));
            setName("");
            setTypeofsurface("");
            setLength(0);
            setOpeningHour("");
            setClosingHour("");
            setAvailableDays([]);
            setFacilityId("");
            onAddTrack(createdTrack);
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
                <button disabled={!isFormValid} type="submit">{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddTrack;