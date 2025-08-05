import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { parseAvailableDays, isValidDateTime, checkAvailability } from './DateHelper';
import type { Equipment, Track } from '../Types/Types';
import './Reservations.css';
import cycleImage from '../assets/cycle.svg';

function MakeReservation() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rentEquipment, setRentEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [equipmentQuantities, setEquipmentQuantities] = useState<Record<number, number>>({});
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null); // TODO: Sprawdzanie dostępności

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cost, setCost] = useState<number>(0);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Pobieranie wszystkich torów z bazy:
    const fetchAllTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/tracks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Błąd podczas pobierania torów');
            const data = await res.json();
            setTracks(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    // Pobieranie sprzętów należących do odpowiedniego obiektu (w zależności od toru):
    const fetchEquipment = async () => {
        if (!selectedTrackId || !rentEquipment) {
            setEquipmentList([]);
            return;
        }

        const track = tracks.find(t => t.id === selectedTrackId);
        if (!track) return;

        try {
            const res = await fetch(`/api/equipments/inFacility?facilityId=${track.facilityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Błąd podczas pobierania sprzętu');
            const data = await res.json();
            setEquipmentList(data);
        } catch (err: any) {
            console.error(err);
        }
    };

    // Obliczanie kosztów:
    const calculateCost = async () => {
        let baseCost = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        if (!isNaN(durationInDays) && durationInDays > 0) {
            baseCost = 0; // Tu można ustawić, żeby rezerwacje coś kosztowały, póki co będą free
        }

        const equipmentCost = Object.entries(equipmentQuantities)
            .map(([id, qty]) => {
                const equipment = equipmentList.find(e => e.id === parseInt(id));
                return (equipment?.cost || 0) * qty;
            })
            .reduce((sum, val) => sum + val, 0);

        setCost(baseCost + equipmentCost);
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
        fetchAllTracks();
    }, []);

    useEffect(() => {
        fetchEquipment();
    }, [selectedTrackId, rentEquipment]);

    useEffect(() => {
        calculateCost();
    }, [startDate, endDate, equipmentQuantities, equipmentList]);

    const track = tracks.find(t => t.id === selectedTrackId);
    const allowedDays = track ? parseAvailableDays(track.availableDays) : [];
    const openingHour = track?.openingHour || '00:00';
    const closingHour = track?.closingHour || '23:59';

    // Handler sprawdzający, czy data rozpoczęcia jest zgodna z godzinami funkcjonowania toru:
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isValidDateTime(val, openingHour, closingHour, allowedDays)) {
            setStartDate(val);
        } else {
            alert('Wybrana data i godzina rozpoczęcia nie są dostępne dla tego toru.');
            setStartDate('');
        }
    };

    // Handler sprawdzający, czy data zakończenia jest zgodna z godzinami funkcjonowania toru:
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isValidDateTime(val, openingHour, closingHour, allowedDays)) {
            setEndDate(val);
        } else {
            alert('Wybrana data i godzina zakończenia nie są dostępne dla tego toru.');
            setEndDate('');
        }
    };

    // Obsługa dodawania rezerwacji:
    const handleReservation = async () => {
        if (!selectedTrackId || !startDate || !endDate || !userId) {
            alert('Uzupełnij wszystkie pola');
            return;
        }

        const equipmentReservations = rentEquipment
            ? Object.entries(equipmentQuantities)
                .filter(([_, quantity]) => quantity > 0)
                .map(([equipmentId, quantity]) => ({
                    EquipmentId: parseInt(equipmentId),
                    Quantity: quantity
                }))
            : [];

        console.log(equipmentReservations);

        const reservationBody = {
            Start: new Date(startDate).toISOString(),
            End: new Date(endDate).toISOString(),
            Cost: cost,
            UserId: userId,
            TrackId: selectedTrackId,
            StatusId: 1,
            EquipmentReservations: equipmentReservations
        };

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reservationBody),
            });
            console.log(reservationBody);
            if (!res.ok) throw new Error('Nie udało się utworzyć rezerwacji');
            alert('Rezerwacja utworzona pomyślnie');
            navigate('/');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="res-container">
            <div className="res-card-wrapper">
                <main className="res-main">
                    <h2 className="mt-4">Nowa rezerwacja</h2>
                    <hr />

                    {loading ? (
                        <p>Ładowanie formularza do dokonania rezerwacji...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <label style={{ textAlign: "center" }}>Tor</label>
                            <br />
                            <select className="info-input" value={selectedTrackId ?? ''} onChange={(e) => setSelectedTrackId(Number(e.target.value))}>
                                <option value="">Wybierz tor</option>
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id}>
                                        {track.name} (Typ nawierzchni: {track.typeOfSurface}, Długość: {track.length})
                                    </option>
                                ))}
                            </select>

                            <label>Data rozpoczęcia</label>
                            <input type="datetime-local" className="info-input" value={startDate} onChange={handleStartDateChange} />

                            <label>Data zakończenia</label>
                            <input type="datetime-local" className="info-input" value={endDate} onChange={handleEndDateChange} />

                            <div className="flex items-center mb-4">
                                <input type="checkbox" id="rentEquipment" checked={rentEquipment} onChange={() => setRentEquipment(!rentEquipment)} className="mr-2" />
                                <label htmlFor="rentEquipment" style={{ marginLeft: "8px" }}>Chcę wynająć sprzęt</label>
                            </div>

                            {rentEquipment && equipmentList.length > 0 && (
                                <>
                                    <hr />
                                    <div className="mb-4">
                                        <label>Sprzęt do wyboru:</label>
                                        {equipmentList.map(eq => (
                                            <div key={eq.id} className="flex items-center mb-1">
                                                <label style={{ marginLeft: "8px" }}>{eq.name} ({eq.cost} zł)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={equipmentQuantities[eq.id] || 0}
                                                    onChange={(e) => {
                                                        const qty = parseInt(e.target.value, 10);
                                                        setEquipmentQuantities(prev => ({
                                                            ...prev,
                                                            [eq.id]: isNaN(qty) || qty < 0 ? 0 : qty
                                                        }));
                                                    }}
                                                    className="info-input"
                                                    style={{ width: "80px" }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <hr />
                            <div className="mb-4 font-semibold">
                                Łączny koszt: {cost.toFixed(2)} zł
                            </div>

                            <button onClick={handleReservation}>Zarezerwuj tor</button>
                        </>
                    )
                    }
                </main>

                <div className="res-image-container">
                    <img src={cycleImage} alt="Logowanie" className="res-image" />
                </div>
            </div>
        </div>
    );
}

export default MakeReservation;