using Microsoft.AspNetCore.SignalR;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace srtk.Models
{
    public class Reservation
    {
        [Key]
        public int Id { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public double Cost { get; set; }

        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User? User { get; set; }

        [ForeignKey(nameof(Track))]
        public int TrackId { get; set; }
        public Track? Track { get; set; }

        [ForeignKey(nameof(Status))]
        public int StatusId { get; set; }
        public Status? Status { get; set; }

        //public List<int>? Equipments { get; set; }

        public ICollection<EquipmentReservation> EquipmentReservations { get; set; } = new List<EquipmentReservation>();
    }
}
