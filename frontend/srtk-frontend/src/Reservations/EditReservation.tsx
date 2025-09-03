import React, { useState, useEffect } from 'react';
import { parseAvailableDays, isValidDateTime, formatToDatetimeLocal } from './DateHelper';
import type { Equipment, Track } from '../Types/Types';
import { getTrackById, getAllEquipmentsInFacility, getAllEquipmentsInReservation, getTrackAvailabilityEdit } from '../Services/Api';
import { useTranslation } from "react-i18next";

interface EditReservationProps {
    reservationId: number;
    currentStart: string;
    currentEnd: string;
    currentCost: number;
    trackId: number;
    onUpdated: (updatedReservation: any) => void;
    onCancel: () => void;
}

const EditReservation: React.FC<EditReservationProps> = ({ reservationId, currentStart, currentEnd, currentCost, trackId, onUpdated, onCancel }) => {
    const [startDate, setStartDate] = useState(formatToDatetimeLocal(currentStart));
    const [endDate, setEndDate] = useState(formatToDatetimeLocal(currentEnd));
    const [cost, setCost] = useState(currentCost);
    const [rentEquipment, setRentEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});
    const [tr, setTrack] = useState<Track | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [datesChanged, setDatesChanged] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                if (token) {
                    const data = await getTrackById(trackId, token);
                    setTrack(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchTrack();
    }, [trackId, token]);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!rentEquipment) {
                setEquipmentList([]);
                return;
            }
            if (!tr) return;
            try {
                if (token) {
                    const data = await getAllEquipmentsInFacility(tr.facilityId, token);
                    setEquipmentList(data);
                }
            } catch (err: any) {
                console.error(err);
            }
        };
        fetchEquipment();
    }, [rentEquipment, tr, trackId]);

    useEffect(() => {
        if (!reservationId) return;

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

    // Obliczanie kosztów:
    useEffect(() => {
        const calculateCostAndCheckAvailability = async () => {
            if (!equipmentList.length) return;
            const equipmentCost = Object.entries(equipmentQuantities)
                .map(([id, qty]) => {
                    const equipment = equipmentList.find(e => e.id === Number(id));
                    const parsedQty = Number(qty);
                    return (equipment?.cost || 0) * (isNaN(parsedQty) ? 0 : parsedQty);
                })
                .reduce((sum, val) => sum + val, 0);

            setCost(equipmentCost);
        };

        calculateCostAndCheckAvailability();
    }, [startDate, endDate, equipmentQuantities, equipmentList, tr]);

    // Sprawdzenie, czy tor jest dostępny do zarezerwowania (tzn. nie ma innej rezerwacji w wybranym czasie):
    useEffect(() => {
        const checkTrackAvailability = async () => {
            if (!trackId || !startDate || !endDate) {
                setIsAvailable(null);
                return null;
            }

            const params = new URLSearchParams({
                trackId: trackId.toString(),
                start: new Date(startDate).toISOString(),
                end: new Date(endDate).toISOString(),
            });

            if (reservationId) {
                params.append('reservationId', reservationId.toString());
            }

            try {
                const data = await getTrackAvailabilityEdit(params, token!);
                setIsAvailable(data.isAvailable);
                return data.isAvailable;
            } catch (err) {
                console.error(err);
                setIsAvailable(null);
                return null;
            }
        };
        checkTrackAvailability();
    }, [trackId, startDate, endDate]);

    const allowedDays = tr ? parseAvailableDays(tr.availableDays) : [];
    const openingHour = tr?.openingHour || '00:00';
    const closingHour = tr?.closingHour || '23:59';

    // Handler sprawdzający, czy data rozpoczęcia jest zgodna z godzinami funkcjonowania toru:
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isValidDateTime(val, openingHour, closingHour, allowedDays)) {
            setStartDate(val);
            setDatesChanged(true);
        } else {
            alert(t("makeReservations.startDateNotAvailable"));
        }
    };

    // Handler sprawdzający, czy data zakończenia jest zgodna z godzinami funkcjonowania toru:
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isValidDateTime(val, openingHour, closingHour, allowedDays)) {
            setEndDate(val);
            setDatesChanged(true);
        } else {
            alert(t("makeReservations.endDateNotAvailable"));
        }
    };

    // Handler do obsługi zmiany ilości:
    const handleQuantityChange = (equipmentId: number, value: string) => {
        const qty = parseInt(value, 10);
        setEquipmentQuantities((prev) => ({
            ...prev,
            [equipmentId]: isNaN(qty) || qty < 0 ? 0 : qty,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isAvailable === false) {
            alert(t("makeReservations.availabilityFalse"));
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert(t("makeReservations.datesError"));
            return;
        }

        const equipmentReservations = Object.entries(equipmentQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([equipmentId, quantity]) => ({
                EquipmentId: parseInt(equipmentId),
                Quantity: quantity,
            }));

        const reservationBody = {
            Start: new Date(startDate).toISOString(),
            End: new Date(endDate).toISOString(),
            Cost: cost,
            TrackId: trackId,
            EquipmentReservations: equipmentReservations
        };

        try {
            const response = await fetch(`/api/reservations/${reservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(reservationBody)
            });
            if (response.ok) {
                const updatedReservation = await response.json();
                onUpdated(updatedReservation);
                setMessage('');
            } else {
                const error = await response.text();
                setMessage(t("universal.error") + error);
            }
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    if (loading) return <p>{t("universal.loading")}</p>;

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>{t("makeReservations.start")}</label>
                <input type="datetime-local" className="info-input" value={startDate} onChange={handleStartDateChange} />

                <label>{t("makeReservations.end")}</label>
                <input type="datetime-local" className="info-input" value={endDate} onChange={handleEndDateChange} />

                {datesChanged && isAvailable === false && (
                    <p className="text-danger">{t("makeReservations.noAvailable")}</p>
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