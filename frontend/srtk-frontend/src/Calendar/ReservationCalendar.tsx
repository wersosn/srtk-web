import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';
import '@fullcalendar/react/dist/vdom';
import './ReservationCalendar.css';
import type { Reservation, Track } from '../Types/Types';
import { formatToDatetimeLocal } from '../Reservations/DateHelper';

export default function ReservationCalendar() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    // Pobieranie wszystkich torów z bazy:
    const fetchTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/tracks', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Błąd podczas pobierania torów');
            }

            const data = await res.json();
            setTracks(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    // Pobranie rezerwacji z danego toru:
    const fetchReservationsInTrack = async () => {
        setLoading(true);
        setError(null);

        if (!selectedTrackId) {
            setReservationList([]);
            setEvents([]);
            setLoading(false);
            return;
        }

        const track = tracks.find(t => t.id === selectedTrackId);
        if (!track) return;

        try {
            const res = await fetch(`/api/reservations/inTrack?trackId=${track.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Błąd podczas pobierania rezerwacji');
            }

            const data: Reservation[] = await res.json();
            setReservationList(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        fetchReservationsInTrack();
    }, [selectedTrackId]);

    useEffect(() => {
        const mappedEvents = reservationList.map(r => {
            const start = new Date(r.start);
            const end = new Date(r.end);

            const pad = (n: number) => (n < 10 ? '0' + n : n);
            const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

            return {
                id: String(r.id),
                title: `Rezerwacja ${formatTime(start)} - ${formatTime(end)}`,
                start: r.start,
                end: r.end,
                allDay: false,
            };
        });
        setEvents(mappedEvents);
    }, [reservationList]);

    function handleTrackChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setSelectedTrackId(val ? Number(val) : null);
    }

    function handleEventClick(clickInfo: any) {
        const id = parseInt(clickInfo.event.id, 10);
        const r = reservationList.find(r => r.id === id) || null;
        if (r) {
            alert(`Data rezerwacji: ${formatToDatetimeLocal(r.start)} - ${formatToDatetimeLocal(r.end)}`);
        }
    }

    return (
        <>
        <div className="cldr">
            <div>
                <h2>Wybierz tor, którego obłożenie chcesz sprawdzić:</h2>
                <select id="track-select" className="input-text" value={selectedTrackId ?? ''} onChange={handleTrackChange}>
                    <option value="">Wybierz tor</option>
                    {tracks.map(track => (
                        <option key={track.id} value={track.id}>
                            {track.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="calendar-container">
                {loading && <p>Ładowanie...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={plLocale} // Ustawienie na język Polski, potem należy to dostosować do wybranego przez użytkownika języka
                    initialView="timeGridWeek"
                    selectable={false}
                    events={events}
                    eventClick={handleEventClick}
                    height="auto" />
            </div>
            </div>
        </>
    );
}