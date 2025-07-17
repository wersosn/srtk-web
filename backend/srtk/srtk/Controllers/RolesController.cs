using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleService service;

        public RolesController(RoleService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich ról:
        [HttpGet]
        public async Task<ActionResult<List<Role>>> GetAllRoles()
        {
            var roles = await service.GetAll();
            return roles;
        }

        // Pobranie konkretnej roli:
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRoleById(int id)
        {
            var role = await service.GetById(id);
            if (role == null)
            {
                return NotFound();
            }
            return role;
        }

        // Dodanie nowej roli:
        [HttpPost]
        public async Task<ActionResult<Role>> AddRole(Role role)
        {
            var r = await service.Add(role);
            return CreatedAtAction(nameof(GetRoleById), new { id = r.Id }, r);
        }

        // Edycja istniejącej roli:
        [HttpPut("{id}")]
        public async Task<ActionResult<Role>> UpdateRole(int id, [FromBody] RoleDto dto)
        {
            var role = await service.Update(id, dto);
            if (role == null)
            {
                return NotFound("Rola nie istnieje");
            }
            return Ok(role);
        }

        // Usunięcie istniejącej roli:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Role>> DeleteRole(int id)
        {
            var role = await service.Delete(id);
            if (!role)
            {
                return NotFound();
            }
            return Ok(new { message = "Rola została usunięta" });
        }
    }
}
