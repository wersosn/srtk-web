using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext context;

        public RolesController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich ról:
        [HttpGet]
        public async Task<ActionResult<List<Role>>> GetAllRoles()
        {
            var roles = await context.Roles.ToListAsync();
            return roles;
        }

        // Pobranie konkretnej roli:
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRoleById(int id)
        {
            var role = await context.Roles.FindAsync(id);
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
            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role);
        }

        // Edycja istniejącej roli:
        [HttpPut("{id}")]
        public async Task<ActionResult<Role>> EditRole(int id, Role updatedRole)
        {
            if (id != updatedRole.Id)
            {
                return BadRequest("Id w adresie i roli nie są takie same");
            }

            var role = await context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            role.Name = updatedRole.Name;
            await context.SaveChangesAsync();
            return Ok(role);
        }

        // Usunięcie istniejącej roli:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Role>> DeleteRole(int id)
        {
            var role = await context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }
            context.Roles.Remove(role);
            await context.SaveChangesAsync();
            return Ok(new { message = "Rola została usunięta" });
        }
    }
}
