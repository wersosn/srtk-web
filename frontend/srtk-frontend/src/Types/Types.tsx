// Rezerwacja:
export type Reservation = {
    id: number;
    start: string;
    end: string;
    cost: number;
    userId: number;
    trackId: number;
    statusId: number;
    equipmentReservations: EquipmentWithQuantity[];
};

// Tor
export type Track = {
    id: number;
    name: string;
    typeOfSurface: string;
    length: number;
    openingHour: string;
    closingHour: string;
    availableDays: string;
    facilityId: number;
};

// Obiekt:
export type Facility = {
    id: number;
    name: string;
    city: string;
    address: string;
};

// Sprzęt:
export type Equipment = {
    id: number;
    name: string;
    type: string;
    cost: number;
    facilityId: number;
};

// Sprzęt z ilością:
export type EquipmentWithQuantity = {
  equipmentId: number;
  quantity: number;
};

// Status rezerwacji:
export type Status = {
    id: number;
    name: string;
};

// Rola użytkownika:
export type Role = {
    id: number;
    name: string;
};

// Użytkownik:
export type User = {
    id: number;
    email: string;
    password: string;
    roleId: number;
    emailConfirmed: boolean;
}

// Klient:
export type Client = {
    id: number;
    email: string;
    password: string;
    roleId: number;
    name: string;
    surname: string;
    phoneNumber: string;
};

// Admin:
export type Admin = {
    id: number;
    email: string;
    password: string;
    roleId: number;
    facilityId: number;
};

// Powiadomienie:
export type Notification = {
    id: number;
    title: string;
    description: string;
    isRead: boolean;
    timeStamp: string;
    userId: number;
}