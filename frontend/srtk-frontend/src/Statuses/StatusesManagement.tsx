import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddStatus from './AddStatus';
import EditStatus from './EditStatus';
import DeleteStatus from './DeleteStatus';

type Status = {
    id: number;
    name: string;
};

function StatusesManagement() {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich statusów z bazy:
    useEffect(() => {
        const fetchstatuses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/statuses', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Błąd podczas pobierania statusów');
                }
                const data = await res.json();
                setStatuses(data);
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd');
            } finally {
                setLoading(false);
            }
        };
        fetchstatuses();
    }, []);

    // Obsługa dodawania statusu:
    const handleAdd = (newStatus: Status) => {
        setStatuses(prev => [...prev, newStatus]);
    };

    // Obsługa edycji statusu:
    const handleEdit = (updated: Status) => {
        const updatedStatus = statuses.map(r => r.id === updated.id ? updated : r);
        setStatuses(updatedStatus);
        setEditingStatus(null);
    };

    // Obsługa usuwania statusu:
    const handleDelete = (id: number) => {
        setStatuses(prevStatuses => prevStatuses.filter(Status => Status.id !== id));
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">Zarządzanie statusami</h2>
            <hr />

            {loading ? (
                <p>Ładowanie statusów...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista statusów</h5>
                    <ul className="list-group">
                        {statuses.map((status) => (
                            <li key={status.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {status.name}
                                <div className="d-flex gap-2">
                                    <button onClick={() => setEditingStatus(status)} disabled={loading} className="icon-button">
                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }}/>
                                    </button>
                                    <DeleteStatus statusId={status.id} onDeleted={() => handleDelete(status.id)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingStatus ? (
                        <>
                            <h5 className="mt-4">Edycja statusu</h5>
                            <EditStatus statusId={editingStatus.id} currentName={editingStatus.name} onUpdated={handleEdit} onCancel={() => setEditingStatus(null)}/>
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowy status</h5>
                            <AddStatus onAddStatus={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default StatusesManagement;