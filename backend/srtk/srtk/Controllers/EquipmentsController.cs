using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        [HttpGet("facilities/{facilityId}/equipment")]
        public async Task<ActionResult<List<Equipment>>> GetAllEquipmentsInFacility(int facilityId)
        {
            var equipments = await service.GetAllInFacility(facilityId);
            return equipments;
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
        public async Task<ActionResult<Equipment>> AddEquipment(Equipment equipment)
        {
            var eq = await service.Add(equipment);
            return CreatedAtAction(nameof(GetEquipmentById), new { id = eq.Id }, eq);
        }

        // Edycja istniejącego sprzętu:
        [HttpPut("{id}")]
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
