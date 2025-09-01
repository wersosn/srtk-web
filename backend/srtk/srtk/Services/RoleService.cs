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

        public async Task<List<RoleDto>> GetAll()
        {
            var roles = await context.Roles.ToListAsync();
            var list = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToList();
            return list;
        }

        public async Task<RoleDto?> GetById(int id)
        {
            var role = await context.Roles.FindAsync(id);
            if(role == null)
            {
                return null;
            }

            var rDto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name
            };

            return rDto;
        }

        public async Task<RoleDto> Add(RoleDto dto)
        {
            var role = new Role { Name = dto.Name };
            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return new RoleDto { Id = role.Id, Name = role.Name };
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
            return new RoleDto { Id = role.Id, Name = role.Name };
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
