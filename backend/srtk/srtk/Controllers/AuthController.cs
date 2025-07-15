using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext context;
        private readonly JwtService jwtService;
        private readonly PasswordService passwordService;
        public AuthController(AppDbContext context, JwtService jwtService, PasswordService passwordService)
        {
            this.context = context;
            this.jwtService = jwtService;
            this.passwordService = passwordService;
        }

        // Pobranie wszystkich użytkowników:
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsers()
        {
            var users = await context.Users.ToListAsync();
            return users;
        }

        // Rejestracja użytkownika:
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (context.Users.Any(u => u.Email == dto.Email))
            {
                return BadRequest("Użytkownik o takim adresie e-mail już istnieje");
            }

            var hashedPassword = passwordService.HashPassword(dto.Password);
            var user = new Client
            {
                Email = dto.Email,
                Password = hashedPassword,
                RoleId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return Ok(new { message = "Zarejestrowano pomyślnie" });
        }

        // Logowanie użytkownika:
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if(user == null)
            {
                return BadRequest("Użytkownik nie istnieje");
            }
            var isValid = passwordService.VerifyPassword(user.Password, dto.Password);
            if (!isValid)
            {
                return Unauthorized("Nieprawidłowe dane logowania");
            }

            var token = jwtService.GenerateToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    role = user.GetType().Name
                }
            });
        }

        // Wylogowanie użytkownika:
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            return Ok(new { message = "Wylogowano pomyślnie" });
        }
    }
}
