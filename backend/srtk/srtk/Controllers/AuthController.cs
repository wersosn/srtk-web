using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using Microsoft.AspNetCore.Authorization;
using DocumentFormat.OpenXml.InkML;
using System.Security.Claims;
using DocumentFormat.OpenXml.Office2010.Excel;

namespace srtk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService service;
        private readonly ILogger<AuthController> logger;
        public AuthController(AuthService service, ILogger<AuthController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var clientType = Request.Headers["X-Client-Type"].FirstOrDefault() ?? "unknown";
            var error = await service.Register(dto, clientType);
            if (error != null)
            {
                logger.LogWarning("Nie udało się zarejestrować użytkownika z adresem e-mail: {Email}", dto.Email);
                return BadRequest(error);
            }
            logger.LogInformation("Zarejestrowano pomyślnie użytkownika z adresem e-mail: {Email}", dto.Email);
            return Ok(new { message = "Zarejestrowano pomyślnie" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await service.Login(dto);

            if (result.Error != null)
            {
                logger.LogWarning("Nie udało się zalogować użytkownika z adresem e-mail: {Email}", dto.Email);
                return BadRequest(result.Error);
            }

            logger.LogInformation("Zalogowano pomyślnie użytkownika z adresem e-mail: {Email}", dto.Email);
            return Ok(new
            {
                token = result.Token,
                user = result.UserData
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            logger.LogInformation("Wylogowano pomyślnie użytkownika");
            return Ok(new { message = "Wylogowano pomyślnie" });
        }

        [HttpPost("email-confirmation")]
        public async Task<IActionResult> EmailConfirmation([FromBody] EmailConfirmationDto dto)
        {
            var clientType = Request.Headers["X-Client-Type"].FirstOrDefault() ?? "unknown";
            await service.EmailConfirmation(dto.Email, clientType);
            logger.LogInformation("Wysłano mail z potwierdzeniem adresu e-mail na adres e-mail: {Email}", dto.Email);
            return Ok("Mail z linkiem do potwierdzenia e-maila został wysłany");
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> EmailConfirmed([FromBody] EmailConfirmationDto dto)
        {
            await service.EmailConfirmed(dto.Token);
            logger.LogInformation("Potwierdzono adres e-mail: {Email}", dto.Email);
            return Ok("Potwierdzono adres e-mail");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var clientType = Request.Headers["X-Client-Type"].FirstOrDefault() ?? "unknown";
            await service.ForgotPassword(dto.Email, clientType);
            logger.LogInformation("Wysłano mail z linkiem do resetu hasła na adres e-mail: {Email}", dto.Email);
            return Ok("Mail z linkiem do resetu hasła został wysłany");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await service.ResetPassword(dto.Token, dto.NewPassword);
            logger.LogInformation("Pomyślnie zresetowano hasło");
            return Ok("Zresetowano hasło");
        }
    }
}
