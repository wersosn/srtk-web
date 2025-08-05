import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { parseAvailableDays, isValidDateTime, checkAvailability, formatToDatetimeLocal } from './DateHelper';
import type { Equipment, Track } from '../Types/Types';

interface EditReservationProps {
    reservationId: number;
    currentStart: string;
    currentEnd: string;
    currentCost: number;
    currentStatusId: number;
    currentEquipmentIds: number[];
    trackId: number;
    onUpdated: (updatedReservation: any) => void;
    onCancel: () => void;
}

const EditReservation: React.FC<EditReservationProps> = ({ reservationId, currentStart, currentEnd, currentCost, currentStatusId, currentEquipmentIds, trackId, onUpdated, onCancel }) => {
    const [startDate, setStartDate] = useState(formatToDatetimeLocal(currentStart));
    const [endDate, setEndDate] = useState(formatToDatetimeLocal(currentEnd));
    const [cost, setCost] = useState(currentCost);
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(currentEquipmentIds);
    const [rentEquipment, setRentEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [available, setAvailable] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    // Pobieranie wszystkich torów z bazy:
    useEffect(() => {
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
            };
        }
        fetchAllTracks();
    }, []);

    // Pobieranie sprzętów należących do odpowiedniego obiektu (w zależności od toru):
    useEffect(() => {
        const fetchEquipment = async () => {
            if (!rentEquipment || tracks.length === 0) {
                setEquipmentList([]);
                return;
            }

            const track = tracks.find(t => t.id === trackId);
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
        fetchEquipment();
    }, [rentEquipment, tracks, trackId]);

    // Pobieranie sprzętów przypisanych do edytowanej rezerwacji:
    useEffect(() => {
        const fetchReservationEquipment = async () => {
            try {
                const res = await fetch(`/api/reservations/equipments?reservationId=${reservationId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Błąd podczas pobierania sprzętu rezerwacji');
                const data: Equipment[] = await res.json();
                if (data.length > 0) {
                    setRentEquipment(true);
                    setSelectedEquipmentIds(data.map(e => e.id));
                } else {
                    setRentEquipment(false);
                    setSelectedEquipmentIds([]);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchReservationEquipment();
    }, [reservationId, token]);

    // Obliczanie kosztów:
    useEffect(() => {
        const calculate = async () => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeDiff = end.getTime() - start.getTime();
            if (timeDiff <= 0) return;

            const equipmentCost = selectedEquipmentIds
                .map(id => equipmentList.find(e => e.id === id)?.cost || 0)
                .reduce((a, b) => a + b, 0);

            const baseCost = 0;
            setCost(baseCost + equipmentCost);

            // Sprawdzenie kolizji:
            /*try {
                const res = await fetch(`/api/reservations/overlapping?trackId=${trackId}&start=${start.toISOString()}&end=${end.toISOString()}`);
                const data = await res.json();
                setAvailable(data.available || false);
            } catch (err) {
                setAvailable(false);
            }*/
        };

        calculate();
    }, [startDate, endDate, selectedEquipmentIds]);

    const track = useMemo(() => tracks.find(t => t.id === trackId), [tracks, trackId]);
    const allowedDays = useMemo(() => {
        return track ? parseAvailableDays(track.availableDays) : [];
    }, [track]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/reservations/${reservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ start: startDate, end: endDate, cost, equipmentIds: selectedEquipmentIds, trackId })
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
                                    <input
                                        type="checkbox"
                                        checked={selectedEquipmentIds.includes(eq.id)}
                                        onChange={() => {
                                            setSelectedEquipmentIds(prev =>
                                                prev.includes(eq.id)
                                                    ? prev.filter(id => id !== eq.id)
                                                    : [...prev, eq.id]
                                            );
                                        }}
                                        className="mr-2"
                                    />
                                    <label style={{ marginLeft: "8px" }}>{eq.name} ({eq.cost} zł)</label>
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