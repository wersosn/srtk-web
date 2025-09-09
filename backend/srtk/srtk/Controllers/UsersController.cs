using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
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
        private readonly ILogger<UsersController> logger;
        public UsersController(UserService service, ILogger<UsersController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await service.GetAll();
            logger.LogInformation("Pobrano wszystkich użytkowników, ilość: {Count}", users.Count);
            return Ok(users);
        }

        [HttpGet("clients")]
        public async Task<List<Client>> GetAllClients()
        {
            var clients = await service.GetAllClients();
            logger.LogInformation("Pobrano wszystkich klientów, ilość: {Count}", clients.Count);
            return clients;
        }

        [HttpGet("admins")]
        public async Task<List<Admin>> GetAllAdmins()
        {
            var admins = await service.GetAllAdmins();
            logger.LogInformation("Pobrano wszystkich adminów, ilość: {Count}", admins.Count);
            return admins;
        }

        [HttpGet("role/{roleId}")]
        [Authorize]
        public async Task<ActionResult<List<UserDto>>> GetUsersByRole(int roleId)
        {
            var users = await service.GetByRole(roleId);
            if (users == null)
            {
                logger.LogWarning("Nie znaleziono użytkowników z rolą z Id {RoleId}", roleId);
                return NotFound();
            }
            logger.LogInformation("Znaleziono użytkowników z rolą {roleId}, ilość: {Count}", roleId, users.Count);
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            var user = await service.GetById(id);
            if (user == null)
            {
                logger.LogWarning("Nie znaleziono użytkownika z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono użytkownika z Id {Id}: {Email}", id, user.Email);
            return Ok(user);
        }

        [HttpGet("email")]
        public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
        {
            var user = await service.GetByEmail(email);
            if (user == null)
            {
                logger.LogWarning("Nie znaleziono użytkownika z adresem e-mail {Email}", email);
                return NotFound();
            }
            logger.LogInformation("Znaleziono użytkownika z adresem e-mail {Email}", user.Email);
            return Ok(user);
        }

        [HttpGet("clients/{id}")]
        public async Task<ActionResult<Client>> GetClientById(int id)
        {
            var user = await service.GetClientById(id);
            if (user == null)
            {
                logger.LogWarning("Nie znaleziono klienta z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono klienta z Id {Id}: {Email}", id, user.Email);
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            var u = await service.Add(user);
            logger.LogInformation("Dodano nowego użytkownika: {Email}", user.Email);
            return CreatedAtAction(nameof(GetUserById), new { id = u.Id }, u);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto dto)
        {
            var user = await service.Update(id, dto);
            if (user == null)
            {
                logger.LogWarning("Nie znaleziono użytkownika z Id {Id}", id);
                return NotFound("Użytkownik nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano użytkownika z Id {Id}: {Email}", id, dto.Email);
            return Ok(user);
        }

        [HttpPut("clients/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] UserDto dto)
        {
            var currentUserId = int.Parse(User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
            if (currentUserId != id)
            {
                logger.LogWarning("Próba edycji danych innego użytkownika. Zalogowany użytkownik Id: {CurrentUserId}, edytowany Id: {Id}", currentUserId, id);
                return Forbid("Nie możesz edytować danych innego użytkownika");
            }

            var user = await service.UpdateMyself(id, dto);
            if (user == null)
            {
                logger.LogWarning("Nie znaleziono użytkownika z Id {Id}", id);
                return NotFound("Użytkownik nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano użytkownika z Id {Id}: {Email}", id, dto.Email);
            return Ok(user);
        }

        [HttpGet("{id}/preferences")]
        [Authorize]
        public async Task<ActionResult<UserPreferenceDto?>> GetElementsPerPage(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
            if (currentUserId != id)
            {
                logger.LogWarning("Próba pobrania preferencji innego użytkownika. Zalogowany użytkownik Id: {CurrentUserId}, edytowany Id: {Id}", currentUserId, id);
                return Forbid("Nie możesz pobrać preferencji innego użytkownika");
            }
            var userPreference = await service.GetElementsPerPage(id);
            logger.LogInformation("Pobrano preferencje użytkownika z Id {Id}", id);
            return Ok(userPreference);
        }

        [HttpPut("{id}/preferences")]
        [Authorize]
        public async Task<ActionResult<UserPreferenceDto?>> UpdateElementsPerPage(int id, [FromBody] UserPreferenceDto dto)
        {
            var currentUserId = int.Parse(User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
            if (currentUserId != id)
            {
                logger.LogWarning("Próba zmodyfikowania preferencji innego użytkownika. Zalogowany użytkownik Id: {CurrentUserId}, edytowany Id: {Id}", currentUserId, id);
                return Forbid("Nie możesz edytować preferencji innego użytkownika");
            }
            var userPreference = await service.UpdateElementsPerPage(id, dto.ElementsPerPage);
            logger.LogInformation("Zmodyfikowano preferencje użytkownika z Id {Id}", id);
            return Ok(userPreference);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> DeleteUser(int id)
        {
            var user = await service.Delete(id);
            if (!user)
            {
                logger.LogWarning("Nie udało się usunąć użytkownika z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto użytkownika z Id {Id}", id);
            return Ok(new { message = "Użytkownik został usunięty" });
        }
    }
}
