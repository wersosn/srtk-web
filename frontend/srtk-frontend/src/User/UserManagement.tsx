import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';


type User = {
    id: number;
    email: string;
    password: string;
    roleId: number;
}

type Client = User & {
  name: string;
  surname: string;
  phoneNumber: string;
};

type Admin = User & {
  facilityId: number;
}

function UserManagement() {
    const [users, setUsers] = useState<(User | Client | Admin)[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showDetails, setShowDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich użytkowników z bazy:
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error('Fetch error:', res.status, text);
                    throw new Error('Błąd podczas pobierania użytkowników');
                }
                const data = await res.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd');
            } finally {
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    // Obsługa dodawania użytkownika:
    const handleAdd = (newUser: User | Client | Admin) => {
        setUsers(prev => [...prev, newUser]);
    };

    // Obsługa edycji uzytkownika:
    const handleEdit = (updated: User | Client | Admin) => {
        const updatedUser = users.map(r => r.id === updated.id ? updated : r);
        setUsers(updatedUser);
        setEditingUser(null);
    };

    // Obsługa usuwania użytkownika:
    const handleDelete = (id: number) => {
        setUsers(prevUser => prevUser.filter(User => User.id !== id));
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">Zarządzanie użytkownikami</h2>
            <hr />

            {loading ? (
                <p>Ładowanie użytkowników...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista użytkowników</h5>
                    <ul className="list-group">
                        {users.map((user) => (
                            <li key={user.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === user.id ? null : user))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {user.email}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingUser(user)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        {/*Usuwanie*/}
                                    </div>
                                </div>

                                {showDetails?.id === user.id && (
                                    <div className="mt-2 ps-2 details">
                                        {user.roleId === 1 ? (
                                            <>
                                                <strong>Imię:</strong> <br />
                                                <strong>Nazwisko:</strong> <br /> {/*Dopisać dane*/}
                                            </>
                                        ) : (
                                            <em>Admin</em>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingUser ? (
                        <>
                            <h5 className="mt-4">Edycja użytkownika</h5>
                            {/*Edycja*/}
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowy użytkownik</h5>
                            {/*Dodawanie?*/}
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default UserManagement;