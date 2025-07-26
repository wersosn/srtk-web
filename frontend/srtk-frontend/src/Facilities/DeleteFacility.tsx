import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';

interface DeleteFacilityProps {
    facilityId: number;
    onDeleted: () => void;
}

const DeleteFacility: React.FC<DeleteFacilityProps> = ({ facilityId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten obiekt?')) { 
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/facilities/${facilityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                onDeleted();
            } else {
                const text = await response.text();
                setError(`Błąd: ${text || 'Nie udało się usunąć obiektu'}`);
            }
        } catch (err: any) {
            setError(`Błąd: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleDelete} disabled={loading} className="icon-button">
                <img src={deleteIcon} alt="Usuń" style={{ width: '16px', height: '16px' }}/>
            </button>
            {error && <div className="text-danger mt-1">{error}</div>}
        </>
    );
};

export default DeleteFacility;
