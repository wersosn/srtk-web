using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace srtk.Models
{
    public class Track
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string TypeOfSurface { get; set; }

        [Required]
        public double Length { get; set; }

        [Required]
        public TimeSpan OpeningHour { get; set; }

        [Required]
        public TimeSpan ClosingHour { get; set; }

        [Required]
        public string AvailableDays { get; set; }

        [ForeignKey(nameof(Facility))]
        public int FacilityId { get; set; }
        public Facility? Facility { get; set; }

        [JsonIgnore]
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
