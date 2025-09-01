using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

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
            var list = statuses.Select(s => new StatusDto
            {
                Id = s.Id,
                Name = s.Name
            }).ToList();
            return list;
        }

        public async Task<StatusDto?> GetById(int id)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return null;
            }

            var sDto = new StatusDto
            {
                Id = status.Id,
                Name = status.Name
            };

            return sDto;
        }

        public async Task<StatusDto> Add(StatusDto dto)
        {
            var status = new Status { Name = dto.Name };
            context.Statuses.Add(status);
            await context.SaveChangesAsync();
            return new StatusDto { Id = status.Id, Name = status.Name };
        }

        public async Task<StatusDto?> Update(int id, StatusDto dto)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return null;
            }
            status.Name = dto.Name;
            await context.SaveChangesAsync();
            return new StatusDto { Id = status.Id, Name = status.Name };
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
