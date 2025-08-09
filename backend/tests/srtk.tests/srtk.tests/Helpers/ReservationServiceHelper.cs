using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public class ReservationServiceHelper : ReservationService
    {
        public ReservationServiceHelper(AppDbContext context) : base(context) { }

        public override async Task<Reservation> Add(Reservation reservation)
        {
            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();
            return reservation;
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

        public override Task<bool> IsTrackAvailable(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            return Task.FromResult(true);
        }
    }
}
