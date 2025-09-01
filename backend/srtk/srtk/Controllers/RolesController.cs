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

        public RolesController(RoleService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
        {
            var roles = await service.GetAll();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRoleById(int id)
        {
            var role = await service.GetById(id);
            if (role == null)
            {
                return NotFound();
            }
            return Ok(role);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RoleDto>> AddRole(RoleDto role)
        {
            var r = await service.Add(role);
            return CreatedAtAction(nameof(GetRoleById), new { id = r.Id }, r); // Zwracam DTO, aby zachować separację warstw
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RoleDto>> UpdateRole(int id, [FromBody] RoleDto dto)
        {
            var role = await service.Update(id, dto);
            if (role == null)
            {
                return NotFound("Rola nie istnieje");
            }
            return Ok(role);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteRole(int id)
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
