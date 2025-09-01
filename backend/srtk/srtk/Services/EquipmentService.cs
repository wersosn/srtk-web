using DocumentFormat.OpenXml.InkML;
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

        public async Task<List<EquipmentDto>> GetAll()
        {
            var equipments = await context.Equipments.ToListAsync();
            var list = equipments.Select(e => new EquipmentDto
            {
                Id = e.Id,
                Name = e.Name,
                Type = e.Type,
                Cost = e.Cost,
                FacilityId = e.FacilityId
            }).ToList();
            return list;
        }

        public async Task<List<EquipmentDto>> GetAllInFacility(int facilityId)
        {
            var equipments = await context.Equipments.Where(e => e.FacilityId == facilityId).ToListAsync();
            var list = equipments.Select(e => new EquipmentDto
            {
                Id = e.Id,
                Name = e.Name,
                Type = e.Type,
                Cost = e.Cost,
                FacilityId = e.FacilityId
            }).ToList();
            return list;
        }

        public async Task<EquipmentDto?> GetById(int id)
        {
            var equipment = await context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return null;
            }

            var eDto = new EquipmentDto
            {
                Id = equipment.Id,
                Name = equipment.Name,
                Type = equipment.Type,
                Cost = equipment.Cost,
                FacilityId = equipment.FacilityId
            };

            return eDto;
        }

        public async Task<EquipmentDto> Add(EquipmentDto dto)
        {
            var equipment = new Equipment
            {
                Name = dto.Name,
                Type = dto.Type,
                Cost = dto.Cost,
                FacilityId = dto.FacilityId
            };

            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();

            var eDto = new EquipmentDto
            {
                Id = equipment.Id,
                Name = equipment.Name,
                Type = equipment.Type,
                Cost = equipment.Cost,
                FacilityId = equipment.FacilityId
            };
            return eDto;
        }

        public async Task<EquipmentDto?> Update(int id, [FromBody] EquipmentDto dto)
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

            var eDto = new EquipmentDto
            {
                Id = equipment.Id,
                Name = equipment.Name,
                Type = equipment.Type,
                Cost = equipment.Cost,
                FacilityId = equipment.FacilityId
            };
            return eDto;
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
