using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        private readonly AppDbContext context;

        public StatusesController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich statusów rezerwacji:
        [HttpGet]
        public async Task<ActionResult<List<Status>>> GetAllStatuses()
        {
            var statuses = await context.Statuses.ToListAsync();
            return statuses;
        }

        // Pobranie konkretnego statusu rezerwacji:
        [HttpGet("{id}")]
        public async Task<ActionResult<Status>> GetStatusById(int id)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }
            return status;
        }

        // Dodanie nowego statusu rezerwacji:
        [HttpPost]
        public async Task<ActionResult<Status>> AddRole(Status status)
        {
            context.Statuses.Add(status);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStatusById), new { id = status.Id }, status);
        }

        // Edycja istniejącego statusu rezerwacji:
        [HttpPut("{id}")]
        public async Task<ActionResult<Status>> UpdateStatus(int id, [FromBody] StatusDto dto)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound("Status nie istnieje");
            }
            status.Name = dto.Name;
            await context.SaveChangesAsync();
            return Ok(status);
        }

        // Usunięcie istniejącego statusu rezerwacji:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Status>> DeleteStatus(int id)
        {
            var status = await context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }
            context.Statuses.Remove(status);
            await context.SaveChangesAsync();
            return Ok(new { message = "Status został usunięty" });
        }
    }
}
