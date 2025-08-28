import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from 'jwt-decode';
import type { Notification } from "../Types/Types";
import bellIconLight from '../assets/bell-light.png'
import bellIconDark from '../assets/bell-dark.png'
import './NotificationBell.css';

function NotificationBell() {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isDark, setIsDark] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const token = localStorage.getItem('token');

    // Dynamiczne ustawianie odpowiedniej ikonki (w zależności od trybu (ciemny/jasny)):
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", handler);

        return () => mq.removeEventListener("change", handler);
    }, []);
    const icon = isDark ? bellIconLight : bellIconDark;

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

    const loadNotifications = async () => {
        setLoading(true);
        if (!userId) {
            return;
        }

        try {
            const res = await fetch(`/api/notifications/${userId}/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(t("api.notificationError"));
            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            throw new Error(t("api.notificationError"));
        } finally {
            setLoading(false);
        }
    };

    const toggleNotifications = async () => {
        if (!isOpen && notifications.length === 0) {
            await loadNotifications();
        }
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const bubble = document.getElementById('notifications-bubble');
            const bell = document.getElementById('notification-bell');
            if (bubble && bell && !bubble.contains(event.target as Node) && !bell.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    /*const addNotification = async (title: string, description: string) => {
        if (!userId) return;

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    Title: title,
                    Description: description,
                    TimeStamp: new Date().toISOString(),
                    IsRead: false,
                    UserId: userId
                }),
            });

            if (!res.ok) {
                throw new Error(`Nie udało się dodać powiadomienia`);
            }

            const savedNotification: Notification = await res.json();
            setNotifications(prev => [savedNotification, ...prev]);
        } catch (err) {
            console.error("Błąd dodawania powiadomienia:", err);
        }
    };*/

    /*useEffect(() => {
        if (!userId) {
            return;
        }

        const checkUpcomingReservations = async () => {
            try {
                const res = await fetch(`/api/reservations/upcoming/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(t("api.reservationError"));
                const reservations: Reservation[] = await res.json();

                for (const r of reservations) {
                    const trackName = getTrackName(r.trackId);
                    await addNotification(
                        `Przypomnienie o rezerwacji toru ${trackName}`,
                        `Twoja rezerwacja zaczyna się o ${new Date(r.start).toLocaleTimeString()}`
                    );
                }
            } catch (err) {
                throw new Error(t("api.reservationError") + err);
            }
        };

        checkUpcomingReservations();
        const interval = setInterval(checkUpcomingReservations, 60000);
        return () => clearInterval(interval);
    }, [userId, tracks]);*/

    return (
        <>
            <button id="notification-bell" className="icon-button me-3" onClick={toggleNotifications} title={t("navbar.notification")}>
                <img src={icon} alt="Powiadomienia" style={{ width: '24px', height: '24px' }} />
            </button>

            {isOpen && (
                <div id="notifications-bubble" className="notification-bubble">
                    <h5>{t("notification.notifications")}</h5>
                    <hr />
                    {loading ? (
                        <p>{t("notification.loading")}</p>
                    ) : (
                        <>
                            <ul className="notifications-list">
                                {notifications.length === 0 ? (
                                    <li className="notif-text">{t("notification.noNotifications")}</li>
                                ) : (
                                    notifications.map(n => (
                                        <li key={n.id}>
                                            <div className="notif-text">
                                                <strong>{n.title}</strong><br />
                                                <small>{n.description}</small><br />
                                                <small><em>{new Date(n.timeStamp).toLocaleTimeString()}</em></small>
                                            </div>
                                            <hr />
                                        </li>
                                    ))
                                )}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationBell;