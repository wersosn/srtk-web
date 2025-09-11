using DocumentFormat.OpenXml.Spreadsheet;
using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class UserMapping
    {
        public static UserDto ToDto(this User user)
        {
            var dto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                RoleId = user.RoleId
            };

            if (user is Client client)
            {
                dto.Name = client.Name;
                dto.Surname = client.Surname;
                dto.PhoneNumber = client.PhoneNumber;
            }

            if (user is Admin admin)
            {
                dto.FacilityId = admin.FacilityId;
            }

            return dto;
        }

        public static User ToUser(this UserDto dto)
        {
            if(dto.RoleId == 1)
            {
                return new Client
                {
                    Id = dto.Id,
                    Email = dto.Email,
                    RoleId = dto.RoleId,
                    Name = dto.Name ?? "",
                    Surname = dto.Surname ?? "",
                    PhoneNumber = dto.PhoneNumber ?? ""
                };
            }
            else if(dto.RoleId == 2)
            {
                return new Admin
                {
                    Id = dto.Id,
                    Email = dto.Email,
                    RoleId = dto.RoleId,
                    FacilityId = dto.FacilityId ?? 0
                };
            }
            
            return new User
            {
                Email = dto.Email,
                RoleId = dto.RoleId
            };
        }
    }
}
