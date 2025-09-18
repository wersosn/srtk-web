using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Mappings;

namespace srtk.Services
{
    public class EquipmentService
    {
        private readonly AppDbContext context;

        public EquipmentService(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<EquipmentDto>> GetAll()
        {
            var equipments = await context.Equipments.ToListAsync();
            return equipments.Select(e => e.ToDto()).ToList();
        }

        public async Task<List<EquipmentDto>> GetAllInFacility(int facilityId)
        {
            var equipments = await context.Equipments.Where(e => e.FacilityId == facilityId).ToListAsync();
            return equipments.Select(e => e.ToDto()).ToList();
        }

        public async Task<EquipmentDto?> GetById(int id)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return null;
            }
            return equipment.ToDto();
        }

        public async Task<EquipmentDto> Add(EquipmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type) || dto.Cost < 0)
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

            var equipment = dto.ToEquipment();
            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();
            return equipment.ToDto();
        }

        public async Task<EquipmentDto?> Update(int id, [FromBody] EquipmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type) || dto.Cost < 0)
            {
                throw new Exception("Nie uzupełniono wszystkich wymaganych pól");
            }

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
            return equipment.ToDto();
        }

        public async Task<bool> Delete(int id)
        {
            var equipment = await context.Equipments.Include(e => e.EquipmentReservations).ThenInclude(er => er.Reservation).FirstOrDefaultAsync(e => e.Id == id);
            if (equipment == null)
            {
                return false;
            }

            // Usunięcie sprzętów z nadchodzących rezerwacji oraz zmiana kosztu:
            var upcomingReservations = equipment.EquipmentReservations
                .Where(er => er.Reservation != null && er.Reservation.Start >= DateTime.Now)
                .ToList();

            foreach (var er in upcomingReservations)
            {
                er.Reservation!.Cost -= er.Quantity * equipment.Cost;
                context.EquipmentReservations.Remove(er);
            }

            context.Equipments.Remove(equipment);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
