import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';
import { jwtDecode } from 'jwt-decode';
import type { Client, Admin } from '../Types/Types';
import { useTranslation } from "react-i18next";

function UserManagement() {
    const [clients, setClients] = useState<Client[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [editingUser, setEditingUser] = useState<Client | Admin | null>(null);
    const [showDetails, setShowDetails] = useState<Client | Admin | null>(null);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [facilityId, setFacilityId] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded: any = jwtDecode(token);
            const id = parseInt(decoded.FacilityId);
            if (!isNaN(id)) {
                setFacilityId(id);
            }
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [facilityId]);

    // Ładowanie klientów:
    const fetchClients = () => {
        const token = localStorage.getItem('token');
        setLoadingClients(true);
        fetch('/api/users/clients', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error(t("api.clientsError"));
                return res.json();
            })
            .then(data => setClients(data))
            .catch(err => setError(err.message))
            .finally(() => setLoadingClients(false));
    };

    // Ładowanie adminów:
    const fetchAdmins = () => {
        if (facilityId === null) return;
        const token = localStorage.getItem('token');
        setLoadingAdmins(true);
        fetch('/api/users/admins', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error(t("api.adminsError"));
                return res.json();
            })
            .then(data => {
                setAdmins(facilityId === 0 ? data : data.filter((admin: { facilityId: number }) => admin.facilityId === facilityId));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoadingAdmins(false));
    };

    // Edycja użytkownika:
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
        }

        fetchClients();
        fetchAdmins();
        if (showDetails?.id === updated.id) {
            setShowDetails({ ...updated });
        }
        setEditingUser(null);
    };

    // Usuwanie użytkownika:
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

                <h5 className="mt-4">{t("user.clients")}</h5>
                {loadingClients ? (
                    <p>{t("admin.clientsLoading")}.</p>
                ) : (
                    <ul className="list-group mb-4">
                        {clients.map(client => (
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
                )}

                <h5>{t("user.admins")}</h5>
                {loadingAdmins ? (
                    <p>{t("admin.adminsLoading")}</p>
                ) : (
                    <ul className="list-group">
                        {admins.map(admin => (
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
                                        <strong>{t("user.faclityId")}:</strong> {admin.facilityId}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
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