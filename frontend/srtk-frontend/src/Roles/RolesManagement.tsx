import { useState, useEffect } from 'react';
import AddRole from './AddRole';
import EditRole from './EditRole';
import DeleteRole from './DeleteRole';
import editIcon from '../assets/edit.png';
import type { Role } from '../Types/Types';

function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich ról z bazy:
    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/roles', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('Błąd podczas pobierania ról');
            }
            const data = await res.json();
            setRoles(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

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
            <h2 className="mb-3">Zarządzanie rolami</h2>
            <hr />

            {loading ? (
                <p>Ładowanie ról...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista ról</h5>
                    <ul className="list-group">
                        {roles.map((role) => (
                            <li key={role.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {role.name}
                                <div className="d-flex gap-2">
                                    <button onClick={() => setEditingRole(role)} disabled={loading} className="icon-button">
                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    <DeleteRole roleId={role.id} onDeleted={fetchRoles} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingRole ? (
                        <>
                            <h5 className="mt-4">Edycja roli</h5>
                            <EditRole roleId={editingRole.id} currentName={editingRole.name} onUpdated={handleEdit} onCancel={() => setEditingRole(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowa rola</h5>
                            <AddRole onAddRole={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default RoleManagement;