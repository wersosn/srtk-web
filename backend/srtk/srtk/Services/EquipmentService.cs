using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Services
{
    public class EquipmentService
    {
        private readonly AppDbContext context;

        public EquipmentService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich sprzętów:
        public async Task<List<Equipment>> GetAll()
        {
            return await context.Equipments.ToListAsync();
        }

        // Pobieranie wszystkich sprzętów należących do konkretnego obiektu:
        public async Task<List<Equipment>> GetAllInFacility(int facilityId)
        {
            return await context.Equipments.Where(e => e.FacilityId == facilityId).ToListAsync();
        }

        // Pobranie konkretnego sprzętu:
        public async Task<Equipment?> GetById(int id)
        {
            return await context.Equipments.FindAsync(id);
        }

        // Dodanie nowego sprzętu:
        [HttpPost]
        public async Task<Equipment> Add(Equipment equipment)
        {
            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();
            return equipment;
        }

        // Edycja istniejącego sprzętu:
        public async Task<Equipment?> Update(int id, [FromBody] EquipmentDto dto)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return null;
            }
            equipment.Name = dto.Name;
            equipment.Cost = dto.Cost;
            equipment.Type = dto.Type;
            equipment.FacilityId = dto.FacilityId;
            await context.SaveChangesAsync();
            return equipment;
        }

        // Usunięcie istniejącego sprzętu:
        public async Task<bool> Delete(int id)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return false;
            }
            context.Equipments.Remove(equipment);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
