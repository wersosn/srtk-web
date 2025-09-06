import { useState, useEffect } from "react";
import { getTrackAvailability } from "../Services/Api";

export function useTrackAvailability(selectedTrackId: number | null, startDate: string, endDate: string, token: string | null) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!selectedTrackId || !startDate || !endDate) {
                setIsAvailable(null);
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