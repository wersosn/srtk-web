using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class EquipmentMapping
    {
        public static EquipmentDto ToDto(this Equipment equipment)
        {
            return new EquipmentDto
            {
                Id = equipment.Id,
                Name = equipment.Name,
                Type = equipment.Type,
                Cost = equipment.Cost,
                FacilityId = equipment.FacilityId
            };
        }

        public static Equipment ToEquipment(this EquipmentDto dto)
        {
            return new Equipment
            {
                Name = dto.Name,
                Type = dto.Type,
                Cost = dto.Cost,
                FacilityId = dto.FacilityId
            };
        }
    }
}
