using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class ReservationDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Data rozpoczęcia jest wymagana!")]
        public DateTime Start { get; set; }

        [Required(ErrorMessage = "Data zakończenia jest wymagana!")]
        public DateTime End { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "Koszt musi być >= 0")]
        public double Cost { get; set; }
        public List<EquipmentReservationDto> EquipmentReservations { get; set; } = new();

        [Required(ErrorMessage = "Id toru jest wymagane")]
        public int TrackId { get; set; }
        public string TrackName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Id statusu jest wymagane")]
        public int StatusId { get; set; }
    }
}
