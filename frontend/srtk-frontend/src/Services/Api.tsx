import type { Reservation, Track, Equipment, EquipmentWithQuantity, Facility, Role, Status, User, Client, Admin, UserPreference } from "../Types/Types";

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

//--------------------------------------------------------------------------------------------------------------------------------------------
// UŻYTKOWNICY:
export const getUserInfo = async (userId: number, token: string): Promise<Client> => {
    return fetchWithAuth(`/api/users/clients/${userId}`, token);
};

export const getAllClients = async (token: string): Promise<Client[]> => {
    return fetchWithAuth(`/api/users/clients`, token);
};

export const getAllAdmins = async (token: string): Promise<Admin[]> => {
    return fetchWithAuth(`/api/users/admins`, token);
};

export const getUserPreferences = async (userId: number, token: string): Promise<UserPreference> => {
    return fetchWithAuth(`/api/users/${userId}/preferences`, token);
}; 

//--------------------------------------------------------------------------------------------------------------------------------------------
// REZERWACJE:
export const getReservationDetails = async (reservationId: number, token: string) : Promise<Reservation> => {
    return fetchWithAuth(`/api/reservations/${reservationId}`, token);
};

export const getUserReservations = async (userId: number, token: string): Promise<Reservation[]> => {
    return fetchWithAuth(`/api/reservations/user?userId=${userId}`, token);
};

export const getReservationsInTrack = async (trackId: number, token: string): Promise<Reservation[]> => {
    return fetchWithAuth(`/api/reservations/inTrack?trackId=${trackId}`, token);
};

export interface TrackAvailabilityResponse {
  isAvailable: boolean;
}

// Ten fetch jest potrzebny przy tworzeniu nowej rezerwacji:
export const getTrackAvailability = async (trackId: number, startDate: string, endDate: string,  token: string): Promise<TrackAvailabilityResponse> => {
    return fetchWithAuth(`/api/reservations/isAvailable?trackId=${trackId}&start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`, token);
};

// Natomiast ten fetch potrzebny jest w przypadku edycji, gdyż posiada dodatkowy parametr 'reservationId', aby umożliwić zmianę godziny np. z 10:15 na 10:00 (ta sama rezerwacja)
export const getTrackAvailabilityEdit = async (params: URLSearchParams,  token: string): Promise<TrackAvailabilityResponse> => {
    return fetchWithAuth(`/api/reservations/isAvailable?${params.toString()}`, token);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
// TORY:
export const getAllTracks = async (token: string): Promise<Track[]> => {
    return fetchWithAuth(`/api/tracks`, token);
};

export const getAllTracksForAdmin = async (facilityId: number, token: string): Promise<Track[]> => {
    let url: string;
    if (!facilityId || facilityId === 0) {
        url = `/api/tracks`;  // Wszystkie tory
    } else {
        url = `/api/tracks/inFacility?facilityId=${facilityId}`;  // Tory w danym obiekcie
    }
    return fetchWithAuth(url, token);
};

export const getTrackById = async (trackId: number, token: string): Promise<Track> => { 
    return fetchWithAuth(`/api/tracks/${trackId}`, token);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
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

//--------------------------------------------------------------------------------------------------------------------------------------------
// ROLE:
export const getAllRoles = async (token: string): Promise<Role[]> => {
    return fetchWithAuth("/api/roles", token);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
// STATUSY:
export const getAllStatuses = async (token: string): Promise<Status[]> => {
    return fetchWithAuth("/api/statuses", token);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
// OBIEKTY:
export const getAllFacilities = async (token: string): Promise<Facility[]> => {
    return fetchWithAuth("/api/facilities", token);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
// POWIADOMIENIA:  
export const getAllUserNotifications = async (userId: number, token: string): Promise<Notification[]> => {
    return fetchWithAuth(`/api/notifications/${userId}/all`, token);
};