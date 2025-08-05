import React, { useState, useEffect, type FormEvent } from "react";
import { jwtDecode } from 'jwt-decode';
import type { Track, Facility } from '../Types/Types';

interface AddTrackProps {
    onAddTrack: (newTrack: Track) => void;
}

const AddTrack: React.FC<AddTrackProps> = ({ onAddTrack }) => {
    const [name, setName] = useState<string>("");
    const [typeofsurface, setTypeofsurface] = useState<string>("");
    const [length, setLength] = useState<number | "">("");
    const [openingHour, setOpeningHour] = useState<string>("");
    const [closingHour, setClosingHour] = useState<string>("");
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const allDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    const [facilityID, setFacilityId] = useState<number | "">("");
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');
    const [adminInFacility, setAdminInFacility] = useState<number | null>(null);

    useEffect(() => {
        if (token) {
            const decoded: any = jwtDecode(token);
            const id = parseInt(decoded.FacilityId);
            if (!isNaN(id)) {
                setAdminInFacility(id);
                if (id !== 0) {
                    setFacilityId(id);
                }
            }
        }

        const fetchFacilities = async () => {
            try {
                const res = await fetch('/api/facilities', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error('Błąd pobierania obiektów');
                const data = await res.json();
                setFacilities(data);
            } catch (err: any) {
                setMessage(err.message || 'Błąd pobierania obiektów');
            }
        };
        fetchFacilities();
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
                setMessage("Dodano tor");
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
                    setMessage("Error: " + (errorData.detail || JSON.stringify(errorData)));
                } catch {
                    setMessage("Error: " + (errorText || "Wystąpił błąd"));
                }
            }
        } catch (error: any) {
            setMessage("Error: " + error.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    {adminInFacility === 0 && (
                        <>
                            <label>Obiekt</label><br />
                            <select id="facilitySelect" value={facilityID} onChange={e => setFacilityId(Number(e.target.value))} required className="info-input">
                                <option value="">Wybierz obiekt</option>
                                {facilities.map(facility => (
                                    <option key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <label htmlFor="trackName">Nazwa</label>
                    <input id="trackName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />

                    <label htmlFor="trackType">Typ nawierzchni</label>
                    <input id="trackType" value={typeofsurface} onChange={e => setTypeofsurface(e.target.value)} required maxLength={50} className="info-input" />

                    <label htmlFor="trackLength">Długość</label>
                    <input id="trackLength" type="number" value={length} onChange={e => setLength(Number(e.target.value))} required maxLength={50} className="info-input" />

                    <label htmlFor="trackOpeningHour">Godzina otwarcia</label>
                    <input id="trackOpeningHour" type="time" value={openingHour} onChange={e => setOpeningHour(e.target.value)} required className="info-input" />

                    <label htmlFor="trackClosingHour">Godzina zamknięcia</label>
                    <input id="trackClosingHour" type="time" value={closingHour} onChange={e => setClosingHour(e.target.value)} required className="info-input" />

                    <div className="mb-2">
                        <label>Dni otwarcia</label>
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
                <button type="submit">Dodaj nowy tor</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddTrack;