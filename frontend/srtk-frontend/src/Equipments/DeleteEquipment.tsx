import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';

interface DeleteEquipmentProps {
    equipmentId: number;
    onDeleted: () => void;
}

const DeleteEquipment: React.FC<DeleteEquipmentProps> = ({ equipmentId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten sprzęt?')) { 
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/equipments/${equipmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                onDeleted();
            } else {
                const text = await response.text();
                setError(`Błąd: ${text || 'Nie udało się usunąć sprzętu'}`);
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

export default DeleteEquipment;