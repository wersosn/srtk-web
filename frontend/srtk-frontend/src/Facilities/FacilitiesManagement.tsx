import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddFacility from './AddFacility';
import EditFacility from './EditFacility';
import DeleteFacility from './DeleteFacility';

type Facility = {
    id: number;
    name: string;
    city: string;
    address: string;
};

function FacilitiesManagement() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [showDetails, setShowDetails] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich obiektów z bazy:
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/facilities', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Błąd podczas pobierania obiektów');
                }
                const data = await res.json();
                setFacilities(data);
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd');
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    // Obsługa dodawania obiektu:
    const handleAdd = (newFacility: Facility) => {
        setFacilities(prev => [...prev, newFacility]);
    };

    // Obsługa edycji obiektu:
    const handleEdit = (updated: Facility) => {
        const updatedFacility = facilities.map(r => r.id === updated.id ? updated : r);
        setFacilities(updatedFacility);
        setEditingFacility(null);
    };

    // Obsługa usuwania obiektu:
    const handleDelete = (id: number) => {
        setFacilities(prevFacility => prevFacility.filter(facility => facility.id !== id));
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">Zarządzanie obiektami</h2>
            <hr />

            {loading ? (
                <p>Ładowanie obiektów...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista obiektów</h5>
                    <ul className="list-group">
                        {facilities.map((facility) => (
                            <li key={facility.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === facility.id ? null : facility))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {facility.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingFacility(facility)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteFacility facilityId={facility.id} onDeleted={() => handleDelete(facility.id)} />
                                    </div>
                                </div>

                                {showDetails?.id === facility.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div><strong>Miasto:</strong> {facility.city} <br/> <strong>Adres:</strong> {facility.address}</div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingFacility ? (
                        <>
                            <h5 className="mt-4">Edycja obiektu</h5>
                            <EditFacility facilityId={editingFacility.id} currentName={editingFacility.name} currentCity={editingFacility.city} currentAddress={editingFacility.address} onUpdated={handleEdit} onCancel={() => setEditingFacility(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowy obiekt</h5>
                            <AddFacility onAddFacility={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default FacilitiesManagement;