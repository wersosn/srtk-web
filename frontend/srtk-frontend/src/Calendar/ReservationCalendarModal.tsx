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
import { parseAvailableDays } from '../Reservations/DateHelper';
import { getReservationsInTrack } from "../Api/Api";
import { useTranslation } from "react-i18next";
import { useIsMobile } from '../Hooks/useIsMobile';
import { useTracks } from '../Hooks/useTracks';

interface ReservationCalendarModalProps {
    trackId: number;
}

const ReservationCalendarModal: React.FC<ReservationCalendarModalProps> = ({ trackId }) => {
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { tracks } = useTracks(token);
    const [reservationList, setReservationList] = useState<Reservation[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lang = localStorage.getItem('language');
    const locale = lang == "pl" ? plLocale : enLocale;
    const [openingHour, setOpeningHour] = useState<string>();
    const [closingHour, setClosingHour] = useState<string>();
    const [allowedDays, setAllowedDays] = useState<number[]>([]);

    const isMobile = useIsMobile();
    const type = isMobile ? "timeGridDay" : "timeGridWeek";

    const fetchReservationsInTrack = async () => {
        setLoading(true);
        setError(null);

        if (!trackId) {
            setReservationList([]);
            setEvents([]);
            setLoading(false);
            return;
        }

        const track = tracks.find(t => t.id === trackId);
        if (!track) {
            return;
        }

        setOpeningHour(track.openingHour || "00:00");
        setClosingHour(track.closingHour || "23:59");
        setAllowedDays(parseAvailableDays(track.availableDays));

        try {
            const data = await getReservationsInTrack(trackId);
            const filtered = data.filter((r: any) => r.statusName !== "Anulowano");
            setReservationList(filtered);

            const mappedEvents = filtered.map((r: Reservation) => {
                return {
                    id: String(r.id),
                    title: `${t("reservation.reserv")}`,
                    start: r.start,
                    end: r.end,
                    allDay: false,
                };
            });
            setEvents(mappedEvents);

        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!tracks || tracks.length === 0) {
            return;
        }
        fetchReservationsInTrack();
    }, [trackId, tracks]);

    return (
        <>
            <div className="cldr">
                <div className="calendar-container" style={{ color: '#1f2f40' }}>
                    {loading ? (
                        <p>{t("universal.loading")}</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : (
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            locale={locale}
                            initialView={type}
                            slotMinTime={openingHour || "00:00:00"}
                            slotMaxTime={closingHour || "23:59:00"}
                            businessHours={{
                                daysOfWeek: allowedDays,
                                startTime: openingHour,
                                endTime: closingHour,
                            }}
                            height="auto"
                            contentHeight="auto"
                            expandRows={true}
                            selectable={false}
                            events={events}
                            eventBackgroundColor='#ED8A62'
                            eventBorderColor='#030303'
                            eventTextColor='#030303' />
                    )}
                </div>
            </div>
        </>
    );
}

export default ReservationCalendarModal;
