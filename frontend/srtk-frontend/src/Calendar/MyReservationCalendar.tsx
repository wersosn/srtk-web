import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/react/dist/vdom';
import './ReservationCalendar.css';
import type { Reservation } from '../Types/Types';

export default function MyReservationCalendar() {
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [events, setEvents] = useState<any[]>([]);
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
            setReservationList(data);
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

    function handleEventClick(clickInfo: any) {
        alert(`Kliknięto wydarzenie ID: ${clickInfo.event.id}`);
    }

    return (
        <>
            <div className="calendar-container">
                {loading && <p>Ładowanie...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    selectable={false}
                    events={events}
                    eventClick={handleEventClick}
                    height="auto" />
            </div>
        </>
    );
}