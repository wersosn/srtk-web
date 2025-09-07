import { useState } from 'react';
import AddRole from './AddRole';
import EditRole from './EditRole';
import DeleteRole from './DeleteRole';
import editIcon from '../assets/edit.png';
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import type { Role } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useRoles } from '../Hooks/useRoles';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePrefersDark } from '../Hooks/usePrefersDark';

function RoleManagement() {
    const token = localStorage.getItem('token');
    const { roles, setRoles, loading, error } = useRoles(token);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const { t } = useTranslation();
    const { userId } = useAuth();

    // Obsługa ilości elementów na stronie:
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const startIndex = (currentPage - 1) * elementsPerPage;
    const endIndex = startIndex + elementsPerPage;
    const paginatedRoles = roles.slice(startIndex, endIndex);
    const totalPages = Math.ceil(roles.length / elementsPerPage);

    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;

    // Obsługa dodawania roli:
    const handleAdd = (newRole: Role) => {
        setRoles(prev => [...prev, newRole]);
    };

    // Obsługa edycji roli:
    const handleEdit = (updated: Role) => {
        const updatedRole = roles.map(r => r.id === updated.id ? updated : r);
        setRoles(updatedRole);
        setEditingRole(null);
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.roleM")}</h2>
            <hr />

            {loading ? (
                <p>{t("role.loading")}</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">{t("role.list")}</h5>
                    <ul className="list-group">
                        {paginatedRoles.map((role) => (
                            <li key={role.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {role.name}
                                <div className="d-flex gap-2">
                                    <button onClick={() => setEditingRole(role)} disabled={loading} className="icon-button">
                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    <DeleteRole roleId={role.id} onDeleted={() => setRoles(prev => prev.filter(r => r.id !== role.id))} />
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
                    {editingRole ? (
                        <>
                            <h5 className="mt-4">{t("role.edit")}</h5>
                            <EditRole roleId={editingRole.id} currentName={editingRole.name} onUpdated={handleEdit} onCancel={() => setEditingRole(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("role.add")}</h5>
                            <AddRole onAddRole={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default RoleManagement;