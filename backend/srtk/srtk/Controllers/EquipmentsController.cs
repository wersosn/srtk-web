using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentsController : ControllerBase
    {
        private readonly AppDbContext context;

        public EquipmentsController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich sprzętów:
        [HttpGet]
        public async Task<ActionResult<List<Equipment>>> GetAllEquipments()
        {
            var equipments = await context.Equipments.ToListAsync();
            return equipments;
        }

        // Pobieranie wszystkich sprzętów należących do konkretnego obiektu:
        [HttpGet("facility/{facilityId}")]
        public async Task<ActionResult<List<Equipment>>> GetAllEquipmentsInFacility(int facilityId)
        {
            var equipments = await context.Equipments.Where(e => e.FacilityId == facilityId).ToListAsync();
            return equipments;
        }

        // Pobranie konkretnego sprzętu:
        [HttpGet("{id}")]
        public async Task<ActionResult<Equipment>> GetEquipmentById(int id)
        {
            var equipment = await context.Equipments.FindAsync(id);
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
            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEquipmentById), new { id = equipment.Id }, equipment);
        }

        // Edycja istniejącego sprzętu:
        [HttpPut("{id}")]
        public async Task<ActionResult<Equipment>> UpdateEquipment(int id, [FromBody] EquipmentDto dto)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return NotFound("Status nie istnieje");
            }
            equipment.Name = dto.Name;
            equipment.Cost = dto.Cost;
            equipment.Type = dto.Type;
            equipment.FacilityId = dto.FacilityId;
            await context.SaveChangesAsync();
            return Ok(equipment);
        }

        // Usunięcie istniejącego sprzętu:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Equipment>> DeleteEquipment(int id)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return NotFound();
            }
            context.Equipments.Remove(equipment);
            await context.SaveChangesAsync();
            return Ok(new { message = "Sprzęt został usunięty" });
        }
    }
}
