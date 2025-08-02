import React, { useState } from 'react';

interface EditTrackProps {
    trackId: number;
    currentName: string;
    currentTypeOfSurface: string;
    currentLength: number;
    currentFacilityId: number;
    onUpdated: (updatedTrack: { id: number; name: string; typeOfSurface: string; length: number; facilityId: number }) => void;
    onCancel: () => void;
}

const EditTrack: React.FC<EditTrackProps> = ({ trackId, currentName, currentTypeOfSurface, currentLength, currentFacilityId, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [typeofsurface, setTypeofsurface] = useState(currentTypeOfSurface);
    const [length, setLength] = useState(currentLength);
    const facilityId = currentFacilityId;
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/tracks/${trackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, typeofsurface, length, facilityId })
            });
            if (response.ok) {
                const updatedTrack = await response.json();
                onUpdated(updatedTrack);
                setMessage('');
            } else {
                const error = await response.text();
                setMessage('Błąd: ' + error);
            }
        } catch (err: any) {
            setMessage('Błąd: ' + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="trackName">Nazwa</label>
                    <input id="trackName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackType">Typ nawierzchi</label>
                    <input id="trackType" value={typeofsurface} onChange={e => setTypeofsurface(e.target.value)} required className="info-input" />
                </div>
                <div>
                    <label htmlFor="trackLength">Długość</label>
                    <input id="trackLength" value={length} onChange={e => setLength(Number(e.target.value))} required className="info-input" />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">Zapisz zmiany</button>
                    <button type="button" onClick={onCancel}>Anuluj</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditTrack;
