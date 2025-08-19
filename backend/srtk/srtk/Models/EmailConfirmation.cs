using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace srtk.Models
{
    public class EmailConfirmation
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; }

        [Required]
        [MaxLength(256)]
        public string Token { get; set; }

        [Required]
        public DateTime Expiry { get; set; }
        public bool Confirmed { get; set; } = false;
    }
}
