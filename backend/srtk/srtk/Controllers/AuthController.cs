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

namespace srtk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService service;
        public AuthController(AuthService service)
        {
            this.service = service;
        }

        // Rejestracja użytkownika:
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var error = await service.Register(dto);
            if (error != null)
            {
                return BadRequest(error);
            }
            return Ok(new { message = "Zarejestrowano pomyślnie" });
        }

        // Logowanie użytkownika:
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await service.Login(dto);

            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }

            return Ok(new
            {
                token = result.Token,
                user = result.UserData
            });
        }

        // Wylogowanie użytkownika:
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            return Ok(new { message = "Wylogowano pomyślnie" });
        }

        // Żadanie potwierdzenia maila:
        [HttpPost("email-confirmation")]
        public async Task<IActionResult> EmailConfirmation([FromBody] EmailConfirmationDto dto)
        {
            await service.EmailConfirmation(dto.Email);
            return Ok("Mail z linkiem do potwierdzenia e-maila został wysłany");
        }

        // Potwierdzenie maila:
        [HttpPost("confirm-email")]
        public async Task<IActionResult> EmailConfirmed([FromBody] EmailConfirmationDto dto)
        {
            await service.EmailConfirmed(dto.Token);
            return Ok("Powtierdzono adres e-mail");
        }

        // Żądanie resetu hasła użytkownika:
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await service.ForgotPassword(dto.Email);
            return Ok("Mail z linkiem do resetu hasła został wysłany");
        }

        // Reset hasła użytkownika:
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await service.ResetPassword(dto.Token, dto.NewPassword);
            return Ok("Zresetowano hasło");
        }
    }
}
