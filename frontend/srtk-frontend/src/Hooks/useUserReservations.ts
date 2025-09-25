import { useEffect, useState, useCallback } from "react";
import { getUserReservations } from "../Api/Api";
import type { Reservation } from "../Types/Types";

export function useReservations(userId: number | undefined, token: string | null, t: any) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = useCallback(async () => {
        if (!userId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getUserReservations(userId, token);
            const sortedData = data.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            setReservations(sortedData);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    return { reservations, setReservations, loading, error, setError, refreshReservations: fetchReservations};
}
