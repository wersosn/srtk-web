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

        // Pobranie wszystkich sprzętów:
        [HttpGet]
        public async Task<ActionResult<List<Equipment>>> GetAllEquipments()
        {
            var equipments = await service.GetAll();
            return equipments;
        }

        // Pobieranie wszystkich sprzętów należących do konkretnego obiektu:
        [HttpGet("inFacility")]
        public async Task<ActionResult<List<Equipment>>> GetAllEquipmentsInFacility([FromQuery] int? facilityId)
        {
            List<Equipment> equipments;

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
                else if (int.TryParse(facilityIdClaim.Value, out int actualFacilityId))
                {
                    Console.WriteLine($"FacilityId z tokena: {actualFacilityId}");
                    equipments = await service.GetAllInFacility(actualFacilityId);
                }
                else
                {
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            return Ok(equipments);
        }

        // Pobranie konkretnego sprzętu:
        [HttpGet("{id}")]
        public async Task<ActionResult<Equipment>> GetEquipmentById(int id)
        {
            var equipment = await service.GetById(id);
            if (equipment == null)
            {
                return NotFound();
            }
            return equipment;
        }

        // Dodanie nowego sprzętu:
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Equipment>> AddEquipment(Equipment equipment)
        {
            var eq = await service.Add(equipment);
            return CreatedAtAction(nameof(GetEquipmentById), new { id = eq.Id }, eq);
        }

        // Edycja istniejącego sprzętu:
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Equipment>> UpdateEquipment(int id, [FromBody] EquipmentDto dto)
        {
            var equipment = await service.Update(id, dto);
            if (equipment == null)
            {
                return NotFound("Sprzęt nie istnieje");
            }
            return Ok(equipment);
        }

        // Usunięcie istniejącego sprzętu:
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Equipment>> DeleteEquipment(int id)
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
