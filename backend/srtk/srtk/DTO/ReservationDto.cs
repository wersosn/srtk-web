namespace srtk.DTO
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public double Cost { get; set; }
        public List<EquipmentReservationDto> EquipmentReservations { get; set; } = new();
        public int TrackId { get; set; }
        public string TrackName { get; set; } = string.Empty;
        public int StatusId { get; set; }
    }
}
