import { useState } from 'react';
import editIcon from '../assets/edit.png';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';
import type { Client, Admin } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useClients } from '../Hooks/useClients';
import { useAdmins } from '../Hooks/useAdmins';
import { useAuth } from './AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePagination } from '../Hooks/usePagination';
import Pagination from '../Pagination/Pagination';

function UserManagement() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [editingUser, setEditingUser] = useState<Client | Admin | null>(null);
    const [showDetails, setShowDetails] = useState<Client | Admin | null>(null);
    const { clients, setClients, loadingClients, error, refreshClients } = useClients(token);
    const { admins, setAdmins, loadingAdmins, errorAdmin, refreshAdmins } = useAdmins(token);
    const { elementsPerPage } = useUserPreferences(userId!, token, t);

    const {
        currentPage: currentClientPage,
        totalPages: totalClientPages,
        paginatedItems: paginatedClients,
        setCurrentPage: setCurrentClientPage
    } = usePagination(clients, elementsPerPage);

    const {
        currentPage: currentAdminPage,
        totalPages: totalAdminPages,
        paginatedItems: paginatedAdmins,
        setCurrentPage: setCurrentAdminPage
    } = usePagination(admins, elementsPerPage);

    const handleEdit = (updated: Client | Admin) => {
        if (updated.roleId === 1) {
            setAdmins(prev => prev.filter(a => a.id !== updated.id));
            setClients(prev => {
                const exists = prev.some(c => c.id === updated.id);
                if (exists) {
                    return prev.map(c => (c.id === updated.id ? updated as Client : c));
                } else {
                    return [...prev, updated as Client];
                }
            });
            refreshClients();
        } else {
            setClients(prev => prev.filter(c => c.id !== updated.id));
            setAdmins(prev => {
                const exists = prev.some(a => a.id === updated.id);
                if (exists) {
                    return prev.map(a => (a.id === updated.id ? updated as Admin : a));
                } else {
                    return [...prev, updated as Admin];
                }
            });
            refreshAdmins();
        }

        if (showDetails?.id === updated.id) {
            setShowDetails({ ...updated });
        }
        setEditingUser(null);
    };

    const handleDelete = (id: number, roleId: number) => {
        if (roleId === 1) {
            setClients(prev => prev.filter(c => c.id !== id));
        } else {
            setAdmins(prev => prev.filter(a => a.id !== id));
        }
        if (editingUser?.id === id) setEditingUser(null);
        if (showDetails?.id === id) setShowDetails(null);
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.userM")}</h2>
            <hr />
            <>
                {error && <p className="text-danger">{error}</p>}
                {errorAdmin && <p className="text-danger">{errorAdmin}</p>}

                <h5 className="mt-4">{t("user.clients")}</h5>
                {loadingClients ? (
                    <p>{t("admin.clientsLoading")}.</p>
                ) : (
                    <>
                        <ul className="list-group mb-4">
                            {paginatedClients.map(client => (
                                <li key={client.id} className="list-group-item p-0">
                                    <div
                                        onClick={() => setShowDetails(prev => (prev?.id === client.id ? null : client))}
                                        className="d-flex justify-content-between align-items-center px-3 py-2"
                                    >
                                        {client.email}
                                        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setEditingUser(client)} className="icon-button">
                                                <img src={editIcon} alt="Edytuj" style={{ width: 16, height: 16 }} />
                                            </button>
                                            <DeleteUser userId={client.id} onDeleted={() => handleDelete(client.id, 1)} />
                                        </div>
                                    </div>

                                    {showDetails?.id === client.id && (
                                        <div className="mt-2 ps-2 details">
                                            <strong>{t("user.name")}:</strong> {client.name} <br />
                                            <strong>{t("user.surname")}:</strong> {client.surname} <br />
                                            <strong>{t("user.phoneNumber")}:</strong> {client.phoneNumber}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            currentPage={currentClientPage}
                            totalPages={totalClientPages}
                            onPageChange={(newPage) => setCurrentClientPage(newPage)}
                            t={t} />
                    </>
                )}
                <br />

                <h5>{t("user.admins")}</h5>
                {loadingAdmins ? (
                    <p>{t("admin.adminsLoading")}</p>
                ) : (
                    <>
                        <ul className="list-group">
                            {paginatedAdmins.map(admin => (
                                <li key={admin.id} className="list-group-item p-0">
                                    <div
                                        onClick={() => setShowDetails(prev => (prev?.id === admin.id ? null : admin))}
                                        className="d-flex justify-content-between align-items-center px-3 py-2">
                                        {admin.email}
                                        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setEditingUser(admin)} className="icon-button">
                                                <img src={editIcon} alt="Edytuj" style={{ width: 16, height: 16 }} />
                                            </button>
                                            <DeleteUser userId={admin.id} onDeleted={() => handleDelete(admin.id, admin.roleId)} />
                                        </div>
                                    </div>

                                    {showDetails?.id === admin.id && (
                                        <div className="mt-2 ps-2 details">
                                            <em>Admin</em> <br />
                                            <strong>{t("user.facilityId")}:</strong> {admin.facilityId}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            currentPage={currentAdminPage}
                            totalPages={totalAdminPages}
                            onPageChange={(newPage) => setCurrentAdminPage(newPage)}
                            t={t} />
                    </>
                )}

                <hr />
                {editingUser && (
                    <>
                        <h5 className="mt-4">{t("user.edit")}</h5>
                        {editingUser.roleId === 1 ? (
                            <EditUser
                                userId={editingUser.id}
                                currentEmail={editingUser.email}
                                currentName={(editingUser as Client).name}
                                currentSurname={(editingUser as Client).surname}
                                currentPhoneNumber={(editingUser as Client).phoneNumber}
                                currentRoleId={editingUser.roleId}
                                currentFacilityId={0}
                                onUpdated={handleEdit}
                                onCancel={() => setEditingUser(null)}
                            />
                        ) : (
                            <EditUser
                                userId={editingUser.id}
                                currentEmail={editingUser.email}
                                currentName={''}
                                currentSurname={''}
                                currentPhoneNumber={''}
                                currentRoleId={editingUser.roleId}
                                currentFacilityId={(editingUser as Admin).facilityId}
                                onUpdated={handleEdit}
                                onCancel={() => setEditingUser(null)}
                            />
                        )}
                    </>
                )}
            </>
        </div>
    );
}

export default UserManagement;