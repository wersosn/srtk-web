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
    public class EquipmentsController : ControllerBase
    {
        private readonly EquipmentService service;
        private readonly ILogger<EquipmentsController> logger;

        public EquipmentsController(EquipmentService service, ILogger<EquipmentsController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<EquipmentDto>>> GetAllEquipments()
        {
            var equipments = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie sprzęty, ilość: {Count}", equipments.Count);
            return Ok(equipments);
        }

        [HttpGet("inFacility")]
        public async Task<ActionResult<List<EquipmentDto>>> GetAllEquipmentsInFacility([FromQuery] int? facilityId)
        {
            List<EquipmentDto> equipments;

            if (facilityId.HasValue)
            {
                equipments = await service.GetAllInFacility(facilityId.Value);
            }
            else
            {
                var facilityIdClaim = User.Claims.FirstOrDefault(c => c.Type == "FacilityId");

                if (facilityIdClaim == null || string.IsNullOrEmpty(facilityIdClaim.Value))
                {
                    equipments = await service.GetAll();
                }
                else if (int.TryParse(facilityIdClaim.Value, out int adminFacilityId))
                {
                    equipments = await service.GetAllInFacility(adminFacilityId);
                }
                else
                {
                    logger.LogWarning("Nieprawidłowy FacilityId w tokenie");
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            logger.LogInformation("Pobrano wszystkie sprzęty w obiekcie z Id: {FacilityId}, ilość: {Count}", facilityId, equipments.Count);
            return Ok(equipments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EquipmentDto>> GetEquipmentById(int id)
        {
            var equipment = await service.GetById(id);
            if (equipment == null)
            {
                logger.LogWarning("Nie znaleziono sprzętu z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono sprzęt z Id {Id}: {Name}", id, equipment.Name);
            return Ok(equipment);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentDto>> AddEquipment(EquipmentDto dto)
        {
            var equipment = await service.Add(dto);
            logger.LogInformation("Dodano nowy sprzęt: {Name}", equipment.Name);
            return CreatedAtAction(nameof(GetEquipmentById), new { id = equipment.Id }, equipment);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentDto>> UpdateEquipment(int id, [FromBody] EquipmentDto dto)
        {
            var equipment = await service.Update(id, dto);
            if (equipment == null)
            {
                logger.LogWarning("Nie znaleziono sprzętu z Id {Id}", id);
                return NotFound("Sprzęt nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano sprzęt z Id {Id}: {Name}", id, dto.Name);
            return Ok(equipment);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteEquipment(int id)
        {
            var equipment = await service.Delete(id);
            if (!equipment)
            {
                logger.LogWarning("Nie udało się usunąć sprzętu z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto sprzęt z Id {Id}", id);
            return Ok(new { message = "Sprzęt został usunięty" });
        }
    }
}
