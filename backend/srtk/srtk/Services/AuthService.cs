using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Services
{
    public class AuthService
    {
        private readonly AppDbContext context;
        private readonly JwtService jwtService;
        private readonly PasswordService passwordService;
        private readonly UserService userService;

        public AuthService(AppDbContext context, JwtService jwtService, PasswordService passwordService, UserService userService)
        {
            this.context = context;
            this.jwtService = jwtService;
            this.passwordService = passwordService;
            this.userService = userService;
        }

        public async Task<string?> Register(RegisterDto dto)
        {
            var usedEmail = await context.Users.AnyAsync(u => u.Email == dto.Email);
            if (usedEmail)
            {
                return "Użytkownik o takim adresie e-mail już istnieje";
            }

            var hashedPassword = passwordService.HashPassword(dto.Password);
            var user = new Client
            {
                Email = dto.Email,
                Password = hashedPassword,
                Name = dto.Name,
                Surname = dto.LastName,
                PhoneNumber = "",
                RoleId = 1 // Domyślna rola - Klient
            };
            await userService.Add(user);
            return null;
        }

        public async Task<LoginResult> Login(LoginDto dto)
        {
            var user = await context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
            {
                return new LoginResult
                {
                    Error = "Użytkownik nie istnieje"
                };
            }

            var isValid = passwordService.VerifyPassword(user.Password, dto.Password);
            if (!isValid)
            {
                return new LoginResult
                {
                    Error = "Nieprawidłowe dane logowania"
                };
            }

            var token = jwtService.GenerateToken(user);
            var userData = new
            {
                user.Id,
                user.Email,
                role = user.GetType().Name
            };

            return new LoginResult
            {
                Token = token,
                UserData = userData
            };
        }
    }

    // Klasa pomocnicza do logowania (do ułatwienia testów jednostkowych):
    public class LoginResult
    {
        public string? Token { get; set; }
        public string? Error { get; set; }
        public object? UserData { get; set; }
    }
}
