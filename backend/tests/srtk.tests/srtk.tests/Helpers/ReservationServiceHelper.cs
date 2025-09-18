using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using srtk.Mappings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public class ReservationServiceHelper : ReservationService
    {
        public ReservationServiceHelper(AppDbContext context, EmailService emailService) : base(context, emailService) { }

        public override async Task<Reservation> Add(Reservation reservation, string language = null)
        {
            if (string.IsNullOrWhiteSpace(reservation.Start.ToLongDateString()) || string.IsNullOrWhiteSpace(reservation.End.ToLongDateString()) || reservation.TrackId < 0)
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();
            return reservation;
        }

        public override async Task<List<ReservationDto>> GetAll()
        {
            return await context.Reservations
                .Select(r => r.ToDto())
                .ToListAsync();
        }
        public override async Task<List<ReservationDto>> GetAllInTrack(int trackId)
        {
            return await context.Reservations
                .Where(r => r.TrackId == trackId)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public override async Task<List<ReservationDto>> GetAllWithStatus(int statusId)
        {
            return await context.Reservations
                .Where(r => r.StatusId == statusId)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public override async Task<List<ReservationDto>> GetByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations
                .Where(r => r.Start.Date == date.Date && r.Start.TimeOfDay == hour)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public override async Task<List<ReservationDto>> GetByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations
                .Where(r => r.End.Date == date.Date && r.End.TimeOfDay == hour)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public override async Task<List<ReservationDto>> GetUserReservations(int userId)
        {
            var reservations = await context.Reservations
                .Where(r => r.UserId == userId)
                .ToListAsync();

            var dtos = reservations.Select(r => new ReservationDto
            {
                Id = r.Id,
                Start = r.Start,
                End = r.End,
                TrackId = r.TrackId,
                TrackName = r.Track?.Name ?? "Tor",
                EquipmentReservations = new List<EquipmentReservationDto>()
            }).ToList();

            return dtos;
        }

        public override async Task<Reservation?> GetById(int id)
        {
            return await context.Reservations.FirstOrDefaultAsync(r => r.Id == id);
        }

        public override Task<bool> IsTrackAvailable(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            return Task.FromResult(true);
        }
    }
}
