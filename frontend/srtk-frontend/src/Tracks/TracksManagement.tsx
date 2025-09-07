import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import AddTrack from './AddTrack';
import EditTrack from './EditTrack';
import DeleteTrack from './DeleteTrack';
import FilterTracks from '../Filters/FilterTracks';
import type { Track } from '../Types/Types';
import { useTranslation } from "react-i18next";
import { useAuth } from '../User/AuthContext';
import { useTracksAdmin } from '../Hooks/useTracksAdmin';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { usePrefersDark } from '../Hooks/usePrefersDark';

function TrackManagement() {
    const token = localStorage.getItem('token');
    const { userId, facilityId } = useAuth();
    const { tracks, setTracks, loading, error } = useTracksAdmin(token!, facilityId!);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [showDetails, setShowDetails] = useState<Track | null>(null);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);
    const { t } = useTranslation();

    // Obsługa ilości elementów na stronie:
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const startIndex = (currentPage - 1) * elementsPerPage;
    const endIndex = startIndex + elementsPerPage;
    const paginatedTracks = filteredTracks.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredTracks.length / elementsPerPage);

    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;

    // Obsługa dodawania toru:
    const handleAdd = (newTrack: Track) => {
        setTracks(prev => [...prev, newTrack]);
    };

    // Obsługa edycji toru:
    const handleEdit = (updated: Track) => {
        const updatedTrack = tracks.map(r => r.id === updated.id ? updated : r);
        setTracks(updatedTrack);
        setEditingTrack(null);
    };

    // Obsługa filtrowania:
    const handleFilterChange = (facilityId?: number) => {
        let result = tracks;
        if (facilityId) {
            result = result.filter(t => t.facilityId === facilityId);
        }
        setFilteredTracks(result);
        setCurrentPage(1);
    };

    useEffect(() => {
        setFilteredTracks(tracks);
    }, [tracks]);

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">{t("admin.trackM")}</h2>
            <hr />
            {(facilityId == 0 || !facilityId) && (
                <>
                    <h5 className="mt-4">{t("filters.title")}</h5>
                    <FilterTracks tracks={tracks} onFilterChange={handleFilterChange} />
                </>
            )}

            {loading ? (
                <p>{t("track.loading")}</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">{t("track.list")}</h5>
                    <ul className="list-group">
                        {paginatedTracks.map((track) => (
                            <li key={track.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === track.id ? null : track))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {track.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingTrack(track)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteTrack trackId={track.id} onDeleted={() => setTracks(prev => prev.filter(r => r.id !== track.id))} />
                                    </div>
                                </div>

                                {showDetails?.id === track.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div>
                                            <strong>{t("track.typeOfSurface")}:</strong> {track.typeOfSurface}
                                            <br /> <strong>{t("track.length")}:</strong> {track.length}
                                            <br /> <strong>{t("track.open")}:</strong> {track.openingHour}
                                            <br /> <strong>{t("track.close")}:</strong> {track.closingHour}
                                            <br /> <strong>{t("track.days")}:</strong> {track.availableDays}
                                            <br /> <strong>{t("track.facilityId")}:</strong> {track.facilityId}
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
                    {editingTrack ? (
                        <>
                            <h5 className="mt-4">{t("track.edit")}</h5>
                            <EditTrack trackId={editingTrack.id}
                                currentName={editingTrack.name}
                                currentTypeOfSurface={editingTrack.typeOfSurface}
                                currentLength={editingTrack.length}
                                currentOpeningHour={editingTrack.openingHour}
                                currentClosingHour={editingTrack.closingHour}
                                currentAvailableDays={editingTrack.availableDays}
                                currentFacilityId={editingTrack.facilityId}
                                onUpdated={handleEdit}
                                onCancel={() => setEditingTrack(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("track.add")}</h5>
                            <AddTrack onAddTrack={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default TrackManagement;