using srtk.Models;

namespace srtk.DTO
{
    public class EquipmentReservationDto
    {
        public int EquipmentId { get; set; }
        public int Quantity { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double Cost { get; set; }
    }
}
