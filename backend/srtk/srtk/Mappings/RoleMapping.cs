using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class RoleMapping
    {
        public static RoleDto ToDto(this Role role)
        {
            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name
            };
        }

        public static Role ToRole(this RoleDto dto)
        {
            return new Role
            {
                Name = dto.Name
            };
        }
    }
}
