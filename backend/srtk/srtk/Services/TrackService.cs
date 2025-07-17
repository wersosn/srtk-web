using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
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

        // Pobranie wszystkich torów (ogółem):
        public async Task<List<Track>> GetAll()
        {
            return await context.Tracks.ToListAsync();
        }

        // Pobieranie wszystkich torów należących do konkretnego obiektu:
        public async Task<List<Track>> GetAllInFacility(int facilityId)
        {
            return await context.Tracks.Where(t => t.FacilityId == facilityId).ToListAsync();
        }

        // Pobranie konkretnego toru po Id:
        public async Task<Track?> GetById(int id)
        {
            return await context.Tracks.FindAsync(id);
        }

        // Dodanie nowego toru:
        public async Task<Track> Add(Track track)
        {
            context.Tracks.Add(track);
            await context.SaveChangesAsync();
            return track;
        }

        // Edycja istniejącego toru:
        public async Task<Track?> Update(int id, [FromBody] TrackDto dto)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return null;
            }
            track.Name = dto.Name;
            track.TypeOfSurface = dto.TypeOfSurface;
            track.Length = dto.Length;
            track.FacilityId = dto.FacilityId;
            await context.SaveChangesAsync();
            return track;
        }

        // Usunięcie istniejącego toru:
        public async Task<bool> Delete(int id)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return false;
            }
            context.Tracks.Remove(track);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
