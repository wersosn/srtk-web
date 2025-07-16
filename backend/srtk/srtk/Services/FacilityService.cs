using srtk.DTO;
using srtk.Models;
using Microsoft.EntityFrameworkCore;

namespace srtk.Services
{
    public class FacilityService
    {
        private readonly AppDbContext context;

        public FacilityService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich obiektów:
        public async Task<List<Facility>> GetAll()
        {
            return await context.Facilities.ToListAsync();
        }

        // Pobranie konkretnego obiektu:
        public async Task<Facility?> GetById(int id)
        {
            return await context.Facilities.FindAsync(id);
        }

        // Dodanie nowego obiektu:
        public async Task<Facility> Add(Facility facility)
        {
            context.Facilities.Add(facility);
            await context.SaveChangesAsync();
            return facility;
        }

        // Edycja istniejącego obiektu:
        public async Task<Facility?> Update(int id, FacilityDto dto)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null) return null;

            facility.Name = dto.Name;
            facility.City = dto.City;
            facility.Address = dto.Address;

            await context.SaveChangesAsync();
            return facility;
        }

        // Usunięcie istniejącego obiektu:
        public async Task<bool> Delete(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null) return false;

            context.Facilities.Remove(facility);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
