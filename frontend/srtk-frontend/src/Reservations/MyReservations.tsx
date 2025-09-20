import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import cancelIcon from "../assets/cancel.png";
import MyReservationCalendar from '../Calendar/MyReservationCalendar';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import FilterReservations from '../Filters/FilterReservations';
import type { Reservation } from '../Types/Types';
import { formatToDatetimeLocal } from './DateHelper';
import { getTrackName, getStatusName } from '../Services/GetNames';
import { useTranslation } from "react-i18next";
import { useStatuses } from '../Hooks/useStatuses';
import { useTracks } from '../Hooks/useTracks';
import { useAuth } from '../User/AuthContext';
import { useReservations } from '../Hooks/useUserReservations';
import { useUserPreferences } from '../Hooks/useUserPreferences';
import { useFilteredReservations } from '../Hooks/useFilteredReservations';
import { usePagination } from '../Hooks/usePagination';
import Pagination from '../Pagination/Pagination';
import { useNotifications } from '../Hooks/useNotifications';

function MyReservations() {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { statuses } = useStatuses(token);
    const { tracks } = useTracks(token);
    const { reservations, setReservations, loading, error, setError, refreshReservations } = useReservations(userId!, token, t);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [refreshCalendarCounter, setRefreshCalendarCounter] = useState(0);
    const { elementsPerPage } = useUserPreferences(userId!, token, t);
    const { filteredReservations, setFilteredReservations } = useFilteredReservations(reservations);
    const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(filteredReservations, elementsPerPage);
    const { addNotification } = useNotifications(token, userId!, t);

    const handleEdit = (updated: Reservation) => {
        const updatedReservation = reservations.map(r => r.id === updated.id ? updated : r);
        setReservations(updatedReservation);
        setEditingReservation(null);
        setRefreshCalendarCounter(prev => prev + 1);
    };

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
        setCurrentPage(1);
    };

    useEffect(() => {
        setFilteredReservations(reservations);
    }, [reservations]);

    const sendNotifications = async (reservation: Reservation) => {
        if (!reservation || !tracks || !userId) {
            return;
        }

        //console.log("loading...")
        try {
            await addNotification(
                `Anulowano rezerwację toru ${getTrackName(tracks, reservation.trackId, t)}`,
                `Anulowano rezerwację rozpoczynającą się ${formatToDatetimeLocal(reservation.start)}`,
                "pl"
            );

            await addNotification(
                `The track reservation ${getTrackName(tracks, reservation.trackId, t)} has been cancelled`,
                `The reservation starting on ${formatToDatetimeLocal(reservation.start)} has been cancelled`,
                "en"
            );
        }
        catch (err: any) {
            console.error("Błąd dodawania powiadomienia:", err);
        }
    }

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
                const reservation = reservations.find(r => r.id === reservationId);
                sendNotifications(reservation!);
                refreshReservations();
                setRefreshCalendarCounter(prev => prev + 1);

            } else {
                const error = await response.text();
                setError(t("universal.error") + error);
            }
        } catch (err: any) {
            setError(t("universal.error") + err.message);
        }
    }

    const handleExport = (reservationId: number) => {
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
                                {paginatedItems.map((Reservation) => (
                                    <li key={Reservation.id} className="list-group-item p-0">
                                        <div onClick={() => setShowDetails(prev => (prev?.id === Reservation.id ? null : Reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                            <div className="d-flex align-items-center gap-1">
                                                <em>{getTrackName(tracks, Reservation.trackId, t)}:</em>
                                                <span>
                                                    {formatToDatetimeLocal(Reservation.start)} - {formatToDatetimeLocal(Reservation.end)}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleExport(Number(Reservation.id))} className="icon-button" title={t("reservation.export")}>
                                                    <img src={downloadIcon} alt="Eksport" style={{ width: '16px', height: '16px' }} />
                                                </button>
                                                {Reservation.statusName !== "Anulowano" && new Date(Reservation.start) >= new Date() && (
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
                                                    <strong>{t("reservation.track")}</strong> {getTrackName(tracks, Reservation.trackId, t)}<br />
                                                    <strong>{t("reservation.start")}</strong> {formatToDatetimeLocal(Reservation.start)}<br />
                                                    <strong>{t("reservation.end")}</strong> {formatToDatetimeLocal(Reservation.end)}<br />
                                                    <strong>{t("reservation.cost")}</strong> {Reservation.cost}<br />
                                                    <strong>Status:</strong> {getStatusName(statuses, Reservation.statusId, t)}<br />
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(newPage) => setCurrentPage(newPage)}
                                t={t} />

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
                </main>
                <div className="calendar-section">
                    <MyReservationCalendar refreshTrigger={refreshCalendarCounter} />
                </div>
            </div>
        </div>
    );
}

export default MyReservations;