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

        public async Task<List<FacilityDto>> GetAll()
        {
            var facilities = await context.Facilities.ToListAsync();
            var list = facilities.Select(f => new FacilityDto
            {
                Id = f.Id,
                Name = f.Name,
                City = f.City,
                Address = f.Address
            }).ToList();
            return list;
        }

        public async Task<FacilityDto?> GetById(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return null;
            }

            var fDto = new FacilityDto
            {
                Id = facility.Id,
                Name = facility.Name,
                City = facility.City,
                Address = facility.Address
            };

            return fDto;
        }

        public async Task<FacilityDto> Add(FacilityDto dto)
        {
            var facility = new Facility { Name = dto.Name, City = dto.City, Address = dto.Address };
            context.Facilities.Add(facility);
            await context.SaveChangesAsync();
            return new FacilityDto { Id = facility.Id, Name = facility.Name, City = facility.City, Address = facility.Address };
        }

        public async Task<FacilityDto?> Update(int id, FacilityDto dto)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null) 
            { 
                return null; 
            }
            facility.Name = dto.Name;
            facility.City = dto.City;
            facility.Address = dto.Address;
            await context.SaveChangesAsync();
            return new FacilityDto { Id = facility.Id, Name = facility.Name, City = facility.City, Address = facility.Address };
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
