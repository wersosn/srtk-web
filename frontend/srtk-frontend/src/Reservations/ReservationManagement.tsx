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
import { useTranslation } from "react-i18next";
import { usePrefersDark } from '../Hooks/usePrefersDark';
import { useStatuses } from '../Hooks/useStatuses';
import { useTracksAdmin } from '../Hooks/useTracksAdmin';
import { useAuth } from '../User/AuthContext';
import { useAdminReservations } from '../Hooks/useAdminReservations';

function ReservationManagement() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { facilityId } = useAuth();
    const { statuses } = useStatuses(token);
    const { tracks } = useTracksAdmin(token!, facilityId!);
    const { reservationsByTrack, setReservationsByTrack, loading, error, setError, refreshReservations } = useAdminReservations(tracks, token, t);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [filteredReservations, setFilteredReservations] = useState<Record<number, Reservation[]>>(reservationsByTrack);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);

    const isDark = usePrefersDark();
    const icon = isDark ? downloadIconLight : downloadIcon;

    // Obsługa filtrowania:
    const handleFilterChange = (trackId?: number, statusId?: number, startDate?: string) => {
        let result: Record<number, Reservation[]> = {};

        if (trackId) {
            const reservations = reservationsByTrack[trackId] || [];
            result[trackId] = reservations.filter(r => {
                let statusMatch = statusId ? r.statusId === statusId : true;
                let dateMatch = startDate ? new Date(r.start).toISOString().split('T')[0] === startDate : true;
                return statusMatch && dateMatch;
            });
        } else {
            Object.entries(reservationsByTrack).forEach(([id, reservations]) => {
                const filtered = reservations.filter(r => {
                    let statusMatch = statusId ? r.statusId === statusId : true;
                    let dateMatch = startDate ? new Date(r.start).toISOString().split('T')[0] === startDate : true;
                    return statusMatch && dateMatch;
                });
                result[Number(id)] = filtered;
            });
        }

        setFilteredReservations(result);
    };

    useEffect(() => {
        setFilteredReservations(reservationsByTrack);
    }, [reservationsByTrack]);

    // Obsługa edycji:
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

    // Obsługa anulowania rezerwacji:
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

    // Ustawienie nazwy statusu:
    const getStatusName = (statusId: number) => {
        const status = statuses.find(t => t.id === statusId);
        return status ? status.name : t("api.unknownStatus");
    };

    // Obsługa eksportu:
    const handleExport = (trackId: Number) => {
        window.location.href = `/api/reservations/export?trackId=${trackId}`;
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
                                        {reservations.length === 0 ? (
                                            <li className="list-group-item">{t("reservation.emptyList")}</li>
                                        ) : (
                                            reservations.map(reservation => (
                                                <li key={reservation.id} className="list-group-item p-0">
                                                    <div onClick={() => setShowDetails(prev => (prev?.id === reservation.id ? null : reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                                        {t("reservation.reserv")} {formatToDatetimeLocal(reservation.start)} - {formatToDatetimeLocal(reservation.end)}
                                                        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                                            {reservation.statusName !== "Anulowano" && (
                                                                <>
                                                                    <button onClick={() => setEditingReservation(reservation)} disabled={loading} className="icon-button" title={t("universal.edit")}>
                                                                        <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                                    </button>
                                                                    <button onClick={() => handleCancel(reservation.id)} disabled={loading} className="icon-button" title={t("universal.cancel")}>
                                                                        <img src={cancelIcon} alt="Cancel" style={{ width: '16px', height: '16px' }} />
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
                                                                <strong>Status:</strong> {getStatusName(reservation.statusId)}<br />
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))
                                        )}
                                    </ul>
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
                                    currentCost={editingReservation.cost}
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