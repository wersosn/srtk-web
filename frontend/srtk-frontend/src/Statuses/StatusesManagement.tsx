import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddStatus from './AddStatus';
import EditStatus from './EditStatus';
import DeleteStatus from './DeleteStatus';
import type { Status } from '../Types/Types';
import { useTranslation } from "react-i18next";

function StatusesManagement() {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Pobieranie wszystkich statusów z bazy:
    const fetchStatuses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/statuses', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(t("api.statusError"));
            }
            const data = await res.json();
            setStatuses(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatuses();
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

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.statusM")}</h2>
            <hr />

            {loading ? (
                <p>{t("status.loading")}</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">{t("status.list")}</h5>
                    <ul className="list-group">
                        {statuses.map((status) => (
                            <li key={status.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {status.name}
                                <div className="d-flex gap-2">
                                    <button onClick={() => setEditingStatus(status)} disabled={loading} className="icon-button">
                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }}/>
                                    </button>
                                    <DeleteStatus statusId={status.id} onDeleted={fetchStatuses} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingStatus ? (
                        <>
                            <h5 className="mt-4">{t("status.edit")}</h5>
                            <EditStatus statusId={editingStatus.id} currentName={editingStatus.name} onUpdated={handleEdit} onCancel={() => setEditingStatus(null)}/>
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("status.add")}</h5>
                            <AddStatus onAddStatus={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default StatusesManagement;