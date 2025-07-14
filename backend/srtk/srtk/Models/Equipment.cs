using System.ComponentModel.DataAnnotations;

namespace srtk.Models
{
    public class Equipment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Type { get; set; }

        public double Cost { get; set; }

        public ICollection<EquipmentReservation> EquipmentReservations { get; set; } = new List<EquipmentReservation>();
    }
}
