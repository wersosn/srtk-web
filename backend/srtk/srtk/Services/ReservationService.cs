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
        public async Task<List<ReservationDto>> GetUserReservations(int userId)
        {
            return await context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Track)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    Start = r.Start,
                    End = r.End,
                    Cost = r.Cost,
                    TrackId = r.TrackId,
                    TrackName = r.Track.Name,
                    EquipmentReservations = r.EquipmentReservations.Select(er => new EquipmentReservationDto
                    {
                        EquipmentId = er.EquipmentId,
                        Name = er.Equipment.Name,
                        Quantity = er.Quantity
                    }).ToList()
                }).ToListAsync();
        }

        // Pobieranie sprzętów z konkretnej rezerwacji:
        public async Task<List<EquipmentReservationDto>> GetEquipments(int reservationId)
        {
            return await context.EquipmentReservations
                .Where(er => er.ReservationId == reservationId)
                .Select(er => new EquipmentReservationDto
                {
                    EquipmentId = er.EquipmentId,
                    Name = er.Equipment!.Name,
                    Type = er.Equipment!.Type,
                    Cost = er.Equipment.Cost,
                    Quantity = er.Quantity
                })
                .ToListAsync();
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
        public async Task<List<Reservation>> GetOverlapping(int trackId, DateTime start, DateTime end)
        {
            return await context.Reservations
                .Where(r => r.Start < end && r.End > start && r.TrackId == trackId) // Rezerwacje, które się nakładają
                .ToListAsync();
        }

        // Pobranie konkretnej rezerwacji:
        public async Task<Reservation?> GetById(int id)
        {
            return await context.Reservations
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        // Dodanie nowej rezerwacji:
        public async Task<Reservation> Add(Reservation reservation)
        {
            reservation.Start = reservation.Start.ToUniversalTime();
            reservation.End = reservation.End.ToUniversalTime();

            var equipmentReservations = reservation.EquipmentReservations.ToList();
            reservation.EquipmentReservations.Clear();

            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();

            foreach (var eqRes in equipmentReservations)
            {
                var equipmentExists = await context.Equipments.AnyAsync(e => e.Id == eqRes.EquipmentId);
                if (!equipmentExists)
                {
                    throw new Exception($"Sprzęt nie istnieje");
                }

                eqRes.ReservationId = reservation.Id;
                context.EquipmentReservations.Add(eqRes);
            }
            await context.SaveChangesAsync();

            reservation.EquipmentReservations = await context.EquipmentReservations
                .Where(er => er.ReservationId == reservation.Id)
                .ToListAsync();

            return reservation;
        }

        // Edycja istniejącej rezerwacji:
        public async Task<Reservation?> Update(int id, [FromBody] ReservationDto dto)
        {
            var reservation = await context.Reservations
                .Include(r => r.EquipmentReservations)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return null;
            }

            var existingEquipmentReservations = await context.EquipmentReservations
                    .Where(er => er.ReservationId == reservation.Id)
                    .ToListAsync();

            // Aktualizacja istniejących sprzętów:
            var dtoEquipmentDict = dto.EquipmentReservations.ToDictionary(e => e.EquipmentId);
            foreach (var existing in existingEquipmentReservations)
            {
                if (!dtoEquipmentDict.ContainsKey(existing.EquipmentId))
                {
                    context.EquipmentReservations.Remove(existing);
                }
                else
                {
                    var dtoItem = dtoEquipmentDict[existing.EquipmentId];
                    if (dtoItem.Quantity <= 0)
                    {
                        context.EquipmentReservations.Remove(existing);
                    }
                    else if (existing.Quantity != dtoItem.Quantity)
                    {
                        existing.Quantity = dtoItem.Quantity;
                        context.Entry(existing).State = EntityState.Modified;
                    }
                }
            }

            // Dodawanie nowych sprzętów:
            foreach (var dtoItem in dto.EquipmentReservations)
            {
                var alreadyExists = existingEquipmentReservations.Any(er => er.EquipmentId == dtoItem.EquipmentId);
                if (!alreadyExists && dtoItem.Quantity > 0)
                {
                    var newReservation = new EquipmentReservation
                    {
                        ReservationId = reservation.Id,
                        EquipmentId = dtoItem.EquipmentId,
                        Quantity = dtoItem.Quantity
                    };
                    await context.EquipmentReservations.AddAsync(newReservation);
                }
            }

            // Aktualizacja głównych parametrów:
            reservation.Start = dto.Start.ToUniversalTime();
            reservation.End = dto.End.ToUniversalTime();
            reservation.Cost = dto.Cost;
            reservation.TrackId = dto.TrackId;

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
