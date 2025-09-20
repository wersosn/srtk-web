import { useEffect, useState } from "react";
import { parseAvailableDays, dayMap } from '../Reservations/DateHelper';

export function useTrackDetails(selectedTrackId: number | null, tracks: any[], t: any) {
    const [trackInfo, setTrackInfo] = useState<string>("");

    useEffect(() => {
        const track = tracks.find(t => t.id === selectedTrackId);
        if (!track) {
            setTrackInfo("");
            return;
        }

        const allowedDays = parseAvailableDays(track.availableDays)
            .map(d => Object.keys(dayMap).find(key => dayMap[key] === d))
            .join(", ");
        const openingHour = track?.openingHour || "00:00";
        const closingHour = track?.closingHour || "23:59";

        setTrackInfo(`🕓 ${t("makeReservations.trackHours")}${openingHour} - ${closingHour} ${t("makeReservations.trackDays")}${allowedDays}`);
    }, [selectedTrackId, tracks, t]);

    return trackInfo;
}
