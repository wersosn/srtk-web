import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import MyReservationCalendar from '../Calendar/MyReservationCalendar';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import type { Reservation, Track, Status } from '../Types/Types';
import { formatToDatetimeLocal } from './DateHelper';
import { useTranslation } from "react-i18next";

function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshCalendarCounter, setRefreshCalendarCounter] = useState(0);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    // Pobieranie rezerwacji użytkownika:
    const fetchReservations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/reservations/user?userId=${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(t("api.reservationError"));
            }
            const data = await res.json();
            console.log(data);
            setReservations(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    // Pobranie torów (do wyświetlenia nazwy):
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch('/api/tracks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(t("api.tracksError"));
                const data = await res.json();
                setTracks(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTracks();
    }, [token]);

    // Pobranie statusów rezerwacji (do wyświetlenia nazwy):
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await fetch('/api/statuses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(t("api.statusError"));
                const data = await res.json();
                setStatuses(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatuses();
    }, [token]);

    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const userIdFromToken = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                if (userIdFromToken) {
                    setUserId(parseInt(userIdFromToken, 10));
                }
            } catch {
                setUserId(undefined);
            }
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchReservations();
        }
    }, [userId]);

    // Obsługa edycji rezerwacji:
    const handleEdit = (updated: Reservation) => {
        const updatedReservation = reservations.map(r => r.id === updated.id ? updated : r);
        setReservations(updatedReservation);
        setEditingReservation(null);
        setRefreshCalendarCounter(prev => prev + 1);
    };

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

                    {loading ? (
                        <p>{t("reservation.loading")}</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <h5 className="mt-4">{t("reservation.list")}</h5>
                            <ul className="list-group">
                                {reservations.map((Reservation) => (
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
                                                <button onClick={() => setEditingReservation(Reservation)} disabled={loading} className="icon-button">
                                                    <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                </button>
                                                <DeleteReservation reservationId={Reservation.id} onDeleted={fetchReservations} />
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