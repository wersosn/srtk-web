import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';

interface DeleteReservationProps {
    reservationId: number;
    onDeleted: () => void;
}

const DeleteReservation: React.FC<DeleteReservationProps> = ({ reservationId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę rezerwację?')) { 
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                onDeleted();
            } else {
                const text = await response.text();
                setError(`Błąd: ${text || 'Nie udało się usunąć rezerwacji'}`);
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

export default DeleteReservation;
