using DocumentFormat.OpenXml.InkML;
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

        public async Task<List<UserDto>> GetAll()
        {
            var users = await context.Users.ToListAsync();
            var list = new List<UserDto>();

            foreach (var u in users)
            {
                var dto = new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    RoleId = u.RoleId
                };

                if (u is Client client)
                {
                    dto.Name = client.Name;
                    dto.Surname = client.Surname;
                    dto.PhoneNumber = client.PhoneNumber;
                }

                if (u is Admin admin)
                {
                    dto.FacilityId = admin.FacilityId;
                }

                list.Add(dto);
            }
            return list;
        }

        public async Task<List<Client>> GetAllClients()
        {
            return await context.Clients.ToListAsync();
        }

        public async Task<List<Admin>> GetAllAdmins()
        {
            return await context.Admins.ToListAsync();
        }
        public async Task<UserDto?> GetById(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }

            var dto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                RoleId = user.RoleId
            };

            if (user is Client client)
            {
                dto.Name = client.Name;
                dto.Surname = client.Surname;
                dto.PhoneNumber = client.PhoneNumber;
            }

            if (user is Admin admin)
            {
                dto.FacilityId = admin.FacilityId;
            }

            return dto;
        }
        public async Task<UserDto?> GetByEmail(string email)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return null;
            }

            var dto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                RoleId = user.RoleId
            };

            if (user is Client client)
            {
                dto.Name = client.Name;
                dto.Surname = client.Surname;
                dto.PhoneNumber = client.PhoneNumber;
            }

            if (user is Admin admin)
            {
                dto.FacilityId = admin.FacilityId;
            }

            return dto;
        }

        public async Task<Client?> GetClientById(int id)
        {
            return await context.Clients.FindAsync(id);
        }

        public async Task<List<UserDto>> GetByRole(int roleId)
        {
            var users = await context.Users.Where(u => u.RoleId == roleId).ToListAsync();
            var list = new List<UserDto>();

            foreach (var u in users)
            {
                var dto = new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    RoleId = u.RoleId
                };

                if (u is Client client)
                {
                    dto.Name = client.Name;
                    dto.Surname = client.Surname;
                    dto.PhoneNumber = client.PhoneNumber;
                }

                if (u is Admin admin)
                {
                    dto.FacilityId = admin.FacilityId;
                }

                list.Add(dto);
            }
            return list;
        }

        public async Task<User> Add(User user)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> Update(int id, [FromBody] UserDto dto)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
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

                    if (dto.RoleId == 1) // Klient
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
                    if (currentClient != null)
                    {
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
                await transaction.CommitAsync();
                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

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
