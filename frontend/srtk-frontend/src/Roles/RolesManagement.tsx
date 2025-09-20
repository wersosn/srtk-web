import { useState } from 'react';
import AddRole from './AddRole';
import EditRole from './EditRole';
import DeleteRole from './DeleteRole';
import editIcon from '../assets/edit.png';
import type { Role } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useRoles } from '../Hooks/useRoles';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePagination } from '../Hooks/usePagination';
import Pagination from '../Pagination/Pagination';

function RoleManagement() {
    const token = localStorage.getItem('token');
    const { roles, setRoles, loading, error } = useRoles(token);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(roles, elementsPerPage);
    const sortedRoles = [...paginatedItems].sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    const handleAdd = (newRole: Role) => {
        setRoles(prev => [...prev, newRole]);
    };

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
                        {sortedRoles.map((role) => (
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

                   <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                        t={t} />

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