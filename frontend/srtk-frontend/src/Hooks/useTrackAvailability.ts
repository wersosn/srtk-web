import { useState, useEffect } from "react";
import { getTrackAvailability } from "../Api/Api";
import { isValidDateTime, parseAvailableDays } from "../Reservations/DateHelper";
import type { Track } from "../Types/Types";

export function useTrackAvailability(tracks: Track[], selectedTrackId: number | null, startDate: string, endDate: string, token: string | null) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const track = tracks.find(t => t.id === selectedTrackId);
    const allowedDays = track ? parseAvailableDays(track.availableDays) : [];
    const openingHour = track?.openingHour || '00:00';
    const closingHour = track?.closingHour || '23:59';

    useEffect(() => {
        const checkAvailability = async () => {
            if (!selectedTrackId || !startDate || !endDate) {
                setIsAvailable(null);
                return;
            }

            if (new Date(startDate) >= new Date(endDate)) {
                setIsAvailable(false);
                return;
            }

            if (!isValidDateTime(startDate, openingHour, closingHour, allowedDays)) {
                setIsAvailable(false);
                return;
            }

            if (!isValidDateTime(endDate, openingHour, closingHour, allowedDays)) {
                setIsAvailable(false);
                return;
            }

            try {
                if (token) {
                    const data = await getTrackAvailability(selectedTrackId, startDate, endDate, token);
                    setIsAvailable(data.isAvailable);
                }
            } catch (err) {
                console.error(err);
                setIsAvailable(null);
            }
        };

        checkAvailability();
    }, [selectedTrackId, startDate, endDate, token]);

    return isAvailable;
}