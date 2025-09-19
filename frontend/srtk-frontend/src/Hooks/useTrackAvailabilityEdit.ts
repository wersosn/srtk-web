import { useState, useEffect } from "react";
import { getTrackAvailabilityEdit } from "../Services/Api";
import type { Track } from "../Types/Types";
import { isValidDateTime, parseAvailableDays } from "../Reservations/DateHelper";

export function useTrackAvailabilityEdit(track: Track, trackId: number | null, startDate: string, endDate: string, reservationId: number | null, token: string | null) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const allowedDays = track ? parseAvailableDays(track.availableDays) : [];
    const openingHour = track?.openingHour || '00:00';
    const closingHour = track?.closingHour || '23:59';

    const checkAvailability = async () => {
        if (!trackId || !startDate || !endDate) {
            setIsAvailable(null);
            return;
        }

        if(new Date(startDate) >= new Date(endDate)) {
            setIsAvailable(false);
            return;
        }

        if (!isValidDateTime(startDate, openingHour, closingHour, allowedDays)) {
            return;
        }

        if (!isValidDateTime(endDate, openingHour, closingHour, allowedDays)) {
            setIsAvailable(false);
            return;
        }

        const params = new URLSearchParams({
            trackId: trackId.toString(),
            start: new Date(startDate).toISOString(),
            end: new Date(endDate).toISOString(),
        });

        if (reservationId !== null && reservationId !== undefined) {
            params.append('reservationId', reservationId.toString());
        }

        try {
            const data = await getTrackAvailabilityEdit(params, token!);
            setIsAvailable(data.isAvailable);
            return data.isAvailable;
        } catch (err) {
            console.error(err);
            setIsAvailable(null);
            return null;
        }
    };

    useEffect(() => {
        checkAvailability();
    }, [trackId, startDate, endDate, token]);

    return { isAvailable, checkAvailability: checkAvailability };
}