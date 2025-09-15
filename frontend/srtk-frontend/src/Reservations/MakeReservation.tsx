import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { parseAvailableDays, isValidDateTime, formatToDatetimeLocal } from './DateHelper';
import './Reservations.css';
import cycleImage from '../assets/cycle.svg';
import { useTracks } from '../Hooks/useTracks';
import { useAuth } from '../User/AuthContext';
import { useEquipments } from '../Hooks/useEquipments';
import { useTrackAvailability } from '../Hooks/useTrackAvailability';
import { useCost } from '../Hooks/useCost';
import { useTrackDetails } from '../Hooks/useTrackDetails';
import { useNotifications } from '../Hooks/useNotifications';
import api from "../Api/axios";

function MakeReservation() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { userId } = useAuth();
    const { tracks, loading, error } = useTracks(token!);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rentEquipment, setRentEquipment] = useState(false);
    const { equipmentList } = useEquipments(selectedTrackId, rentEquipment, tracks, token);
    const [equipmentQuantities, setEquipmentQuantities] = useState<Record<number, number>>({});
    const isAvailable = useTrackAvailability(tracks, selectedTrackId, startDate, endDate, token);
    const cost = useCost(equipmentQuantities, equipmentList);
    const trackInfo = useTrackDetails(selectedTrackId, tracks, t);
    const { addNotification } = useNotifications(token, userId!, t);

    const track = tracks.find(t => t.id === selectedTrackId);
    const allowedDays = track ? parseAvailableDays(track.availableDays) : [];
    const openingHour = track?.openingHour || '00:00';
    const closingHour = track?.closingHour || '23:59';

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStartDate(val);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEndDate(val);
    };

    const validateInputs = () => {
        if (!selectedTrackId || !startDate || !endDate || !userId) {
            alert(t("makeReservations.allInfo"));
            return false;
        }

        if (!isValidDateTime(startDate, openingHour, closingHour, allowedDays)) {
            alert(t("makeReservations.startDateNotAvailable"));
            return false;
        }

        if (!isValidDateTime(endDate, openingHour, closingHour, allowedDays)) {
            alert(t("makeReservations.endDateNotAvailable"));
            return false;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert(t("makeReservations.datesError"));
            return false;
        }
        if (isAvailable === false) {
            alert(t("makeReservations.availabilityFalse"));
            return false;
        }
        return true;
    };

    // Budowa body do wysłania do serwera:
    const buildReservationBody = () => {
        const equipmentReservations = rentEquipment
            ? Object.entries(equipmentQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => ({
                    EquipmentId: parseInt(id, 10),
                    Quantity: qty
                }))
            : [];

        return {
            Start: new Date(startDate).toISOString(),
            End: new Date(endDate).toISOString(),
            Cost: cost,
            UserId: userId,
            TrackId: selectedTrackId,
            StatusId: 1,
            EquipmentReservations: equipmentReservations
        };
    };

    const sendNotifications = async () => {
        await addNotification(
            `Zarezerwowano tor ${track?.name}`,
            `Twoja rezerwacja zaczyna się w dniu  ${formatToDatetimeLocal(startDate)}`,
            "pl"
        );

        await addNotification(
            `Track reserved ${track?.name}`,
            `Your reservation starts on ${formatToDatetimeLocal(startDate)}`,
            "en"
        );
    }

    const handleReservation = async () => {
        if(!validateInputs()) {
            return;
        }
        const reservationBody = buildReservationBody();

        try {
            await api.post("/reservations", reservationBody);
            alert(t("makeReservations.reservationPositive"));
            sendNotifications();
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