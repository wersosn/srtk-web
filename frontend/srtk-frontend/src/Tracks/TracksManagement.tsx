import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddTrack from './AddTrack';
import EditTrack from './EditTrack';
import DeleteTrack from './DeleteTrack';
import FilterTracks from '../Filters/FilterTracks';
import { jwtDecode } from 'jwt-decode';
import type { Track } from '../Types/Types';
import { getAllTracksForAdmin } from '../Services/Api';
import { useTranslation } from "react-i18next";

function TrackManagement() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [facilityId, setFacilityId] = useState<number | undefined>();
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [showDetails, setShowDetails] = useState<Track | null>(null);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    useEffect(() => {
        if (token) {
            const decoded: any = jwtDecode(token);
            if (decoded?.FacilityId) {
                setFacilityId(parseInt(decoded.FacilityId, 10));
            }
        }
    }, [token]);

    const fetchAllTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                return;
            }
            const decoded: any = jwtDecode(token);
            const facilityIdFromToken = decoded?.FacilityId ? parseInt(decoded.FacilityId, 10) : 0;

            const data = await getAllTracksForAdmin(facilityIdFromToken, token);
            setTracks(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTracks()
    }, []);

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
                        {filteredTracks.map((track) => (
                            <li key={track.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === track.id ? null : track))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {track.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingTrack(track)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteTrack trackId={track.id} onDeleted={fetchAllTracks} />
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