using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class TrackDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string TypeOfSurface { get; set; }
        public double Length { get; set; }
        public int FacilityId { get; set; }
        public TimeSpan OpeningHour { get; set; }
        public TimeSpan ClosingHour { get; set; }
        public string AvailableDays { get; set; }
    }
}
