using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Mappings;
using System.Data;

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
            return tracks.Select(t => t.ToDto()).ToList();
        }

        public async Task<List<TrackDto>> GetAllInFacility(int facilityId)
        {
            var tracks = await context.Tracks.Where(t => t.FacilityId == facilityId).ToListAsync();
            return tracks.Select(t => t.ToDto()).ToList();
        }

        public async Task<TrackDto?> GetById(int id)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return null;
            }
            return track.ToDto();
        }

        public async Task<TrackDto> Add(TrackDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.TypeOfSurface) || dto.Length <= 0 || string.IsNullOrWhiteSpace(dto.AvailableDays))
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

            var track = dto.ToTrack();
            context.Tracks.Add(track);
            await context.SaveChangesAsync();
            return track.ToDto();
        }

        public async Task<TrackDto?> Update(int id, TrackDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.TypeOfSurface) || dto.Length <= 0 || string.IsNullOrWhiteSpace(dto.AvailableDays))
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

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
            return track.ToDto();
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
