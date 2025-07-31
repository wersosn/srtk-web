import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface Role {
    id: number;
    name: string;
}

interface Facility {
    id: number;
    name: string;
}

interface EditUserProps {
    userId: number;
    currentEmail: string;
    currentName: string;
    currentSurname: string;
    currentPhoneNumber: string;
    currentRoleId: number;
    currentFacilityId: number;
    onUpdated: (updatedUser: any) => void;
    onCancel: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, currentEmail, currentName, currentSurname, currentPhoneNumber, currentRoleId, currentFacilityId, onUpdated, onCancel }) => {
    const [email, setEmail] = useState(currentEmail);
    const [name, setName] = useState(currentName);
    const [surname, setSurname] = useState(currentSurname);
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
    const [roleId, setRoleId] = useState(currentRoleId);
    const [facilityId, setFacilityId] = useState(currentFacilityId);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [adminInFacility, setAdminInFacility] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

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
                    },
                });
                const data = await res.json();
                setFacilities(data);
            } catch (err) {
                console.error('Błąd podczas pobierania obiektów');
            }
        };
        const fetchRoles = async () => {
            try {
                const res = await fetch('/api/roles', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setRoles(data);
            } catch (err) {
                console.error('Błąd podczas pobierania ról');
            }
        };
        fetchFacilities();
        fetchRoles();
    }, [token]);

    useEffect(() => {
        if (roleId === 2 && adminInFacility && adminInFacility !== 0) {
            setFacilityId(adminInFacility);
        }
    }, [roleId, adminInFacility]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const bodyData: any = { email, roleId, };

        if (roleId === 1) {
            bodyData.name = name;
            bodyData.surname = surname;
            bodyData.phoneNumber = phoneNumber;
        }
        else {
            bodyData.facilityId = facilityId;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });
            if (response.ok) {
                const updatedUser = await response.json();
                onUpdated(updatedUser);
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
                    <label>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} required className="info-input" />

                    <label>Rola</label>
                    <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="info-input">
                        <option value="">Wybierz rolę</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    {roleId === 1 && (
                        <>
                            <div>
                                <label>Imię</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} required className="info-input" />
                            </div>
                            <div>
                                <label>Nazwisko</label>
                                <input value={surname} onChange={(e) => setSurname(e.target.value)} required className="info-input" />
                            </div>
                            <div>
                                <label>Numer telefonu</label>
                                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="info-input" />
                            </div>
                        </>
                    )}

                    {roleId === 2 && (
                        adminInFacility === 0 ? (
                            <div>
                                <label>Obiekt</label>
                                <select value={facilityId} onChange={(e) => setFacilityId(Number(e.target.value))} className="info-input">
                                    <option value="">Wybierz obiekt</option>
                                    {facilities.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label>Obiekt</label>
                                <input type="text" className="info-input" disabled value={facilities.find(f => f.id === facilityId)?.name || 'Twój obiekt'} />
                            </div>
                        )
                    )}
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

export default EditUser;
