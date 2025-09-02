import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import downloadIcon from '../assets/download.png';
import downloadIconLight from '../assets/download-light.png';
import { jwtDecode } from 'jwt-decode';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';
import FilterReservationsAdmin from '../Filters/FilterReservationsAdmin';
import type { Reservation, Track, Status } from '../Types/Types';
import { getReservationsInTrack, getAllTracks, getAllStatuses } from '../Services/Api';
import { formatToDatetimeLocal } from './DateHelper';
import { useTranslation } from "react-i18next";

function ReservationManagement() {
    const [facilityId, setFacilityId] = useState<number | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [reservationsByTrack, setReservationsByTrack] = useState<Record<number, Reservation[]>>({});
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [filteredReservations, setFilteredReservations] = useState<Record<number, Reservation[]>>(reservationsByTrack);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    // Dynamiczne ustawianie odpowiedniej ikonki (w zależności od trybu (ciemny/jasny)):
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", handler);

        return () => mq.removeEventListener("change", handler);
    }, []);
    const icon = isDark ? downloadIconLight : downloadIcon;

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

    useEffect(() => {
        if (!facilityId) {
            return;
        }

        const fetchTracks = async () => {
            setLoading(true);
            setError(null);
            try {
                if (token) {
                    const data = await getAllTracks(token);
                    setTracks(data);
                }
            } catch (err: any) {
                setError(err.message || t("api.tracksError"));
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [facilityId, token]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                if (token) {
                    const data = await getAllStatuses(token);
                    setStatuses(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatuses();
    }, [token]);

    const fetchReservations = async () => {
        if (tracks.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const reservationsPromises = tracks.map(async (track) => {
                const data = await getReservationsInTrack(track.id, token!);
                return { trackId: track.id, reservations: data };
            });

            const results = await Promise.all(reservationsPromises);
            const grouped: Record<number, Reservation[]> = {};
            results.forEach(({ trackId, reservations }) => {
                grouped[trackId] = reservations;
            });

            setReservationsByTrack(grouped);
        } catch (err: any) {
            setError(err.message || t("api.reservationError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [token, tracks]);

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
    };

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
                                                            <button onClick={() => setEditingReservation(reservation)} disabled={loading} className="icon-button">
                                                                <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                            </button>
                                                            <DeleteReservation reservationId={reservation.id} onDeleted={() => { fetchReservations(); }} />
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