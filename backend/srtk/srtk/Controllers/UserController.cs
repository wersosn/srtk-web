using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService service;

        public UserController(UserService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich użytkowników:
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsers()
        {
            var users = await service.GetAll();
            return users;
        }

        // Pobranie użytkowników według roli:
        [HttpGet("users/role/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<User>>> GetUsersByRole(int roleId)
        {
            var users = await service.GetByRole(roleId);
            if (users == null)
            {
                return NotFound();
            }
            return users;
        }

        // Pobranie konkretnego użytkownika:
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await service.GetById(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        // Dodanie nowego użytkownika:
        [HttpPost]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            var u = await service.Add(user);
            return CreatedAtAction(nameof(GetUserById), new { id = u.Id }, u);
        }

        // Edycja istniejącego użytkownika:
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto dto)
        {
            var user = await service.Update(id, dto);
            if (user == null)
            {
                return NotFound("Użytkownik nie istnieje");
            }
            return Ok(user);
        }

        // Usunięcie istniejącego użytkownika:
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> DeleteUser(int id)
        {
            var user = await service.Delete(id);
            if (!user)
            {
                return NotFound();
            }
            return Ok(new { message = "Użytkownik został usunięty" });
        }
    }
}
