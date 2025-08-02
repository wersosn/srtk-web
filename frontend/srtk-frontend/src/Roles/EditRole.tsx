import React, { useState } from 'react';

interface EditRoleProps {
    roleId: number;
    currentName: string;
    onUpdated: (updatedRole: { id: number; name: string }) => void;
    onCancel: () => void;
}

const EditRole: React.FC<EditRoleProps> = ({ roleId, currentName, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
            if (response.ok) {
                const updatedRole = await response.json();
                onUpdated(updatedRole);
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
                    <label htmlFor="roleName">Nazwa</label>
                    <input id="roleName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
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

export default EditRole;
