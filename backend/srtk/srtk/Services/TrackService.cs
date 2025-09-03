using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2019.Presentation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using System.Data;
using Track = srtk.Models.Track;

namespace srtk.Services
{
    public class TrackService
    {
        private readonly AppDbContext context;

        public TrackService(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<TrackDto>> GetAll()
        {
            var tracks = await context.Tracks.ToListAsync();
            var list = tracks.Select(t => new TrackDto
            {
                Id = t.Id,
                Name = t.Name,
                TypeOfSurface = t.TypeOfSurface,
                Length = t.Length,
                OpeningHour = t.OpeningHour,
                ClosingHour = t.ClosingHour,
                AvailableDays = t.AvailableDays,
                FacilityId = t.FacilityId
            }).ToList();
            return list;
        }

        public async Task<List<TrackDto>> GetAllInFacility(int facilityId)
        {
            var tracks = await context.Tracks.Where(t => t.FacilityId == facilityId).ToListAsync();
            var list = tracks.Select(t => new TrackDto
            {
                Id = t.Id,
                Name = t.Name,
                TypeOfSurface = t.TypeOfSurface,
                Length = t.Length,
                OpeningHour = t.OpeningHour,
                ClosingHour = t.ClosingHour,
                AvailableDays = t.AvailableDays,
                FacilityId = t.FacilityId
            }).ToList();
            return list;
        }

        public async Task<TrackDto?> GetById(int id)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return null;
            }

            var tDto = new TrackDto
            {
                Id = track.Id,
                Name = track.Name,
                TypeOfSurface = track.TypeOfSurface,
                Length = track.Length,
                OpeningHour = track.OpeningHour,
                ClosingHour = track.ClosingHour,
                AvailableDays = track.AvailableDays,
                FacilityId = track.FacilityId
            };

            return tDto;
        }

        public async Task<TrackDto> Add(TrackDto dto)
        {
            var track = new Track
            {
                Name = dto.Name,
                TypeOfSurface = dto.TypeOfSurface,
                Length = dto.Length,
                OpeningHour = dto.OpeningHour,
                ClosingHour = dto.ClosingHour,
                AvailableDays = dto.AvailableDays,
                FacilityId = dto.FacilityId
            };
            context.Tracks.Add(track);
            await context.SaveChangesAsync();

            var tDto = new TrackDto
            {
                Id = track.Id,
                Name = track.Name,
                TypeOfSurface = track.TypeOfSurface,
                Length = track.Length,
                OpeningHour = track.OpeningHour,
                ClosingHour = track.ClosingHour,
                AvailableDays = track.AvailableDays,
                FacilityId = track.FacilityId
            };
            return tDto;
        }

        public async Task<TrackDto?> Update(int id, TrackDto dto)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return null;
            }
            track.Name = dto.Name;
            track.TypeOfSurface = dto.TypeOfSurface;
            track.Length = dto.Length;
            track.OpeningHour = dto.OpeningHour;
            track.ClosingHour = dto.ClosingHour;
            track.AvailableDays = dto.AvailableDays;
            track.FacilityId = dto.FacilityId;
            await context.SaveChangesAsync();

            var tDto = new TrackDto
            {
                Id = track.Id,
                Name = track.Name,
                TypeOfSurface = track.TypeOfSurface,
                Length = track.Length,
                OpeningHour = track.OpeningHour,
                ClosingHour = track.ClosingHour,
                AvailableDays = track.AvailableDays,
                FacilityId = track.FacilityId
            };

            return tDto;
        }

        public async Task<bool> Delete(int id)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return false;
            }

            // Usunięcie nadchodzących rezerwacji na usuwany tor:
            var now = DateTime.UtcNow;
            var upcomingReservations = await context.Reservations
                .Where(r => r.TrackId == id && r.Start >= now)
                .ToListAsync();
            context.Reservations.RemoveRange(upcomingReservations);

            context.Tracks.Remove(track);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
