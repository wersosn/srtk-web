using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class EquipmentDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nazwa sprzętu jest wymagana")]
        [StringLength(100, ErrorMessage = "Nazwa może mieć maksymalnie 100 znaków!")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Typ sprzętu jest wymagany")]
        [StringLength(100, ErrorMessage = "Typ może mieć maksymalnie 100 znaków!")]
        public string Type { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "Koszt musi być >= 0!")]
        public double Cost { get; set; }

        [Required(ErrorMessage = "Id obiektu jest wymagane!")]
        public int FacilityId { get; set; }
    }
}
