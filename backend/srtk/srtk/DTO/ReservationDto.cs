namespace srtk.DTO
{
    public class ReservationDto
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public List<EquipmentReservationDto> Equipment { get; set; } = new();
        public int TrackId { get; set; }
    }
}
