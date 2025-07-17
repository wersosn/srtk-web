using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Services
{
    public class RoleService
    {
        private readonly AppDbContext context;

        public RoleService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich ról:
        public async Task<List<Role>> GetAll()
        {
            return await context.Roles.ToListAsync();
        }

        // Pobranie konkretnej roli:
        public async Task<Role?> GetById(int id)
        {
            return await context.Roles.FindAsync(id);
        }

        // Dodanie nowej roli:
        public async Task<Role> Add(Role role)
        {
            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return role;
        }

        // Edycja istniejącej roli:
        public async Task<Role?> Update(int id, RoleDto dto)
        {
            var role = await context.Roles.FindAsync(id);
            if (role == null)
            {
                return null;
            }
            role.Name = dto.Name;
            await context.SaveChangesAsync();
            return role;
        }

        // Usunięcie istniejącej roli:
        public async Task<bool> Delete(int id)
        {
            var role = await context.Roles.FindAsync(id);
            if (role == null)
            {
                return false;
            }
            context.Roles.Remove(role);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
