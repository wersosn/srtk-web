import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { parseAvailableDays, isValidDateTime, dayMap } from './DateHelper';
import type { Equipment, Track } from '../Types/Types';
import './Reservations.css';
import cycleImage from '../assets/cycle.svg';

function MakeReservation() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [trackInfo, setTrackInfo] = useState<string>("");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rentEquipment, setRentEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [equipmentQuantities, setEquipmentQuantities] = useState<Record<number, number>>({});
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cost, setCost] = useState<number>(0);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Pobieranie wszystkich torów z bazy:
    const fetchAllTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/tracks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(t("api.tracksError"));
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
            if (!res.ok) throw new Error(t("api.eqError"));
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

    // Sprawdzenie, czy tor jest dostępny do zarezerwowania (tzn. nie ma innej rezerwacji w wybranym czasie):
    const checkTrackAvailability = async () => {
        if (!selectedTrackId || !startDate || !endDate) {
            setIsAvailable(null);
            return null;
        }

        try {
            const res = await fetch(`/api/reservations/isAvailable?trackId=${selectedTrackId}&start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error(t("api.availabilityError"));
            const data = await res.json();
            setIsAvailable(data.isAvailable);
            return data.isAvailable;
        } catch (err) {
            console.error(err);
            setIsAvailable(null);
            return null;
        }
    };

    // Ustawienie szczegółów:
    const trackDetails = async () => {
        const track = tracks.find(t => t.id === selectedTrackId);
        if (!track) {
            return null;
        }
        const allowedDays = parseAvailableDays(track.availableDays).map(d => Object.keys(dayMap).find(key => dayMap[key] === d)).join(', ');
        const openingHour = track?.openingHour || '00:00';
        const closingHour = track?.closingHour || '23:59';
        setTrackInfo(t("makeReservations.trackHours") + openingHour + " - " + closingHour + t("makeReservations.trackDays") + allowedDays);
    }

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

    useEffect(() => {
        checkTrackAvailability();
    }, [selectedTrackId, startDate, endDate]);

    useEffect(() => {
        trackDetails();
    }, [selectedTrackId]);

    const addNotification = async (title: string, description: string) => {
        if (!userId) return;

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    Title: title,
                    Description: description,
                    TimeStamp: new Date().toISOString(),
                    IsRead: false,
                    UserId: userId
                }),
            });

            if (!res.ok) {
                throw new Error(t("notification.notificationAddError"));
            }
        } catch (err) {
            console.error(err);
        }
    };

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
            alert(t("makeReservations.startDateNotAvailable"));
        }
    };

    // Handler sprawdzający, czy data zakończenia jest zgodna z godzinami funkcjonowania toru:
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isValidDateTime(val, openingHour, closingHour, allowedDays)) {
            setEndDate(val);
        } else {
            alert(t("makeReservations.endDateNotAvailable"));
        }
    };

    // Obsługa dodawania rezerwacji:
    const handleReservation = async () => {
        if (!selectedTrackId || !startDate || !endDate || !userId) {
            alert(t("makeReservations.allInfo"));
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert(t("makeReservations.datesError"));
            return;
        }

        if (isAvailable === false) {
            alert(t("makeReservations.availabilityFalse"));
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
            if (!res.ok) throw new Error(t("makeReservations.reservationError"));
            alert(t("makeReservations.reservationPositive"));

            await addNotification(
                `${t("notification.resTitle")} ${track?.name}`,
                `${t("notification.resDesc")}  ${new Date(startDate).toLocaleString()}`
            );

            navigate('/');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="res-container">
            <div className="res-card-wrapper">
                <main className="res-main">
                    <h2 className="mt-4">{t("makeReservations.newReservation")}</h2>
                    <hr />

                    {loading ? (
                        <p>{t("makeReservations.loading")}</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <label style={{ textAlign: "center" }}>{t("makeReservations.track")}</label>
                            <br />
                            <select id="trackSelect" className="info-input" value={selectedTrackId ?? ''} onChange={(e) => setSelectedTrackId(Number(e.target.value))}>
                                <option value="">{t("makeReservations.selectTrack")}</option>
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id}>
                                        {track.name} ({t("makeReservations.trackType")} {track.typeOfSurface}, {t("makeReservations.trackLength")} {track.length})
                                    </option>
                                ))}
                            </select>

                            {trackInfo && selectedTrackId !== 0 && <p>{trackInfo}</p>}

                            <label htmlFor="resStart">{t("makeReservations.start")}</label>
                            <input id="resStart" type="datetime-local" className="info-input" value={startDate} onChange={handleStartDateChange} />

                            <label htmlFor="resEnd">{t("makeReservations.end")}</label>
                            <input id="resEnd" type="datetime-local" className="info-input" value={endDate} onChange={handleEndDateChange} />

                            {isAvailable === false && (
                                <p className="text-danger">{t("makeReservations.notAvailable")}</p>
                            )}
                            {isAvailable === true && (
                                <p className="text-success">{t("makeReservations.available")}</p>
                            )}

                            <div className="flex items-center mb-4">
                                <input type="checkbox" id="rentEquipment" checked={rentEquipment} onChange={() => setRentEquipment(!rentEquipment)} className="mr-2" />
                                <label htmlFor="rentEquipment" style={{ marginLeft: "8px" }}>{t("makeReservations.eq")}</label>
                            </div>

                            {rentEquipment && equipmentList.length > 0 && (
                                <>
                                    <hr />
                                    <div className="mb-4">
                                        <h4>{t("makeReservations.selectEq")}</h4>
                                        {equipmentList.map(eq => (
                                            <div key={eq.id} className="flex items-center mb-1" style={{ paddingTop: '1rem' }}>
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
                                                    className="number-input"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <hr />
                            <div className="mb-4 font-semibold">
                                {t("makeReservations.finalCost")} {cost.toFixed(2)} zł
                            </div>

                            <button onClick={handleReservation}>{t("makeReservations.reserve")}</button>
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