import { useState, useEffect } from "react";
import { getTrackAvailabilityEdit } from "../Services/Api";

export function useTrackAvailabilityEdit(trackId: number | null, startDate: string, endDate: string, reservationId: number | null, token: string | null) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const checkAvailability = async () => {
        if (!trackId || !startDate || !endDate) {
            setIsAvailable(null);
            return;
        }

        const params = new URLSearchParams({
            trackId: trackId.toString(),
            start: new Date(startDate).toISOString(),
            end: new Date(endDate).toISOString(),
        });

        if (reservationId) {
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