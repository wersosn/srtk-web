using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Services
{
    public class UserService
    {
        private readonly AppDbContext context;

        public UserService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich użytkowników:
        public async Task<List<User>> GetAll()
        {
            return await context.Users.ToListAsync();
        }

        // Pobranie konkretnego użytkownika:
        public async Task<User?> GetById(int id)
        {
            return await context.Users.FindAsync(id);
        }

        // Pobranie użytkowników według roli:
        public async Task<List<User>> GetByRole(int roleId)
        {
            return await context.Users.Where(u => u.RoleId == roleId).ToListAsync();
        }

        // Dodanie nowego użytkownika:
        public async Task<User> Add(User user)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        // Edycja istniejącego użytkownika:
        // DO ROZSZERZENIA!
        public async Task<User?> Update(int id, [FromBody] UserDto dto)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;
            await context.SaveChangesAsync();
            return user;
        }

        // Usunięcie istniejącego użytkownika:
        public async Task<bool> Delete(int id)
        {
            var user = await context.Users.Include(r => r.ReservationList).FirstOrDefaultAsync(r => r.Id == id);
            if (user == null)
            {
                return false;
            }
            context.Reservations.RemoveRange(user.ReservationList);
            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
