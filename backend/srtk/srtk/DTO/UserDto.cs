using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class UserDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Adres e-mail jest wymagany")]
        [EmailAddress(ErrorMessage = "Niepoprawny format adresu e-mail")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Id roli jest wymagane")]
        public int RoleId { get; set; }

        // Pola dla klienta:
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? PhoneNumber { get; set; }

        // Pola dla admina:
        public int? FacilityId { get; set; }
    }
}
