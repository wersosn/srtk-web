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
import { getReservationsInTrack } from "../Services/Api";
import { useTranslation } from "react-i18next";
import refreshIconDark from "../assets/refresh.png";
import refreshIconLight from "../assets/refreshLight.png";
import { usePrefersDark } from '../Hooks/usePrefersDark';
import api from "../Api/axios";

function ReservationCalendar() {
    const token = localStorage.getItem('token');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const lang = localStorage.getItem('language');
    const locale = lang == "pl" ? plLocale : enLocale;
    const { t } = useTranslation();

    const isDark = usePrefersDark();
    const icon = isDark ? refreshIconLight : refreshIconDark;

    const fetchTracks = async () => {
        try {
            const response = await api.get(`/tracks`);
            setTracks(response.data); 
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchReservationsInTrack = async () => {
        setError(null);

        if (!selectedTrackId) {
            setReservationList([]);
            setEvents([]);
            return;
        }

        const track = tracks.find(t => t.id === selectedTrackId);
        if (!track) return;

        try {
            if (token) {
                const data = await getReservationsInTrack(selectedTrackId, token);
                const filtered = data.filter((reservation: any) => reservation.statusName !== "Anulowano");
                setReservationList(filtered);
            }
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        }
    };

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

    const refreshReservations = async () => {
        fetchReservationsInTrack();
    }

    return (
        <>
            <div className="cldr">
                <div className="selectTrack">
                    <h2>{t("home.choseTrackTitle")}</h2>
                    <div className="d-flex gap-3">
                        <select id="track-select" className="info-input" value={selectedTrackId ?? ''} onChange={handleTrackChange}>
                            <option value="">{t("home.choseTrack")}</option>
                            {tracks.map(track => (
                                <option key={track.id} value={track.id}>
                                    {track.name}
                                </option>
                            ))}
                        </select>
                        <button className="icon-button" onClick={refreshReservations} style={{ width: '24px', height: '40px' }} title={t("home.refresh")}>
                            <img src={icon} alt="Edytuj" style={{ width: '24px', height: '24px' }} />
                        </button>
                    </div>
                </div>

                <div className="calendar-container">
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

export default ReservationCalendar;