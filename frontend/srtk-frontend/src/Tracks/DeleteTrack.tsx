import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';

interface DeleteTrackProps {
    trackId: number;
    onDeleted: () => void;
}

const DeleteTrack: React.FC<DeleteTrackProps> = ({ trackId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten tor?')) { 
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tracks/${trackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                onDeleted();
            } else {
                const text = await response.text();
                setError(`Błąd: ${text || 'Nie udało się usunąć toru'}`);
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

export default DeleteTrack;