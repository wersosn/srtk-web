import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';
import enLocale from '@fullcalendar/core/locales/en-gb';
import '@fullcalendar/react/dist/vdom';
import './ReservationCalendar.css';
import type { Reservation, Track } from '../Types/Types';
import { formatToDatetimeLocal } from '../Reservations/DateHelper';
import { useTranslation } from "react-i18next";

export default function ReservationCalendar() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const lang = localStorage.getItem('language');
    const locale = lang == "pl" ? plLocale : enLocale;
    const { t } = useTranslation();

    // Pobieranie wszystkich torów z bazy:
    const fetchTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/tracks', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(t("api.tracksError"));
            }

            const data = await res.json();
            setTracks(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
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
                throw new Error(t("api.reservationError"));
            }

            const data: Reservation[] = await res.json();
            setReservationList(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
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
                title: `${t("reservation.reserv")} ${formatTime(start)} - ${formatTime(end)}`,
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
            alert(`${t("reservation.date")} ${formatToDatetimeLocal(r.start)} - ${formatToDatetimeLocal(r.end)}`);
        }
    }

    return (
        <>
        <div className="cldr">
                <div className="selectTrack">
                    <h2>{t("home.choseTrackTitle")}</h2>
                    <select id="track-select" className="info-input" value={selectedTrackId ?? ''} onChange={handleTrackChange}>
                        <option value="">{t("home.choseTrack")}</option>
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>
                                {track.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="calendar-container">
                    {loading && <p>{t("universal.loading")}</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        locale={locale}
                        initialView="timeGridWeek"
                        selectable={false}
                        events={events}
                        eventBackgroundColor='#ED8A62'
                        eventBorderColor='#030303'
                        eventTextColor='#030303'
                        eventClick={handleEventClick}
                        height="auto" />
                </div>
            </div>
        </>
    );
}