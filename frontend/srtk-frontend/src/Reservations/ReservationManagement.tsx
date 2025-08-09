import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import { jwtDecode } from 'jwt-decode';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import type { Reservation, Track, Status } from '../Types/Types';
import { formatToDatetimeLocal } from './DateHelper';

function ReservationManagement() {
    const [facilityId, setFacilityId] = useState<number | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [reservationsByTrack, setReservationsByTrack] = useState<Record<number, Reservation[]>>({});
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    // Pobieranie facilityId z tokena
    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded && decoded.FacilityId !== undefined) {
                    setFacilityId(parseInt(decoded.FacilityId, 10));
                }
            } catch {
                setFacilityId(null);
            }
        }
    }, [token]);

    // Pobranie torów:
    useEffect(() => {
        if (facilityId === null) return;

        const fetchTracks = async () => {
            setLoading(true);
            setError(null);
            try {
                let url: string;
                if (!facilityId || facilityId === 0) {
                    url = '/api/tracks';  // Wszystkie tory
                } else {
                    url = `/api/tracks/inFacility?facilityId=${facilityId}`;  // Tory w danym obiekcie
                }

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Błąd podczas pobierania torów');
                }
                const data = await res.json();
                setTracks(data);
            } catch (err: any) {
                setError(err.message || 'Błąd przy pobieraniu torów');
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [facilityId, token]);

    // Pobranie statusów rezerwacji (do wyświetlenia nazwy):
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await fetch('/api/statuses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Błąd podczas pobierania statusów rezerwacji');
                const data = await res.json();
                setStatuses(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatuses();
    }, [token]);

    // Pobieranie rezerwacji (wszystkich lub w danym obiekcie):
    const fetchReservations = async () => {
        if (tracks.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const reservationsPromises = tracks.map(async (track) => {
                const res = await fetch(`/api/reservations/inTrack?trackId=${track.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    throw new Error(`Błąd pobierania rezerwacji dla toru ${track.name}`);
                }
                const data = await res.json();
                console.log(data);
                return { trackId: track.id, reservations: data };
            });

            const results = await Promise.all(reservationsPromises);
            const grouped: Record<number, Reservation[]> = {};
            results.forEach(({ trackId, reservations }) => {
                grouped[trackId] = reservations;
            });

            setReservationsByTrack(grouped);
        } catch (err: any) {
            setError(err.message || 'Błąd pobierania rezerwacji');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [token, tracks]);

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

    // Obsługa edycji rezerwacji:
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
        // TODO: Wysyłanie powiadomień o zmianach do użytkownika
    };

    // Ustawienie nazwy statusu:
    const getStatusName = (statusId: number) => {
        const status = statuses.find(t => t.id === statusId);
        return status ? status.name : 'Nieznany status';
    };

    // Obsługa eksportu:
    const handleExport = (trackId: Number) => {
        window.location.href = `/api/reservations/export?trackId=${trackId}`;
    };

    return (
        <>
            <div className="admin-content p-4">
                <h2 className="mb-3">Zarządzanie rezerwacjami</h2>
                <hr />

                {loading ? (
                    <p>Ładowanie rezerwacji...</p>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <>
                        <h5 className="mt-4">Lista rezerwacji</h5>
                        {Object.entries(reservationsByTrack).map(([trackId, reservations]) => {
                            const track = tracks.find(t => t.id === Number(trackId));
                            return (
                                <div key={trackId} style={{ marginBottom: '2rem' }}>
                                    <div className="d-flex flex-nowrap justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0" style={{ whiteSpace: 'nowrap' }}>
                                            <em>{track?.name || `ID: ${trackId}`}</em>:
                                        </h6>
                                        {reservations.length !== 0 && (
                                            <button onClick={() => handleExport(Number(trackId))} className="icon-button" title="Eksport do .xlsx">
                                                <img src={downloadIcon} alt="Eksport" style={{ width: '20px', height: '20px' }} />
                                            </button>
                                        )}
                                    </div>
                                    <ul className="list-group">
                                        {reservations.length === 0 ? (
                                            <li className="list-group-item">Brak rezerwacji</li>
                                        ) : (
                                            reservations.map(reservation => (
                                                <li key={reservation.id} className="list-group-item p-0">
                                                    <div onClick={() => setShowDetails(prev => (prev?.id === reservation.id ? null : reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                                        Rezerwacja: {formatToDatetimeLocal(reservation.start)} - {formatToDatetimeLocal(reservation.end)}
                                                        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => setEditingReservation(reservation)} disabled={loading} className="icon-button">
                                                                <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                            </button>
                                                            <DeleteReservation reservationId={reservation.id} onDeleted={() => { fetchReservations(); }} />
                                                        </div>
                                                    </div>

                                                    {showDetails?.id === reservation.id && (
                                                        <div className="mt-2 ps-2 details">
                                                            <div>
                                                                <strong>Id toru:</strong> {reservation.trackId}<br />
                                                                <strong>Start:</strong> {formatToDatetimeLocal(reservation.start)}<br />
                                                                <strong>Koniec:</strong> {formatToDatetimeLocal(reservation.end)}<br />
                                                                <strong>Koszt:</strong> {reservation.cost}<br />
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
                                {console.log('Edytowana rezerwacja:', editingReservation)}
                                <h5 className="mt-4">Modyfikacja rezerwacji</h5>
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