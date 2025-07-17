using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Services
{
    public class ReservationService
    {
        private readonly AppDbContext context;

        public ReservationService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich rezerwacji (ogółem):
        public async Task<List<Reservation>> GetAll()
        {
            return await context.Reservations.ToListAsync();
        }

        // Pobieranie rezerwacji konkretnego toru:
        public async Task<List<Reservation>> GetAllInTrack(int trackId)
        {
            return await context.Reservations.Where(r => r.TrackId == trackId).ToListAsync();
        }

        // Pobieranie rezerwacji z konkretnym statusem rezerwacji:
        public async Task<List<Reservation>> GetAllWithStatus(int statusId)
        {
            return await context.Reservations.Where(r => r.StatusId == statusId).ToListAsync();
        }

        // Pobieranie rezerwacji konkretnego użytkownika:
        public async Task<List<Reservation>> GetAllWithUser(int userId)
        {
            return await context.Reservations.Where(r => r.UserId == userId).ToListAsync();
        }

        // Pobieranie rezerwacji rozpoczynających się w określonym dniu i/lub godzinie:
        public async Task<List<Reservation>> GetByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations.Where(r => r.Start.Date == date.Date && r.Start.TimeOfDay == hour).ToListAsync();
        }

        // Pobieranie rezerwacji kończących się w określonym dniu:
        public async Task<List<Reservation>> GetByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations.Where(r => r.End.Date == date.Date && r.End.TimeOfDay == hour).ToListAsync();
        }

        // Pobieranie rezerwacji, które trwają w określonym przedziale czasowym - do znajdywania kolizji:
        public async Task<List<Reservation>> GetOverlapping(DateTime start, DateTime end)
        {
            return await context.Reservations
                .Where(r => r.Start < end && r.End > start) // Rezerwacje, które się nakładają
                .ToListAsync();
        }

        // Pobranie konkretnej rezerwacji:
        public async Task<Reservation?> GetById(int id)
        {
            return await context.Reservations.FindAsync(id);
        }

        // Dodanie nowej rezerwacji:
        public async Task<Reservation> Add(Reservation reservation)
        {
            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();
            return reservation;
        }

        // Edycja istniejącej rezerwacji:
        public async Task<Reservation?> Update(int id, [FromBody] ReservationDto dto)
        {
            var reservation = await context.Reservations.Include(r => r.EquipmentReservations).FirstOrDefaultAsync(r => r.Id == id);
            if (reservation == null)
            {
                return null;
            }

            // Aktualizacja głównych parametrów:
            reservation.Start = dto.Start;
            reservation.End = dto.End;
            reservation.TrackId = dto.TrackId;

            // Aktualizacja sprzętu oraz kosztów:
            if (dto.Equipment != null && dto.Equipment.Count != 0)
            {
                context.EquipmentReservations.RemoveRange(reservation.EquipmentReservations);
                double totalCost = 0;
                foreach (var equipmentDto in dto.Equipment)
                {
                    var equipment = await context.Equipments.FindAsync(equipmentDto.EquipmentId);
                    if (equipment == null)
                    {
                        throw new Exception($"Sprzęt o ID {equipmentDto.EquipmentId} nie istnieje");
                    }

                    reservation.EquipmentReservations.Add(new EquipmentReservation
                    {
                        ReservationId = reservation.Id,
                        EquipmentId = equipmentDto.EquipmentId,
                        Quantity = equipmentDto.Quantity
                    });
                    totalCost += equipment.Cost * equipmentDto.Quantity;
                }
                reservation.Cost = totalCost;
            }
            await context.SaveChangesAsync();
            return reservation;
        }

        // Usunięcie istniejącej rezerwacji:
        public async Task<bool> Delete(int id)
        {
            var reservation = await context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return false;
            }
            context.Reservations.Remove(reservation);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
