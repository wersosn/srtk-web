using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class FacilityMapping
    {
        public static FacilityDto ToDto(this Facility facility)
        {
            return new FacilityDto
            {
                Id = facility.Id,
                Name = facility.Name,
                City = facility.City,
                Address = facility.Address
            };
        }

        public static Facility ToFacility(this FacilityDto dto)
        {
            return new Facility
            {
                Name = dto.Name,
                City = dto.City,
                Address = dto.Address
            };
        }
    }
}
