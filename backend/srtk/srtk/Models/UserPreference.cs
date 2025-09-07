using System.ComponentModel.DataAnnotations;

namespace srtk.Models
{
    public class UserPreference
    {
        [Key]
        public int UserId { get; set; }
        public int ElementsPerPage { get; set; }
    }
}
