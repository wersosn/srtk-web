using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }
        public Role Role { get; set; }

        public ICollection<Reservation> ResrvationList { get; set; } = new List<Reservation>();
        public ICollection<Notification> NotificationList { get; set; } = new List<Notification>();
    }
}
