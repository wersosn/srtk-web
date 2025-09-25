import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';
import enLocale from '@fullcalendar/core/locales/en-gb';
import '@fullcalendar/react/dist/vdom';
import './ReservationCalendar.css';
import type { Reservation } from '../Types/Types';
import { formatToDatetimeLocal } from '../Reservations/DateHelper';
import { getUserReservations } from "../Api/Api";
import { useTranslation } from "react-i18next";
import { useAuth } from '../User/AuthContext';

function MyReservationCalendar({ refreshTrigger }: { refreshTrigger: number }) {
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const { userId } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const lang = localStorage.getItem('language');
    const locale = lang == "pl" ? plLocale : enLocale;
    const { t } = useTranslation();

    const fetchReservations = async () => {
        setError(null);
        try {
            if(token && userId !== undefined) {
                const data = await getUserReservations(userId!, token);
                const filtered = data.filter((reservation: any) => reservation.statusName !== "Anulowano");
                setReservationList(filtered);
            }
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        }
    };

    useEffect(() => {
        if (userId) {
            fetchReservations();
        }
    }, [userId, refreshTrigger]);

    useEffect(() => {
        const mappedEvents = reservationList.map(r => {
            const start = new Date(r.start);
            const end = new Date(r.end);

            const pad = (n: number) => (n < 10 ? '0' + n : n);
            const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

            return {
                id: String(r.id),
                title: `${t("reservation.reserv")} ${formatTime(start)} - ${formatTime(end)}`,
                start: r.start,
                end: r.end,
                allDay: false,
            };
        });
        setEvents(mappedEvents);
    }, [reservationList]);

    function handleEventClick(clickInfo: any) {
        const id = parseInt(clickInfo.event.id, 10);
        const r = reservationList.find(r => r.id === id) || null;
        if (r) {
            alert(`${t("reservation.reserv")} nr ${r.id}\n${t("reservation.date")} ${formatToDatetimeLocal(r.start)} - ${formatToDatetimeLocal(r.end)}`);
        }
    }

    return (
        <>
            <div className="my-calendar-container">
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={locale}
                    initialView="timeGridDay"
                    selectable={false}
                    events={events}
                    eventBackgroundColor='#ED8A62'
                    eventBorderColor='#030303'
                    eventTextColor='#030303'
                    eventClick={handleEventClick}
                    height="auto" />
            </div>
        </>
    );
}

export default MyReservationCalendar;