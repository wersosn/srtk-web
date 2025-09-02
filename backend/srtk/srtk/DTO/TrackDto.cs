using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class TrackDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nazwa toru jest wymagana")]
        [StringLength(100, ErrorMessage = "Nazwa może mieć maksymalnie 100 znaków!")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Typ nawierzchni toru jest wymagany")]
        [StringLength(100, ErrorMessage = "Nazwa typu nawierzchni może mieć maksymalnie 100 znaków!")]
        public string TypeOfSurface { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "Długość musi być >= 0!")]
        public double Length { get; set; }

        [Required(ErrorMessage = "Id obiektu jest wymagane!")]
        public int FacilityId { get; set; }

        [Required(ErrorMessage = "Godzina otwarcia jest wymagana!")]
        public TimeSpan OpeningHour { get; set; }

        [Required(ErrorMessage = "Godzina zamknięcia jest wymagana!")]
        public TimeSpan ClosingHour { get; set; }

        [Required(ErrorMessage = "Dni, w których tor jest otwarty są wymagane!")]
        public string AvailableDays { get; set; }
    }
}
