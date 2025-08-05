using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


namespace srtk.Models
{
    public class EquipmentReservation
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey(nameof(Reservation))]
        public int ReservationId { get; set; }
        [JsonIgnore]
        public Reservation? Reservation { get; set; }

        [ForeignKey(nameof(Equipment))]
        public int EquipmentId { get; set; }
        [JsonIgnore]
        public Equipment? Equipment { get; set; }

        public int Quantity { get; set; }
    }
}
