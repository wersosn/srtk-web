import React, { useState } from 'react';

interface EditMyInfoProps {
    userId: number;
    currentEmail: string;
    currentName: string;
    currentSurname: string;
    currentPhoneNumber: string;
    onUpdated: (updatedUser: any) => void;
}

const EditMyInfo: React.FC<EditMyInfoProps> = ({ userId, currentEmail, currentName, currentSurname, currentPhoneNumber, onUpdated }) => {
    const [email, setEmail] = useState(currentEmail);
    const [name, setName] = useState(currentName);
    const [surname, setSurname] = useState(currentSurname);
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setMessage('Brak tokena – zaloguj się ponownie.');
            return;
        }

        const bodyData: any = { email, name, surname, phoneNumber };

        try {
            const response = await fetch(`/api/users/clients/${userId}`, {
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
                    <label htmlFor="userEmail">Email</label>
                    <input id="userEmail" value={email} onChange={e => setEmail(e.target.value)} required className="info-input" />
                    <div>
                        <label htmlFor="userName">Imię</label>
                        <input id="userName" value={name} onChange={(e) => setName(e.target.value)} required className="info-input" />
                    </div>
                    <div>
                        <label htmlFor="userSurname">Nazwisko</label>
                        <input id="userSurname" value={surname} onChange={(e) => setSurname(e.target.value)} required className="info-input" />
                    </div>
                    <div>
                        <label htmlFor="userPhone">Numer telefonu</label>
                        <input id="userPhone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="info-input" />
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit">Zapisz zmiany</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditMyInfo;
