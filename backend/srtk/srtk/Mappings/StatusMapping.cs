using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class StatusMapping
    {
        public static StatusDto ToDto(this Status status)
        {
            return new StatusDto
            {
                Id = status.Id,
                Name = status.Name
            };
        }

        public static Status ToStatus(this StatusDto dto)
        {
            return new Status
            {
                Name = dto.Name
            };
        }
    }
}
