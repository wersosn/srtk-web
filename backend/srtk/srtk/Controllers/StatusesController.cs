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
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StatusDto>> GetStatusById(int id)
        {
            var status = await service.GetById(id);
            if (status == null)
            {
                return NotFound();
            }
            return Ok(status);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatusDto>> AddStatus(StatusDto status)
        {
            logger.LogInformation("Nowy status: {@Status}", status);
            var s = await service.Add(status);
            return CreatedAtAction(nameof(GetStatusById), new { id = s.Id }, s); // Zwracam DTO, aby zachować separację warstw
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatusDto>> UpdateStatus(int id, [FromBody] StatusDto dto)
        {
            var status = await service.Update(id, dto);
            if (status == null)
            {
                return NotFound("Status nie istnieje");
            }
            return Ok(status);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteStatus(int id)
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
