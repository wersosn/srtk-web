import React, { useState, useEffect } from 'react';
import { parseAvailableDays, isValidDateTime, formatToDatetimeLocal } from './DateHelper';
import { getAllEquipmentsInReservation } from '../Services/Api';
import { useTranslation } from "react-i18next";
import { useTrackAvailabilityEdit } from '../Hooks/useTrackAvailabilityEdit';
import { useCost } from '../Hooks/useCost';
import { useTrack } from '../Hooks/useTrack';
import { useEquipmentsInFacility } from '../Hooks/useEquipmentsInFacility';
import api from "../Api/axios";
import type { Reservation } from '../Types/Types';
import { useTrackDetails } from '../Hooks/useTrackDetails';
import { useTracks } from '../Hooks/useTracks';

interface EditReservationProps {
    reservationId: number;
    currentStart: string;
    currentEnd: string;
    trackId: number;
    onUpdated: (updatedReservation: any) => void;
    onCancel: () => void;
}

const EditReservation: React.FC<EditReservationProps> = ({ reservationId, currentStart, currentEnd, trackId, onUpdated, onCancel }) => {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState(formatToDatetimeLocal(currentStart));
    const [endDate, setEndDate] = useState(formatToDatetimeLocal(currentEnd));
    const { tracks } = useTracks(token!);
    const track = useTrack(trackId, token);
    const [rentEquipment, setRentEquipment] = useState(false);
    const equipmentList = useEquipmentsInFacility(rentEquipment, track, token);
    const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});
    const [datesChanged, setDatesChanged] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const cost = useCost(equipmentQuantities, equipmentList);
    const trackInfo = useTrackDetails(trackId, tracks, t);
    const { isAvailable } = useTrackAvailabilityEdit(track!, trackId, startDate, endDate, reservationId, token!);
    const lang = localStorage.getItem("language") ?? "pl";

    useEffect(() => {
        if (!reservationId) {
            return;
        }

        const fetchReservationEquipments = async () => {
            try {
                if (token) {
                    const data = await getAllEquipmentsInReservation(reservationId, token);
                    const quantities: Record<number, number> = {};
                    data.forEach((er) => {
                        quantities[er.equipmentId] = er.quantity;
                    });
                    setEquipmentQuantities(quantities);
                    if (Object.keys(quantities).length > 0) {
                        setRentEquipment(true);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchReservationEquipments();
    }, [reservationId, token]);

    const allowedDays = track ? parseAvailableDays(track.availableDays) : [];
    const openingHour = track?.openingHour || '00:00';
    const closingHour = track?.closingHour || '23:59';

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStartDate(val);
        setDatesChanged(true);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEndDate(val);
        setDatesChanged(true);
    };

    const handleQuantityChange = (equipmentId: number, value: string) => {
        const qty = parseInt(value, 10);
        setEquipmentQuantities((prev) => ({
            ...prev,
            [equipmentId]: isNaN(qty) || qty < 0 ? 0 : qty,
        }));
    };

    const validateInputs = () => {
        if (new Date(startDate) >= new Date(endDate)) {
            alert(t("makeReservations.datesError"));
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

        if (isAvailable === false) {
            alert(t("makeReservations.availabilityFalse"));
            return false;
        }
        return true;
    };

    // Budowa body do wysłania do serwera:
    const buildReservationBody = () => {
        const equipmentReservations = Object.entries(equipmentQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([equipmentId, quantity]) => ({
                EquipmentId: parseInt(equipmentId),
                Quantity: quantity,
            }));

        return {
            Start: new Date(startDate).toISOString(),
            End: new Date(endDate).toISOString(),
            Cost: cost,
            TrackId: trackId,
            EquipmentReservations: equipmentReservations
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInputs()) {
            return;
        }
        const reservationBody = buildReservationBody();

        try {
            const { data: updatedReservation } = await api.put<Reservation>(`/reservations/${reservationId}`, reservationBody, { headers: { 'X-Language': lang }});
            onUpdated(updatedReservation);
            setMessage('');
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    if (loading) return <p>{t("universal.loading")}</p>;

    return (
        <>
            <form onSubmit={handleSubmit}>
                {trackInfo && <p>{trackInfo}</p>}

                <label>{t("makeReservations.start")}</label>
                <input type="datetime-local" className="info-input" value={startDate} onChange={handleStartDateChange} />

                <label>{t("makeReservations.end")}</label>
                <input type="datetime-local" className="info-input" value={endDate} onChange={handleEndDateChange} />

                {datesChanged && isAvailable === false && (
                    <p className="text-danger">{t("makeReservations.notAvailable")}</p>
                )}
                {datesChanged && isAvailable === true && (
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
                            <label>{t("makeReservations.selectEq")}</label>
                            {equipmentList.map(eq => (
                                <div key={eq.id} className="flex items-center mb-1">
                                    <label>
                                        {eq.name} ({eq.cost} zł)
                                        <input
                                            type="number"
                                            min={0}
                                            value={equipmentQuantities[eq.id] || 0}
                                            onChange={(e) => handleQuantityChange(eq.id, e.target.value)}
                                            className="number-input"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <hr />
                <div className="mb-4 font-semibold">
                    {t("makeReservations.finalCost")} {cost.toFixed(2)} zł
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditReservation;