using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class TrackMapping
    {
        public static TrackDto ToDto(this Track track)
        {
            return new TrackDto
            {
                Id = track.Id,
                Name = track.Name,
                TypeOfSurface = track.TypeOfSurface,
                Length = track.Length,
                OpeningHour = track.OpeningHour,
                ClosingHour = track.ClosingHour,
                AvailableDays = track.AvailableDays,
                FacilityId = track.FacilityId
            };
        }

        public static Track ToTrack(this TrackDto dto)
        {
            return new Track
            {
                Id = dto.Id,
                Name = dto.Name,
                TypeOfSurface = dto.TypeOfSurface,
                Length = dto.Length,
                OpeningHour = dto.OpeningHour,
                ClosingHour = dto.ClosingHour,
                AvailableDays = dto.AvailableDays,
                FacilityId = dto.FacilityId
            };
        }
    }
}
