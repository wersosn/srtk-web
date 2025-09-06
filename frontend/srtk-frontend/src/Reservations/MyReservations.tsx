import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import cancelIcon from "../assets/cancel.png";
import MyReservationCalendar from '../Calendar/MyReservationCalendar';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import FilterReservations from '../Filters/FilterReservations';
import type { Reservation } from '../Types/Types';
import { getUserReservations } from '../Services/Api';
import { formatToDatetimeLocal } from './DateHelper';
import { useTranslation } from "react-i18next";
import { useStatuses } from '../Hooks/useStatuses';
import { useTracks } from '../Hooks/useTracks';
import { useAuth } from '../User/AuthContext';
import { useReservations } from '../Hooks/useUserReservations';

function MyReservations() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { statuses } = useStatuses(token);
    const { tracks } = useTracks(token);
    const { reservations, setReservations, loading, error, setError, refreshReservations } = useReservations(userId!, token, t);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations);
    const [refreshCalendarCounter, setRefreshCalendarCounter] = useState(0);

    // Obsługa edycji rezerwacji:
    const handleEdit = (updated: Reservation) => {
        const updatedReservation = reservations.map(r => r.id === updated.id ? updated : r);
        setReservations(updatedReservation);
        setEditingReservation(null);
        setRefreshCalendarCounter(prev => prev + 1);
    };

    // Obsługa filtrowania:
    const handleFilterChange = (trackId?: number, statusId?: number, startDate?: string) => {
        let result = reservations;
        if (trackId) {
            result = result.filter(r => r.trackId === trackId);
        }
        if (statusId) {
            result = result.filter(r => r.statusId === statusId);
        }
        if (startDate) {
            result = result.filter(r => {
                const reservationDate = new Date(r.start).toISOString().split('T')[0];
                return reservationDate === startDate;
            });
        }
        setFilteredReservations(result);
    };

    useEffect(() => {
        setFilteredReservations(reservations);
    }, [reservations]);

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

    // Ustawienie nazwy toru:
    const getTrackName = (trackId: number) => {
        const track = tracks.find(t => t.id === trackId);
        return track ? track.name : t("api.unknownTrack");
    };

    // Ustawienie nazwy statusu:
    const getStatusName = (statusId: number) => {
        const status = statuses.find(t => t.id === statusId);
        return status ? status.name : t("api.unknownStatus");
    };

    // Obsługa eksportu:
    const handleExport = (reservationId: Number) => {
        window.location.href = `/api/reservations/exportPdf?reservationId=${reservationId}`;
    };

    return (
        <div className="res-container">
            <div className="res-card-wrapper">
                <main className="res-main">
                    <h2 className="mb-3">{t("reservation.myReservations")}</h2>
                    <hr />
                    <h5 className="mt-4">{t("filters.title")}</h5>
                    <FilterReservations
                        reservations={reservations}
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
                            <ul className="list-group">
                                {filteredReservations.map((Reservation) => (
                                    <li key={Reservation.id} className="list-group-item p-0">
                                        <div onClick={() => setShowDetails(prev => (prev?.id === Reservation.id ? null : Reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                            <div className="d-flex align-items-center gap-1">
                                                <em>{getTrackName(Reservation.trackId)}:</em>
                                                <span>
                                                    {formatToDatetimeLocal(Reservation.start)} - {formatToDatetimeLocal(Reservation.end)}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleExport(Number(Reservation.id))} className="icon-button" title={t("reservation.export")}>
                                                    <img src={downloadIcon} alt="Eksport" style={{ width: '16px', height: '16px' }} />
                                                </button>
                                                {Reservation.statusName !== "Anulowano" && (
                                                    <>
                                                        <button onClick={() => setEditingReservation(Reservation)} disabled={loading} className="icon-button" title={t("universal.edit")}>
                                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                        <button onClick={() => handleCancel(Reservation.id)} disabled={loading} className="icon-button" title={t("universal.cancel")}>
                                                            <img src={cancelIcon} alt="Cancel" style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                    </>
                                                )}
                                                <DeleteReservation reservationId={Reservation.id} onDeleted={() => setReservations(prev => prev.filter(r => r.id !== Reservation.id))} />
                                            </div>
                                        </div>

                                        {showDetails?.id === Reservation.id && (
                                            <div className="mt-2 ps-2 details">
                                                <div>
                                                    <strong>{t("reservation.track")}</strong> {getTrackName(Reservation.trackId)}<br />
                                                    <strong>{t("reservation.start")}</strong> {formatToDatetimeLocal(Reservation.start)}<br />
                                                    <strong>{t("reservation.end")}</strong> {formatToDatetimeLocal(Reservation.end)}<br />
                                                    <strong>{t("reservation.cost")}</strong> {Reservation.cost}<br />
                                                    <strong>Status:</strong> {getStatusName(Reservation.statusId)}<br />
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
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
                </main>
                <div className="calendar-section">
                    <MyReservationCalendar refreshTrigger={refreshCalendarCounter} />
                </div>
            </div>
        </div>
    );
}

export default MyReservations;