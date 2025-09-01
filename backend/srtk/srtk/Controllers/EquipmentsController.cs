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

        public EquipmentsController(EquipmentService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<EquipmentDto>>> GetAllEquipments()
        {
            var equipments = await service.GetAll();
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
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            return Ok(equipments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EquipmentDto>> GetEquipmentById(int id)
        {
            var equipment = await service.GetById(id);
            if (equipment == null)
            {
                return NotFound();
            }
            return Ok(equipment);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentDto>> AddEquipment(EquipmentDto equipment)
        {
            var eq = await service.Add(equipment);
            return CreatedAtAction(nameof(GetEquipmentById), new { id = eq.Id }, eq);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EquipmentDto>> UpdateEquipment(int id, [FromBody] EquipmentDto dto)
        {
            var equipment = await service.Update(id, dto);
            if (equipment == null)
            {
                return NotFound("Sprzęt nie istnieje");
            }
            return Ok(equipment);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteEquipment(int id)
        {
            var equipment = await service.Delete(id);
            if (!equipment)
            {
                return NotFound();
            }
            return Ok(new { message = "Sprzęt został usunięty" });
        }
    }
}
