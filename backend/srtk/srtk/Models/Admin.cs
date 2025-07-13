using System.ComponentModel.DataAnnotations.Schema;

namespace srtk.Models
{
    public class Admin : User
    {
        [ForeignKey(nameof(Facility))]
        public int FacilityId { get; set; }
        public Facility Facility { get; set; }
    }
}
