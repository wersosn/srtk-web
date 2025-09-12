import { useEffect, useState } from "react";
import { getReservationDetails } from "../Services/Api";

export function useReservationDetails(reservationId: number, token: string | null) {
    const [reservationOwner, setReservationOwner] = useState<number>();

    const fetchReservationDetails = async () => {
        if (!reservationId) {
            return;
        }

        if (token) {
            try {
                const data = await getReservationDetails(reservationId, token);
                setReservationOwner(data.userId);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchReservationDetails();
    }, [reservationId, token]);

    return { reservationOwner };
}