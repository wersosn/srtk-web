// Pomocnicze funkcje do prawidłowej obsługi dat w rezerwacji:
export const dayMap: Record<string, number> = {
    Niedziela: 0,
    Poniedziałek: 1,
    Wtorek: 2,
    Środa: 3,
    Czwartek: 4,
    Piątek: 5,
    Sobota: 6
};

export function parseAvailableDays(daysStr: string): number[] {
    return daysStr.split(',').map(d => d.trim()).map(d => dayMap[d]).filter(n => n !== undefined);
}

export function isValidDateTime(dateStr: string, openingHour: string, closingHour: string, allowedDays: number[]) {
    if (!dateStr) return false;
    const date = new Date(dateStr);

    const now = new Date();
    if (date < now) return false;

    const day = date.getDay();
    if (!allowedDays.includes(day)) return false;

    const [openH, openM] = openingHour.split(':').map(Number);
    const [closeH, closeM] = closingHour.split(':').map(Number);

    const timeMinutes = date.getHours() * 60 + date.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes > openMinutes) {
        return timeMinutes >= openMinutes && timeMinutes <= closeMinutes;
    } else {
        return timeMinutes >= openMinutes || timeMinutes <= closeMinutes;
    }
}

export function formatToDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString().slice(0, 16).replace('T', ' ');
}

