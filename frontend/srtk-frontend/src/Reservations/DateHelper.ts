// Pomocnicze funkcje do prawidłowej obsługi dat w rezerwacji:
const dayMap: Record<string, number> = {
    Poniedziałek: 0,
    Wtorek: 1,
    Środa: 2,
    Czwartek: 3,
    Piątek: 4,
    Sobota: 5,
    Niedziela: 6
};

export function parseAvailableDays(daysStr: string): number[] {
    return daysStr.split(',').map(d => d.trim()).map(d => dayMap[d]).filter(n => n !== undefined);
}

export function isValidDateTime(dateStr: string, openingHour: string, closingHour: string, allowedDays: number[]) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
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

