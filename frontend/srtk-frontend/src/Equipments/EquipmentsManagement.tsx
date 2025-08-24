import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';
import DeleteEquipment from './DeleteEquipment';
import FilterEquipments from '../Filters/FilterEquipment';
import { jwtDecode } from 'jwt-decode';
import type { Equipment } from '../Types/Types';
import { useTranslation } from "react-i18next";

function EquipmentsManagement() {
    const [eqs, setEqs] = useState<Equipment[]>([]);
    const [facilityId, setFacilityId] = useState<number | undefined>();
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [showDetails, setShowDetails] = useState<Equipment | null>(null);
    const [filteredEqs, setFilteredEqs] = useState<Equipment[]>(eqs);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Pobieranie wszystkich torów z bazy:
    const fetchAllEqs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');

            if (token) {
                const decoded: any = jwtDecode(token);
                if (decoded && decoded.FacilityId) {
                    setFacilityId(parseInt(decoded.FacilityId, 10));
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
                throw new Error(t("api.eqError"));
            }
            const data = await res.json();
            setEqs(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
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

    // Obsługa filtrowania:
    const handleFilterChange = (facilityId?: number) => {
        let result = eqs;
        if (facilityId) {
            result = result.filter(t => t.facilityId === facilityId);
        }
        setFilteredEqs(result);
    };

    useEffect(() => {
        setFilteredEqs(eqs);
    }, [eqs]);

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.eqM")}</h2>
            <hr />
            {(facilityId == 0 || !facilityId) && (
                <>
                    <h5 className="mt-4">{t("filters.title")}</h5>
                    <FilterEquipments equipments={eqs} onFilterChange={handleFilterChange} />
                </>
            )}

            {loading ? (
                <p>{t("eq.loading")}</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">{t("eq.list")}</h5>
                    <ul className="list-group">
                        {filteredEqs.map((Equipment) => (
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
                                        <div>
                                            <strong>{t("eq.type")}:</strong> {Equipment.type} <br />
                                            <strong>{t("eq.cost")}:</strong> {Equipment.cost} <br />
                                            <strong>{t("eq.facilityId")}:</strong> {Equipment.facilityId}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingEquipment ? (
                        <>
                            <h5 className="mt-4">{t("eq.edit")}</h5>
                            <EditEquipment
                                equipmentId={editingEquipment.id}
                                currentName={editingEquipment.name}
                                currentType={editingEquipment.type}
                                currentCost={editingEquipment.cost}
                                currentFacilityId={editingEquipment.facilityId}
                                onUpdated={handleEdit}
                                onCancel={() => setEditingEquipment(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("eq.add")}</h5>
                            <AddEquipment onAddEquipment={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default EquipmentsManagement;