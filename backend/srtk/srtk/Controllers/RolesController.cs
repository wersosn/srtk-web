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
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly RoleService service;
        private readonly ILogger<RolesController> logger;

        public RolesController(RoleService service, ILogger<RolesController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
        {
            var roles = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie role, ilość: {Count}", roles.Count);
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRoleById(int id)
        {
            var role = await service.GetById(id);
            if (role == null)
            {
                logger.LogWarning("Nie znaleziono roli o Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono rolę z Id {Id}: {Name}", id, role.Name);
            return Ok(role);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RoleDto>> AddRole(RoleDto dto)
        {
            var role = await service.Add(dto);
            logger.LogInformation("Dodano nową rolę: {Name}", role.Name);
            return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role); // Zwracam DTO, aby zachować separację warstw
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RoleDto>> UpdateRole(int id, [FromBody] RoleDto dto)
        {
            var role = await service.Update(id, dto);
            if (role == null)
            {
                logger.LogWarning("Nie znaleziono roli z Id {Id}", id);
                return NotFound("Rola nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano rolę z Id {Id}: {Name}", id, dto.Name);
            return Ok(role);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteRole(int id)
        {
            var role = await service.Delete(id);
            if (!role)
            {
                logger.LogWarning("Nie udało się usunąć roli z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto rolę z Id {Id}", id);
            return Ok(new { message = "Rola została usunięta" });
        }
    }
}
