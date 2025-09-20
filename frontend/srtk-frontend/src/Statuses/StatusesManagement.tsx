import { useState } from 'react';
import editIcon from '../assets/edit.png';
import AddStatus from './AddStatus';
import EditStatus from './EditStatus';
import DeleteStatus from './DeleteStatus';
import type { Status } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useStatuses } from '../Hooks/useStatuses';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePagination } from '../Hooks/usePagination';
import Pagination from '../Pagination/Pagination';

function StatusesManagement() {
    const token = localStorage.getItem('token');
    const { statuses, setStatuses, loading, error } = useStatuses(token);
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(statuses, elementsPerPage);
    const sortedStatuses = [...paginatedItems].sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    const handleAdd = (newStatus: Status) => {
        setStatuses(prev => [...prev, newStatus]);
    };

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
                        {sortedStatuses.map((status) => (
                            <li key={status.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {status.name}
                                <div className="d-flex gap-2">
                                    <button onClick={() => setEditingStatus(status)} disabled={loading} className="icon-button">
                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    <DeleteStatus statusId={status.id} onDeleted={() => setStatuses(prev => prev.filter(r => r.id !== status.id))} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                        t={t} />

                    <hr />
                    {editingStatus ? (
                        <>
                            <h5 className="mt-4">{t("status.edit")}</h5>
                            <EditStatus statusId={editingStatus.id} currentName={editingStatus.name} onUpdated={handleEdit} onCancel={() => setEditingStatus(null)} />
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