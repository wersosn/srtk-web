import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { parseAvailableDays, isValidDateTime, checkAvailability, formatToDatetimeLocal } from './DateHelper';
import type { Equipment, EquipmentWithQuantity, Track } from '../Types/Types';

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
    const [t, setTrack] = useState<Track | null>(null);
    const [available, setAvailable] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    // Pobieranie wszystkich torów z bazy:
    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const res = await fetch(`/api/tracks/${trackId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Błąd pobierania toru');
                const data = await res.json();
                setTrack(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTrack();
    }, [trackId, token]);

    // Pobieranie sprzętów należących do odpowiedniego obiektu (w zależności od toru):
    useEffect(() => {
        const fetchEquipment = async () => {
            if (!rentEquipment) {
                setEquipmentList([]);
                return;
            }
            if (!t) return;
            try {
                const res = await fetch(`/api/equipments/inFacility?facilityId=${t.facilityId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Błąd podczas pobierania sprzętu');
                const data = await res.json();
                setEquipmentList(data);
            } catch (err: any) {
                console.error(err);
            }
        };
        fetchEquipment();
    }, [rentEquipment, t, trackId]);

    // Pobieranie sprzętów przypisanych do edytowanej rezerwacji:
    useEffect(() => {
        if (!reservationId) return;

        const fetchReservationEquipments = async () => {
            try {
                const res = await fetch(`/api/reservations/equipments?reservationId=${reservationId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Błąd pobierania sprzętu rezerwacji');
                const data: EquipmentWithQuantity[] = await res.json();

                const quantities: Record<number, number> = {};
                data.forEach((er) => {
                    quantities[er.equipmentId] = er.quantity;
                });
                setEquipmentQuantities(quantities);
                if (Object.keys(quantities).length > 0) {
                    setRentEquipment(true);
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

            const start = new Date(startDate);
            const end = new Date(endDate);
            const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

            if (isNaN(start.getTime()) || isNaN(end.getTime()) || durationInDays <= 0) {
                return;
            }

            const baseCost = 0;
            const equipmentCost = Object.entries(equipmentQuantities)
                .map(([id, qty]) => {
                    const equipment = equipmentList.find(e => e.id === Number(id));
                    const parsedQty = Number(qty);
                    return (equipment?.cost || 0) * (isNaN(parsedQty) ? 0 : parsedQty);
                })
                .reduce((sum, val) => sum + val, 0);

            setCost(baseCost + equipmentCost);

            // Sprawdź dostępność terminu
            /*try {
                const res = await fetch(`/api/reservations/overlapping?trackId=${trackId}&start=${start.toISOString()}&end=${end.toISOString()}`);
                const data = await res.json();
                setAvailable(data.available || false);
            } catch (err) {
                setAvailable(false);
            }*/
        };

        calculateCostAndCheckAvailability();
    }, [startDate, endDate, equipmentQuantities, equipmentList, t]);

    const allowedDays = t ? parseAvailableDays(t.availableDays) : [];
    const openingHour = t?.openingHour || '00:00';
    const closingHour = t?.closingHour || '23:59';

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
        console.log("Wysyłane dane:", reservationBody);

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
                console.log(updatedReservation);
                onUpdated(updatedReservation);
                setMessage('');
            } else {
                const error = await response.text();
                setMessage('Błąd: ' + error);
            }
        } catch (err: any) {
            setMessage('Błąd: ' + err.message);
        }
    };

    if (loading) return <p>Ładowanie...</p>;

    return (
        <>
            <form onSubmit={handleSubmit}>
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
                                    <label>
                                        {eq.name} ({eq.cost} zł)
                                        <input
                                            type="number"
                                            min={0}
                                            value={equipmentQuantities[eq.id] || 0}
                                            onChange={(e) => handleQuantityChange(eq.id, e.target.value)}
                                            style={{ width: '80px', marginLeft: '8px' }}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <hr />
                <div className="mb-4 font-semibold">
                    Łączny koszt: {cost.toFixed(2)} zł
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">Zapisz zmiany</button>
                    <button type="button" onClick={onCancel}>Anuluj</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditReservation;