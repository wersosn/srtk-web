import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import editIcon from '../assets/edit.png';
import MyReservationCalendar from '../Calendar/MyReservationCalendar';

type Reservation = {
    id: number;
    start: string;
    end: string;
    cost: number;
    userId: number;
    trackId: number;
    statusId: number;
};

function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showDetails, setShowDetails] = useState<Reservation | null>(null);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    // Pobieranie rezerwacji użytkownika:
    const fetchReservations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/reservations/user?userId=${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Błąd podczas pobierania rezerwacji');
            }
            const data = await res.json();
            setReservations(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="res-container">
            <div className="res-card-wrapper">
                <main className="res-main">
                    <h2 className="mb-3">Moje rezerwacje</h2>
                    <hr />

                    {loading ? (
                        <p>Ładowanie rezerwacji...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <h5 className="mt-4">Lista rezerwacji</h5>
                            <ul className="list-group">
                                {reservations.map((Reservation) => (
                                    <li key={Reservation.id} className="list-group-item p-0">
                                        <div onClick={() => setShowDetails(prev => (prev?.id === Reservation.id ? null : Reservation))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                            Rezerwacja: {Reservation.start}-{Reservation.end}
                                            <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => setEditingReservation(Reservation)} disabled={loading} className="icon-button">
                                                    <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            </div>
                                        </div>

                                        {showDetails?.id === Reservation.id && (
                                            <div className="mt-2 ps-2 details">
                                                <div>
                                                    <strong>Id toru:</strong> {Reservation.trackId}
                                                    <br />
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <hr />
                            {editingReservation ? (
                                <>
                                    <h5 className="mt-4">Modyfikacja rezerwacji</h5>

                                </>
                            ) : (
                                <>
                                </>
                            )}
                        </>
                    )}

                    <div className="calendar-section">
                        <MyReservationCalendar />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MyReservations;