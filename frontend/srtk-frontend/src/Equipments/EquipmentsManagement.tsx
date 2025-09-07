import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';
import DeleteEquipment from './DeleteEquipment';
import FilterEquipments from '../Filters/FilterEquipment';
import type { Equipment } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useAuth } from '../User/AuthContext';
import { useEquipmentsAdmin } from '../Hooks/useEquipmentsAdmin';
import { usePrefersDark } from '../Hooks/usePrefersDark';
import { useUserPreferences } from '../Hooks/useUserPreferences';

function EquipmentsManagement() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId, facilityId } = useAuth();
    const { equipmentList, setEquipmentList, loading, error } = useEquipmentsAdmin(facilityId!, token!);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [showDetails, setShowDetails] = useState<Equipment | null>(null);
    const [filteredEqs, setFilteredEqs] = useState<Equipment[]>(equipmentList);

    // Obsługa ilości elementów na stronie:
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const startIndex = (currentPage - 1) * elementsPerPage;
    const endIndex = startIndex + elementsPerPage;
    const paginatedEqs = filteredEqs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredEqs.length / elementsPerPage);

    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;

    // Obsługa dodawania sprzętu:
    const handleAdd = (newEquipment: Equipment) => {
        setEquipmentList(prev => [...prev, newEquipment]);
    };

    // Obsługa edycji sprzętu:
    const handleEdit = (updated: Equipment) => {
        const updatedEquipment = equipmentList.map(r => r.id === updated.id ? updated : r);
        setEquipmentList(updatedEquipment);
        setEditingEquipment(null);
    };

    // Obsługa filtrowania:
    const handleFilterChange = (facilityId?: number) => {
        let result = equipmentList;
        if (facilityId) {
            result = result.filter(t => t.facilityId === facilityId);
        }
        setFilteredEqs(result);
        setCurrentPage(1);
    };

    useEffect(() => {
        setFilteredEqs(equipmentList);
    }, [equipmentList]);

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.eqM")}</h2>
            <hr />
            {(facilityId == 0 || !facilityId) && (
                <>
                    <h5 className="mt-4">{t("filters.title")}</h5>
                    <FilterEquipments equipments={equipmentList} onFilterChange={handleFilterChange} />
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
                        {paginatedEqs.map((Equipment) => (
                            <li key={Equipment.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === Equipment.id ? null : Equipment))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {Equipment.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingEquipment(Equipment)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteEquipment equipmentId={Equipment.id} onDeleted={() => setEquipmentList(prev => prev.filter(r => r.id !== Equipment.id))} />
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

                    <div className="pagination-container">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="icon-button" title={t("universal.prev")}>
                            <img src={arrowL} alt="Poprzednia strona" style={{ width: '24px', height: '24px' }} />
                        </button>
                        <span className="page-info">
                            {currentPage}
                        </span>
                        <span className="page-info">
                            /
                        </span>
                        <span className="page-info">
                            {totalPages}
                        </span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="icon-button" title={t("universal.next")}>
                            <img src={arrowR} alt="Następna strona" style={{ width: '24px', height: '24px' }} />
                        </button>
                    </div>

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