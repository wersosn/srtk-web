using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class EquipmentReservationMapping
    {
        public static EquipmentReservationDto ToDto(this EquipmentReservation equipmentReservation)
        {
            return new EquipmentReservationDto
            {
                EquipmentId = equipmentReservation.EquipmentId,
                Name = equipmentReservation.Equipment!.Name,
                Type = equipmentReservation.Equipment!.Type,
                Cost = equipmentReservation.Equipment.Cost,
                Quantity = equipmentReservation.Quantity
            };
        }
    }
}
