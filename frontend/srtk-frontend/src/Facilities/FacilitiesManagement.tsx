import { useState } from 'react';
import editIcon from '../assets/edit.png';
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import AddFacility from './AddFacility';
import EditFacility from './EditFacility';
import DeleteFacility from './DeleteFacility';
import type { Facility } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useFacilities } from '../Hooks/useFacilities';
import { useAuth } from '../User/AuthContext';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePrefersDark } from '../Hooks/usePrefersDark';

function FacilitiesManagement() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { facilities, setFacilities, loading, error } = useFacilities(token);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [showDetails, setShowDetails] = useState<Facility | null>(null);

    // Obsługa ilości elementów na stronie:
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const startIndex = (currentPage - 1) * elementsPerPage;
    const endIndex = startIndex + elementsPerPage;
    const paginatedFacilities = facilities.slice(startIndex, endIndex);
    const totalPages = Math.ceil(facilities.length / elementsPerPage);

    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;


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
                        {paginatedFacilities.map((facility) => (
                            <li key={facility.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === facility.id ? null : facility))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {facility.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingFacility(facility)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteFacility facilityId={facility.id} onDeleted={() => setFacilities(prev => prev.filter(r => r.id !== facility.id))} />
                                    </div>
                                </div>

                                {showDetails?.id === facility.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div>
                                            <strong>{t("facility.city")}:</strong> {facility.city} <br />
                                            <strong>{t("facility.address")}:</strong> {facility.address}
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