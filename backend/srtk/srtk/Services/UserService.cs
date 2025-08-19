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

        // Pobranie wszystkich klientów:
        public async Task<List<Client>> GetAllClients()
        {
            return await context.Clients.ToListAsync();
        }

        // Pobranie wszystkich adminów:
        public async Task<List<Admin>> GetAllAdmins()
        {
            return await context.Admins.ToListAsync();
        }

        // Pobranie konkretnego użytkownika:
        public async Task<User?> GetById(int id)
        {
            return await context.Users.FindAsync(id);
        }
        // Pobranie konkretnego użytkownika po adresie e-mail:
        public async Task<User?> GetByEmail(string email)
        {
            return await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // Pobranie konkretnego klienta:
        public async Task<Client?> GetClientById(int id)
        {
            return await context.Clients.FindAsync(id);
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
        public async Task<User?> Update(int id, [FromBody] UserDto dto)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }

            var currentClient = await context.Clients.FirstOrDefaultAsync(c => c.Id == user.Id);
            var currentAdmin = await context.Admins.FirstOrDefaultAsync(a => a.Id == user.Id);

            bool roleChanged = dto.RoleId != user.RoleId;

            // Aktualizacja pól i nowy typ użytkownika przy zmianie roli:
            if (roleChanged)
            {
                if (currentClient != null)
                {
                    context.Clients.Remove(currentClient);
                }

                if (currentAdmin != null)
                {
                    context.Admins.Remove(currentAdmin);
                }

                if (dto.RoleId == 1) // Client
                {
                    var newClient = new Client
                    {
                        Id = user.Id,
                        Email = dto.Email ?? user.Email,
                        Password = user.Password,
                        RoleId = 1,
                        Name = dto.Name ?? "",
                        Surname = dto.Surname ?? "",
                        PhoneNumber = dto.PhoneNumber ?? ""
                    };
                    context.Clients.Add(newClient);
                }
                else if (dto.RoleId == 2) // Admin
                {
                    var newAdmin = new Admin
                    {
                        Id = user.Id,
                        Email = dto.Email ?? user.Email,
                        Password = user.Password,
                        RoleId = 2,
                        FacilityId = dto.FacilityId ?? 0
                    };
                    context.Admins.Add(newAdmin);
                }

                user.RoleId = dto.RoleId;
            }
            else
            {
                // Aktualizacja pól jeśli nie zmieniamy typu
                if (currentClient != null)
                {
                    if (dto.Name != null) currentClient.Name = dto.Name;
                    if (dto.Surname != null) currentClient.Surname = dto.Surname;
                    if (dto.PhoneNumber != null) currentClient.PhoneNumber = dto.PhoneNumber;
                }

                if (currentAdmin != null && dto.FacilityId.HasValue)
                {
                    currentAdmin.FacilityId = dto.FacilityId.Value;
                }
            }

            if (dto.Email != null)
            {
                user.Email = dto.Email;
            }

            await context.SaveChangesAsync();
            return user;
        }

        // Edycja istniejącego użytkownika:
        public async Task<User?> UpdateMyself(int id, [FromBody] UserDto dto)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }

            var currentClient = await context.Clients.FirstOrDefaultAsync(c => c.Id == user.Id);
            if (currentClient != null)
            {
                if (dto.Email != null)
                {
                    user.Email = dto.Email;
                }

                if (dto.Name != null)
                {
                    currentClient.Name = dto.Name;
                }

                if (dto.Surname != null)
                {
                    currentClient.Surname = dto.Surname;
                }

                if (dto.PhoneNumber != null)
                {
                    currentClient.PhoneNumber = dto.PhoneNumber;
                }
            }
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
