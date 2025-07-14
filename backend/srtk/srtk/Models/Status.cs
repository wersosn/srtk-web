using System.ComponentModel.DataAnnotations;

namespace srtk.Models
{
    public class Status
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
