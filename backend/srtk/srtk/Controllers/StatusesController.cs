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
    public class StatusesController : ControllerBase
    {
        private readonly StatusService service;
        private readonly ILogger<StatusesController> logger;
        public StatusesController(StatusService service, ILogger<StatusesController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<StatusDto>>> GetAllStatuses()
        {
            var statuses = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie statusy, ilość: {Count}", statuses.Count);
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StatusDto>> GetStatusById(int id)
        {
            var status = await service.GetById(id);
            if (status == null)
            {
                logger.LogWarning("Nie znaleziono statusu z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono status z Id {Id}: {Name}", id, status.Name);
            return Ok(status);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatusDto>> AddStatus(StatusDto dto)
        {
            var status = await service.Add(dto);
            logger.LogInformation("Dodano nowy status: {Name}", status.Name);
            return CreatedAtAction(nameof(GetStatusById), new { id = status.Id }, status); // Zwracam DTO, aby zachować separację warstw
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatusDto>> UpdateStatus(int id, [FromBody] StatusDto dto)
        {
            var status = await service.Update(id, dto);
            if (status == null)
            {
                logger.LogWarning("Nie znaleziono statusu z Id {Id}", id);
                return NotFound("Status nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano status z Id {Id}: {Name}", id, dto.Name);
            return Ok(status);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteStatus(int id)
        {
            var status = await service.Delete(id);
            if (!status)
            {
                logger.LogWarning("Nie udało się usunąć statusu z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto status z Id {Id}", id);
            return Ok(new { message = "Status został usunięty" });
        }
    }
}
