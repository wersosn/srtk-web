using DocumentFormat.OpenXml.InkML;
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
    public class UsersController : ControllerBase
    {
        private readonly UserService service;

        public UsersController(UserService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await service.GetAll();
            return users;
        }

        [HttpGet("clients")]
        public async Task<List<Client>> GetAllClients()
        {
            var clients = await service.GetAllClients();
            return clients;
        }

        [HttpGet("admins")]
        public async Task<List<Admin>> GetAllAdmins()
        {
            var admins = await service.GetAllAdmins();
            return admins;
        }

        [HttpGet("role/{roleId}")]
        [Authorize]
        public async Task<ActionResult<List<UserDto>>> GetUsersByRole(int roleId)
        {
            var users = await service.GetByRole(roleId);
            if (users == null)
            {
                return NotFound();
            }
            return users;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            var user = await service.GetById(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpGet("email")]
        public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
        {
            var user = await service.GetByEmail(email);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpGet("clients/{id}")]
        public async Task<ActionResult<Client>> GetClientById(int id)
        {
            var user = await service.GetClientById(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            var u = await service.Add(user);
            return CreatedAtAction(nameof(GetUserById), new { id = u.Id }, u);
        }

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

        [HttpPut("clients/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] UserDto dto)
        {
            var currentUserId = int.Parse(User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
            if (currentUserId != id)
            {
                return Forbid("Nie możesz edytować danych innego użytkownika");
            }

            var user = await service.UpdateMyself(id, dto);
            if (user == null)
            {
                return NotFound("Użytkownik nie istnieje");
            }
            return Ok(user);
        }

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
