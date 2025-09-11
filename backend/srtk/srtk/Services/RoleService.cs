using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Mappings;

namespace srtk.Services
{
    public class RoleService
    {
        private readonly AppDbContext context;

        public RoleService(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<RoleDto>> GetAll()
        {
            var roles = await context.Roles.ToListAsync();
            return roles.Select(r => r.ToDto()).ToList();
        }

        public async Task<RoleDto?> GetById(int id)
        {
            var role = await context.Roles.FindAsync(id);
            if(role == null)
            {
                return null;
            }
            return role.ToDto();
        }

        public async Task<RoleDto> Add(RoleDto dto)
        {
            var role = dto.ToRole();
            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return role.ToDto();
        }

        public async Task<RoleDto?> Update(int id, RoleDto dto)
        {
            var role = await context.Roles.FindAsync(id);
            if (role == null)
            {
                return null;
            }
            role.Name = dto.Name;
            await context.SaveChangesAsync();
            return role.ToDto();
        }

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
