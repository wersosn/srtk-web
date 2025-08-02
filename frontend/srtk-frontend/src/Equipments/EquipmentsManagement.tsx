import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';
import DeleteEquipment from './DeleteEquipment';
import { jwtDecode } from 'jwt-decode';

type Equipment = {
    id: number;
    name: string;
    type: string;
    cost: number;
    facilityId: number;
};

function EquipmentsManagement() {
    const [eqs, setEqs] = useState<Equipment[]>([]);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [showDetails, setShowDetails] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich torów z bazy:
    const fetchAllEqs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            let facilityId: number | undefined;

            if (token) {
                const decoded: any = jwtDecode(token);
                if (decoded && decoded.FacilityId) {
                    facilityId = parseInt(decoded.FacilityId, 10);
                }
            }
            console.log(facilityId);
            let url: string;

            if (!facilityId || facilityId === 0) {
                url = '/api/equipments';  // Wszystkie sprzęty
            } else {
                url = `/api/equipments/inFacility?facilityId=${facilityId}`;  // Sprzęty dla danego obiektu
            }

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Błąd podczas pobierania sprzętów');
            }
            const data = await res.json();
            setEqs(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEqs();
    }, []);

    // Obsługa dodawania sprzętu:
    const handleAdd = (newEquipment: Equipment) => {
        setEqs(prev => [...prev, newEquipment]);
    };

    // Obsługa edycji sprzętu:
    const handleEdit = (updated: Equipment) => {
        const updatedEquipment = eqs.map(r => r.id === updated.id ? updated : r);
        setEqs(updatedEquipment);
        setEditingEquipment(null);
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">Zarządzanie sprzętem</h2>
            <hr />

            {loading ? (
                <p>Ładowanie sprzętu...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista sprzętów</h5>
                    <ul className="list-group">
                        {eqs.map((Equipment) => (
                            <li key={Equipment.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === Equipment.id ? null : Equipment))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {Equipment.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingEquipment(Equipment)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteEquipment equipmentId={Equipment.id} onDeleted={fetchAllEqs} />
                                    </div>
                                </div>

                                {showDetails?.id === Equipment.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div><strong>Rodzaj:</strong> {Equipment.type} <br /> <strong>Cena:</strong> {Equipment.cost} <br /> <strong>Obiekt:</strong> {Equipment.facilityId}</div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingEquipment ? (
                        <>
                            <h5 className="mt-4">Edycja toru</h5>
                            <EditEquipment equipmentId={editingEquipment.id} currentName={editingEquipment.name} currentType={editingEquipment.type} currentCost={editingEquipment.cost} currentFacilityId={editingEquipment.facilityId} onUpdated={handleEdit} onCancel={() => setEditingEquipment(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowy tor</h5>
                            <AddEquipment onAddEquipment={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default EquipmentsManagement;