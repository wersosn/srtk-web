using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using Microsoft.AspNetCore.Authorization;

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
    }
}
