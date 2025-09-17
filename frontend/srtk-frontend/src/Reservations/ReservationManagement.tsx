import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import downloadIconLight from '../assets/download-light.png';
import cancelIcon from "../assets/cancel.png";
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import FilterReservationsAdmin from '../Filters/FilterReservationsAdmin';
import type { Reservation } from '../Types/Types';
import { formatToDatetimeLocal } from './DateHelper';
import { getStatusName } from '../Services/GetNames';
import { useTranslation } from "react-i18next";
import { usePrefersDark } from '../Hooks/usePrefersDark';
import { useStatuses } from '../Hooks/useStatuses';
import { useTracksAdmin } from '../Hooks/useTracksAdmin';
import { useAuth } from '../User/AuthContext';
import { useAdminReservations } from '../Hooks/useAdminReservations';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { filterReservationsGrouped } from './FilterReservationsGrouped';
import Pagination from '../Pagination/Pagination';

function ReservationManagement() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { facilityId } = useAuth();
    const { statuses } = useStatuses(token);
    const { tracks } = useTracksAdmin(token!, facilityId!);
    const { reservationsByTrack, setReservationsByTrack, loading, error, setError, refreshReservations } = useAdminReservations(tracks, token, t);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [filteredReservations, setFilteredReservations] = useState<Record<number, Reservation[]>>(reservationsByTrack);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const [currentPages, setCurrentPages] = useState<Record<number, number>>({});

    const isDark = usePrefersDark();
    const icon = isDark ? downloadIconLight : downloadIcon;

    const handleFilterChange = (trackId?: number, statusId?: number, startDate?: string) => {
        setFilteredReservations(filterReservationsGrouped(reservationsByTrack, trackId, statusId, startDate));
    };

    useEffect(() => {
        setFilteredReservations(reservationsByTrack);
    }, [reservationsByTrack]);

    const handleEdit = (updated: Reservation) => {
        setReservationsByTrack(prev => {
            const trackReservations = prev[updated.trackId];
            const updatedReservation = trackReservations.map(r => r.id === updated.id ? updated : r);
            return {
                ...prev,
                [updated.trackId]: updatedReservation,
            };
        });
        setEditingReservation(null);
    };

    const handleCancel = async (reservationId: number) => {
        if (!window.confirm(t("reservation.cancelAlert"))) {
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            if (response.ok) {
                refreshReservations();
            } else {
                const error = await response.text();
                setError(t("universal.error") + error);
            }
        } catch (err: any) {
            setError(t("universal.error") + err.message);
        }
    }

    const handleExport = (trackId: number) => {
        window.location.href = `/api/reservations/export?trackId=${trackId}`;
    };

    // Obsługa zmiany strony (dla rezerwacji z każdego toru oddzielnie):
    const handlePageChange = (trackId: number, newPage: number, totalPages: number) => {
        setCurrentPages(prev => ({ ...prev, [trackId]: Math.max(1, Math.min(newPage, totalPages)) }));
    };

    return (
        <>
            <div className="admin-content p-4">
                <h2 className="mb-3">{t("reservation.reservationManagement")}</h2>
                <hr />
                <h5 className="mt-4">{t("filters.title")}</h5>
                <FilterReservationsAdmin
                    reservationsByTrack={reservationsByTrack}
                    tracks={tracks}
                    statuses={statuses}
                    onFilterChange={handleFilterChange} />


                {loading ? (
                    <p>{t("reservation.loading")}</p>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <>
                        <h5 className="mt-4">{t("reservation.list")}</h5>
                        {Object.entries(filteredReservations).map(([trackId, reservations]) => {
                            const track = tracks.find(t => t.id === Number(trackId));
                            const currentPage = currentPages[track!.id] || 1;
                            const startIndex = (currentPage - 1) * elementsPerPage;
                            const endIndex = startIndex + elementsPerPage;
                            const paginatedReservations = reservations.slice(startIndex, endIndex);
                            const totalPages = Math.ceil(reservations.length / elementsPerPage);

                            return (
                                <div key={trackId} style={{ marginBottom: '2rem' }}>
                                    <div className="d-flex flex-nowrap justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0" style={{ whiteSpace: 'nowrap' }}>
                                            <em>{track?.name || `ID: ${trackId}`}</em>:
                                        </h6>
                                        {reservations.length !== 0 && (
                                            <button onClick={() => handleExport(Number(trackId))} className="icon-button" title={t("reservation.exportExcel")}>
                                                <img src={icon} alt="Eksport" style={{ width: '20px', height: '20px' }} />
                                            </button>
                                        )}
                                    </div>
                                    <ul className="list-group">
                                        {paginatedReservations.length === 0 ? (
                                            <li className="list-group-item">{t("reservation.emptyList")}</li>
                                        ) : (
                                            paginatedReservations.map(reservation => (
                                                <li key={reservation.id} className="list-group-item p-0">
                                                    <div onClick={() => setShowDetails(prev => (prev?.id === reservation.id ? null : reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                                        {t("reservation.reserv")} {formatToDatetimeLocal(reservation.start)} - {formatToDatetimeLocal(reservation.end)}
                                                        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                                            {reservation.statusName !== "Anulowano" && new Date(reservation.start) >= new Date() && (
                                                                <>
                                                                    <button onClick={() => setEditingReservation(reservation)} disabled={loading} className="icon-button" title={t("universal.edit")}>
                                                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                                    </button>
                                                                    <button onClick={() => handleCancel(reservation.id)} disabled={loading} className="icon-button" title={t("universal.cancel")}>
                                                                        <img src={cancelIcon} alt="Anuluj" style={{ width: '16px', height: '16px' }} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <DeleteReservation reservationId={reservation.id} onDeleted={() => refreshReservations()} />
                                                        </div>
                                                    </div>

                                                    {showDetails?.id === reservation.id && (
                                                        <div className="mt-2 ps-2 details">
                                                            <div>
                                                                <strong>{t("reservation.trackId")}</strong> {reservation.trackId}<br />
                                                                <strong>{t("reservation.start")}</strong> {formatToDatetimeLocal(reservation.start)}<br />
                                                                <strong>{t("reservation.end")}</strong> {formatToDatetimeLocal(reservation.end)}<br />
                                                                <strong>{t("reservation.cost")}</strong> {reservation.cost}<br />
                                                                <strong>Status:</strong> {getStatusName(statuses, reservation.statusId, t)}<br />
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                    <Pagination
                                        currentPage={currentPages[track!.id] || 1}
                                        totalPages={totalPages}
                                        onPageChange={(newPage) => handlePageChange(track!.id, newPage, totalPages)}
                                        t={t}/>
                                </div>
                            );
                        })}
                        <hr />
                        {editingReservation && (
                            <>
                                <h5 className="mt-4">{t("reservation.edit")}</h5>
                                <EditReservation
                                    key={editingReservation.id}
                                    reservationId={editingReservation.id}
                                    currentStart={editingReservation.start}
                                    currentEnd={editingReservation.end}
                                    trackId={editingReservation.trackId}
                                    onUpdated={handleEdit}
                                    onCancel={() => setEditingReservation(null)} />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default ReservationManagement;