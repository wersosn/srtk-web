import { useEffect, useState, useCallback } from "react";
import { getReservationsInTrack } from "../Api/Api";
import type { Reservation, Track } from "../Types/Types";

export function useAdminReservations(tracks: Track[], token: string | null, t: any) {
    const [reservationsByTrack, setReservationsByTrack] = useState<Record<number, Reservation[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = useCallback(async () => {
        if (!token || tracks.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const reservationsPromises = tracks.map(async (track) => {
                const data = await getReservationsInTrack(track.id);
                return { trackId: track.id, reservations: data };
            });

            const results = await Promise.all(reservationsPromises);

            const grouped: Record<number, Reservation[]> = {};
            results.forEach(({ trackId, reservations }) => {
                grouped[trackId] = reservations.sort(
                    (a:any, b:any) => new Date(a.start).getTime() - new Date(b.start).getTime()
                );
            });

            setReservationsByTrack(grouped);
        } catch (err: any) {
            setError(err.message || t("api.reservationError"));
        } finally {
            setLoading(false);
        }
    }, [tracks, token]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    return {
        reservationsByTrack, setReservationsByTrack, loading, error, setError, refreshReservations: fetchReservations
    };
}
