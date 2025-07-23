import { useState, useEffect } from 'react';
import AddRole from './AddRole';
import DeleteRole from './DeleteRole';

type Role = {
    id: number;
    name: string;
};

function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
        fetchRoles();
    }, []);

    const handleAdd = (newRole: Role) => {
        setRoles(prev => [...prev, newRole]);
    };

    const handleEdit = (id: number) => {

    };

    const handleDelete = (id: number) => {
        setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
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
                                <DeleteRole roleId={role.id} onDeleted={() => handleDelete(role.id)} />
                            </li>
                        ))}
                    </ul>
                    <hr />
                    <AddRole onAddRole={handleAdd} />
                </>
            )}
        </div>
    );
}

export default RoleManagement;