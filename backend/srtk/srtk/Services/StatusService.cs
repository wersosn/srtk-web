using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Mappings;

namespace srtk.Services
{
    public class StatusService
    {
        private readonly AppDbContext context;
        public StatusService(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<StatusDto>> GetAll()
        {
            var statuses = await context.Statuses.ToListAsync();
            return statuses.Select(s => s.ToDto()).ToList();
        }

        public async Task<StatusDto?> GetById(int id)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return null;
            }
            return status.ToDto();
        }

        public async Task<StatusDto> Add(StatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new Exception("Nie podano nazwy statusu");
            }

            var status = dto.ToStatus();
            context.Statuses.Add(status);
            await context.SaveChangesAsync();
            return status.ToDto();
        }

        public async Task<StatusDto?> Update(int id, StatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new Exception("Nie podano nazwy statusu");
            }

            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return null;
            }
            status.Name = dto.Name;
            await context.SaveChangesAsync();
            return status.ToDto();
        }

        public async Task<bool> Delete(int id)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return false;
            }
            context.Statuses.Remove(status);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
