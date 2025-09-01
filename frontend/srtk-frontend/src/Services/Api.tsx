import type { Reservation, Track, Equipment, EquipmentWithQuantity, Facility, Role, Status, User, Client, Admin } from "../Types/Types";

// Ogólny fetch GET z tokenem:
const fetchWithAuth = async (url: string, token: string) => {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Error");
    }
    return res.json();
};

// UŻYTKOWNICY:
export const getUserInfo = async (userId: number, token: string): Promise<Client> => {
    return fetchWithAuth(`/api/users/clients/${userId}`, token);
};


// REZERWACJE:
export const getUserReservations = async (userId: number, token: string): Promise<Reservation[]> => {
    return fetchWithAuth(`/api/reservations/user?userId=${userId}`, token);
};

export interface TrackAvailabilityResponse {
  isAvailable: boolean;
}
export const getTrackAvailability = async (trackId: number, startDate: string, endDate: string,  token: string): Promise<TrackAvailabilityResponse> => {
    return fetchWithAuth(`/api/reservations/isAvailable?trackId=${trackId}&start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`, token);
};

export const getReservationsInTrack = async (trackId: number, token: string): Promise<Reservation[]> => {
    return fetchWithAuth(`/api/reservations/inTrack?trackId=${trackId}`, token);
};

// TORY:
export const getAllTracks = async (token: string): Promise<Track[]> => {
    return fetchWithAuth(`/api/tracks`, token);
};

export const getTrackById = async (trackId: number, token: string): Promise<Track> => { 
    return fetchWithAuth(`/api/tracks/${trackId}`, token);
};

// SPRZĘTY:
export const getAllEquipmentsForAdmin = async (facilityId: number, token: string): Promise<Equipment[]> => {
    let url: string;
    if (!facilityId || facilityId === 0) {
        url = `/api/equipments`;  // Wszystkie sprzęty
    } else {
        url = `/api/equipments/inFacility?facilityId=${facilityId}`;  // Sprzęty dla danego obiektu
    }
    return fetchWithAuth(url, token);
};

export const getAllEquipmentsInFacility = async (facilityId: number, token: string): Promise<Equipment[]> => {
    return fetchWithAuth(`/api/equipments/inFacility?facilityId=${facilityId}`, token);
};

export const getAllEquipmentsInReservation = async (reservationId: number, token: string): Promise<EquipmentWithQuantity[]> => {
    return fetchWithAuth(`/api/reservations/equipments?reservationId=${reservationId}`, token);
};


// ROLE:
export const getAllRoles = async (token: string): Promise<Role[]> => {
    return fetchWithAuth("/api/roles", token);
};

// STATUSY:
export const getAllStatuses = async (token: string): Promise<Status[]> => {
    return fetchWithAuth("/api/statuses", token);
};


// OBIEKTY:
export const getAllFacilities = async (token: string): Promise<Facility[]> => {
    return fetchWithAuth("/api/facilities", token);
};
