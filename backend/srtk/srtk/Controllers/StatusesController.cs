using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        private readonly StatusService service;
        public StatusesController(StatusService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich statusów rezerwacji:
        [HttpGet]
        public async Task<ActionResult<List<Status>>> GetAllStatuses()
        {
            var statuses = await service.GetAll();
            return statuses;
        }

        // Pobranie konkretnego statusu rezerwacji:
        [HttpGet("{id}")]
        public async Task<ActionResult<Status>> GetStatusById(int id)
        {
            var status = await service.GetById(id);
            if (status == null)
            {
                return NotFound();
            }
            return status;
        }

        // Dodanie nowego statusu rezerwacji:
        [HttpPost]
        public async Task<ActionResult<Status>> AddStatus(Status status)
        {
            var s = service.Add(status);
            return CreatedAtAction(nameof(GetStatusById), new { id = s.Id }, s);
        }

        // Edycja istniejącego statusu rezerwacji:
        [HttpPut("{id}")]
        public async Task<ActionResult<Status>> UpdateStatus(int id, [FromBody] StatusDto dto)
        {
            var status = await service.Update(id, dto);
            if (status == null)
            {
                return NotFound("Status nie istnieje");
            }
            return Ok(status);
        }

        // Usunięcie istniejącego statusu rezerwacji:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Status>> DeleteStatus(int id)
        {
            var status = await service.Delete(id);
            if (!status)
            {
                return NotFound();
            }
            return Ok(new { message = "Status został usunięty" });
        }
    }
}
