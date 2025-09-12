import type { Reservation } from "../Types/Types";

export const filterReservationsGrouped = (reservationsByTrack: Record<number, Reservation[]>,trackId?: number,statusId?: number, startDate?: string): Record<number, Reservation[]> => {
    const filterFn = (r: Reservation) => {
        const statusMatch = statusId ? r.statusId === statusId : true;
        const dateMatch = startDate
            ? new Date(r.start).toISOString().split("T")[0] === startDate
            : true;
        return statusMatch && dateMatch;
    };

    if (trackId) {
        return { [trackId]: (reservationsByTrack[trackId] || []).filter(filterFn) };
    }

    return Object.fromEntries(
        Object.entries(reservationsByTrack).map(([id, reservations]) => [
            Number(id),
            reservations.filter(filterFn),
        ])
    );
};
