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

        // Pobranie wszystkich statusów rezerwacji:
        public async Task<List<Status>> GetAll()
        {
            return await context.Statuses.ToListAsync();
        }

        // Pobranie konkretnego statusu rezerwacji:
        public async Task<Status?> GetById(int id)
        {
            return await context.Statuses.FindAsync(id);
        }

        // Dodanie nowego statusu rezerwacji:
        public async Task<Status> Add(Status status)
        {
            context.Statuses.Add(status);
            await context.SaveChangesAsync();
            return status;
        }

        // Edycja istniejącego statusu rezerwacji:
        public async Task<Status?> Update(int id, [FromBody] StatusDto dto)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return null;
            }
            status.Name = dto.Name;
            await context.SaveChangesAsync();
            return status;
        }

        // Usunięcie istniejącego statusu rezerwacji:
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
