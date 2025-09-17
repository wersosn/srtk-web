using srtk.DTO;
using srtk.Models;
using srtk.Mappings;
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

        public async Task<List<FacilityDto>> GetAll()
        {
            var facilities = await context.Facilities.ToListAsync();
            return facilities.Select(f => f.ToDto()).ToList();
        }

        public async Task<FacilityDto?> GetById(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return null;
            }
            return facility.ToDto();
        }

        public async Task<FacilityDto> Add(FacilityDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.City) || string.IsNullOrWhiteSpace(dto.Address))
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

            var facility = dto.ToFacility();
            context.Facilities.Add(facility);
            await context.SaveChangesAsync();
            return facility.ToDto();
        }

        public async Task<FacilityDto?> Update(int id, FacilityDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.City) || string.IsNullOrWhiteSpace(dto.Address))
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

            var facility = await context.Facilities.FindAsync(id);
            if (facility == null) 
            { 
                return null; 
            }
            facility.Name = dto.Name;
            facility.City = dto.City;
            facility.Address = dto.Address;
            await context.SaveChangesAsync();
            return facility.ToDto();
        }

        public async Task<bool> Delete(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return false;
            }
            context.Facilities.Remove(facility);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
