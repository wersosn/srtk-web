import { useState } from 'react';
import editIcon from '../assets/edit.png';
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import AddStatus from './AddStatus';
import EditStatus from './EditStatus';
import DeleteStatus from './DeleteStatus';
import type { Status } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useStatuses } from '../Hooks/useStatuses';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePrefersDark } from '../Hooks/usePrefersDark';
import { usePagination } from '../Hooks/usePagination';

function StatusesManagement() {
    const token = localStorage.getItem('token');
    const { statuses, setStatuses, loading, error } = useStatuses(token);
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(statuses, elementsPerPage);

    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;

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
                        {paginatedItems.map((status) => (
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

                    <div className="pagination-container">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="icon-button" title={t("universal.prev")}>
                            <img src={arrowL} alt="Poprzednia strona" style={{ width: '24px', height: '24px' }} />
                        </button>
                        <span className="page-info">
                            {currentPage}
                        </span>
                        <span className="page-info">
                            /
                        </span>
                        <span className="page-info">
                            {totalPages}
                        </span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="icon-button" title={t("universal.next")}>
                            <img src={arrowR} alt="Następna strona" style={{ width: '24px', height: '24px' }} />
                        </button>
                    </div>

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