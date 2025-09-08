import { useState } from "react";
import type { Reservation } from "../Types/Types";

export function useFilteredReservations(reservations: Reservation[]) {
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations);

    const applyFilter = (trackId?: number, statusId?: number, startDate?: string) => {
        let result = reservations;
        if (trackId) {
            result = result.filter(r => r.trackId === trackId);
        }
        if (statusId) {
            result = result.filter(r => r.statusId === statusId);
        }
        if (startDate) { 
            result = result.filter(r => r.start.split('T')[0] === startDate);
        }
        setFilteredReservations(result);
    };

    return { filteredReservations, setFilteredReservations, applyFilter};
}