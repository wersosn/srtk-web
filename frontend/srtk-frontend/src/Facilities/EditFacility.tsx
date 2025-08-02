import React, { useState } from 'react';

interface EditFacilityProps {
    facilityId: number;
    currentName: string;
    currentCity: string;
    currentAddress: string;
    onUpdated: (updatedFacility: { id: number; name: string; city: string; address: string }) => void;
    onCancel: () => void;
}

const EditFacility: React.FC<EditFacilityProps> = ({ facilityId, currentName, currentCity, currentAddress, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [city, setCity] = useState(currentCity);
    const [address, setAddress] = useState(currentAddress);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/facilities/${facilityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, city, address })
            });
            if (response.ok) {
                const updatedFacility = await response.json();
                onUpdated(updatedFacility);
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
                    <label htmlFor="facilityName">Nazwa</label>
                    <input id="facilityName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div>
                    <label htmlFor="facilityCity">Miasto</label>
                    <input id="facilityCity" value={city} onChange={e => setCity(e.target.value)} required maxLength={50} className="info-input" />
                </div>
                <div>
                    <label htmlFor="facilityAddress">Adres</label>
                    <input id="facilityAddress" value={address} onChange={e => setAddress(e.target.value)} required maxLength={50} className="info-input" />
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

export default EditFacility;
