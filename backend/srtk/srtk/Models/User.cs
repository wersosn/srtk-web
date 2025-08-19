using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace srtk.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public bool EmailConfirmed { get; set; } = false;

        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }
        public Role? Role { get; set; }

        [JsonIgnore]
        public ICollection<Reservation> ReservationList { get; set; } = new List<Reservation>();

        [JsonIgnore]
        public ICollection<Notification> NotificationList { get; set; } = new List<Notification>();
    }
}
