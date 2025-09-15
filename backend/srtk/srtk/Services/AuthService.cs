using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using srtk.DTO;
using srtk.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace srtk.Services
{
    public class AuthService
    {
        private readonly AppDbContext context;
        private readonly JwtService jwtService;
        private readonly PasswordService passwordService;
        private readonly UserService userService;
        private readonly EmailService emailService;
        private readonly IConfiguration config;

        public AuthService(AppDbContext context, JwtService jwtService, PasswordService passwordService, UserService userService, EmailService emailService, IConfiguration config)
        {
            this.context = context;
            this.jwtService = jwtService;
            this.passwordService = passwordService;
            this.userService = userService;
            this.emailService = emailService;
            this.config = config;
        }

        public async Task<string?> Register(RegisterDto dto, string clientType)
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

            await EmailConfirmation(user.Email, clientType);
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

        // Żadanie potwierdzenia maila:
        public async Task EmailConfirmation(string email, string clientType)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Nie znaleziono użytkownika o podanym adresie email");
            }

            var token = jwtService.GenerateConfirmEmailToken(user);
            string confirmLink;
            if (clientType.Equals("mobile", StringComparison.OrdinalIgnoreCase))
            {
                confirmLink = $"{config["MobileApp:DeepLink"]}/confirm-email?token={token}";
            }
            else
            {
                confirmLink = $"{config["Frontend:BaseUrl"]}/confirm-email?token={token}";
            }

            _ = Task.Run(async () =>
            {
                await emailService.SendEmail(
                    user.Email,
                    "Potwierdzenie pomyślnej rejestracji",
                    $@"
                    <div style='font-family: Arial, sans-serif; padding: 10px'>
                        <h2>Witaj {user.Email}!</h2>
                        <p>Dziękujemy za rejestrację w naszym serwisie. Możesz teraz dokonać rezerwacji toru kolarskiego :)</p>
                        <p>Kliknij w poniższy link, aby potwierdzić swój e-mail:</p>
                        <a href='{confirmLink}'>{confirmLink}</a>
                   </div>"
                );
            });
        }

        // Potwierdzenie maila:
        public async Task EmailConfirmed(string token)
        {
            var principal = jwtService.ValidateToken(token);
            if (principal == null)
            {
                throw new Exception("Token nieprawidłowy lub wygasł");
            }

            var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new Exception("Nie udało się odczytać użytkownika z tokena");
            }

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new Exception("Nie znaleziono użytkownika o podanym Id");
            }

            user.EmailConfirmed = true;
            await context.SaveChangesAsync();
        }

        // Żądanie resetu hasła użytkownika:
        public async Task ForgotPassword(string email, string clientType)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Nie znaleziono użytkownika o podanym adresie email");
            }

            if(user.EmailConfirmed == false)
            {
                throw new ApplicationException("Musisz potwierdzić adres e-mail, aby zresetować hasło");
            }

            var token = jwtService.GenerateResetPasswordToken(user);
            string resetLink;
            if (clientType.Equals("mobile", StringComparison.OrdinalIgnoreCase))
            {
                resetLink = $"{config["MobileApp:DeepLink"]}/reset-password?token={token}";
            }
            else
            {
                resetLink = $"{config["Frontend:BaseUrl"]}/reset-password?token={token}";
            }

            _ = Task.Run(async () =>
            {
                await emailService.SendEmail(
                    user.Email,
                    "Reset hasła",
                    $@"
                    <div style='font-family: Arial, sans-serif; padding: 10px'>
                        <h2>Reset hasła</h2>
                        <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
                        <a href='{resetLink}'>{resetLink}</a>
                   </div>"
                );
            });
        }

        // Reset hasła użytkownika:
        public async Task ResetPassword(string token, string newPassword)
        {
            var principal = jwtService.ValidateToken(token);
            if (principal == null)
            {
                throw new Exception("Token nieprawidłowy lub wygasł");
            }

            var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new Exception("Nie udało się odczytać użytkownika z tokena");
            }

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if(user == null)
            {
                throw new Exception("Nie znaleziono użytkownika o podanym Id");
            }

            if (user.EmailConfirmed == false)
            {
                throw new ApplicationException("Musisz potwierdzić adres e-mail, aby zresetować hasło");
            }

            user.Password = passwordService.HashPassword(newPassword);
            await context.SaveChangesAsync();
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
