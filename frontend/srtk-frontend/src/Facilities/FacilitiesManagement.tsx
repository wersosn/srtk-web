import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddFacility from './AddFacility';
import EditFacility from './EditFacility';
import DeleteFacility from './DeleteFacility';
import type { Facility } from '../Types/Types';
import { useTranslation } from "react-i18next";

function FacilitiesManagement() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [showDetails, setShowDetails] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Pobieranie wszystkich obiektów z bazy:
    const fetchFacilities = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/facilities', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(t("api.facilityError"));
            }
            const data = await res.json();
            setFacilities(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.facilityM")}</h2>
            <hr />

            {loading ? (
                <p>{t("facility.loading")}</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">{t("facility.list")}</h5>
                    <ul className="list-group">
                        {facilities.map((facility) => (
                            <li key={facility.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === facility.id ? null : facility))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {facility.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingFacility(facility)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteFacility facilityId={facility.id} onDeleted={fetchFacilities} />
                                    </div>
                                </div>

                                {showDetails?.id === facility.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div>
                                            <strong>{t("facility.city")}:</strong> {facility.city} <br/> 
                                            <strong>{t("facility.address")}:</strong> {facility.address}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingFacility ? (
                        <>
                            <h5 className="mt-4">{t("facility.edit")}</h5>
                            <EditFacility facilityId={editingFacility.id} currentName={editingFacility.name} currentCity={editingFacility.city} currentAddress={editingFacility.address} onUpdated={handleEdit} onCancel={() => setEditingFacility(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("facility.add")}</h5>
                            <AddFacility onAddFacility={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default FacilitiesManagement;