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
import { formatToDatetimeLocal, getHiddenDays, parseAvailableDays } from '../Reservations/DateHelper';
import { getReservationsInTrack } from "../Services/Api";
import { useTranslation } from "react-i18next";
import refreshIconDark from "../assets/refresh.png";
import refreshIconLight from "../assets/refreshLight.png";
import { usePrefersDark } from '../Hooks/usePrefersDark';
import api from "../Api/axios";
import { useIsMobile } from '../Hooks/useIsMobile';

function ReservationCalendar() {
    const { t } = useTranslation();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const lang = localStorage.getItem('language');
    const locale = lang == "pl" ? plLocale : enLocale;
    const [openingHour, setOpeningHour] = useState<string>();
    const [closingHour, setClosingHour] = useState<string>();
    const [allowedDays, setAllowedDays] = useState<number[]>([]);
    const [hiddenDays, setHiddenDays] = useState<number[]>([]);
    const sortedTracks = [...tracks].sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    const isDark = usePrefersDark();
    const icon = isDark ? refreshIconLight : refreshIconDark;

    const isMobile = useIsMobile();
    const type = isMobile ? "timeGridDay" : "timeGridWeek";

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
        if (!track) {
            return;
        }

        setOpeningHour(track?.openingHour || "00:00");
        setClosingHour(track?.closingHour || "23:59");

        const parsedDays = parseAvailableDays(track.availableDays);
        setAllowedDays(parsedDays);
        setHiddenDays(getHiddenDays(parsedDays));
        try {
            const data = await getReservationsInTrack(selectedTrackId);
            const filtered = data.filter((reservation: any) => reservation.statusName !== "Anulowano");
            setReservationList(filtered);
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
                            {sortedTracks.map(track => (
                                <option key={track.id} value={track.id}>
                                    {track.name}
                                </option>
                            ))}
                        </select>
                        <button className="icon-button" onClick={refreshReservations} style={{ width: '24px', height: '40px' }} title={t("home.refresh")}>
                            <img src={icon} alt="Odśwież" style={{ width: '24px', height: '24px' }} />
                        </button>
                    </div>
                </div>

                <div className="calendar-container">
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        locale={locale}
                        initialView={type}
                        slotMinTime={openingHour || "00:00:00"}
                        slotMaxTime={closingHour || "23:59:00"}
                        //hiddenDays={hiddenDays} // Pokazuje tylko dni, gdy tor pracuje
                        businessHours={{
                            daysOfWeek: allowedDays,
                            startTime: openingHour, // To pozwala na wyświetlenie wszystkich dni, ale te w których tor nie pracuje są zaszarzone
                            endTime: closingHour,
                        }}
                        height="auto"
                        contentHeight="auto"
                        expandRows={true}
                        selectable={false}
                        events={events}
                        eventBackgroundColor='#ED8A62'
                        eventBorderColor='#030303'
                        eventTextColor='#030303'
                        eventClick={handleEventClick} />
                </div>
            </div>
        </>
    );
}

export default ReservationCalendar;
