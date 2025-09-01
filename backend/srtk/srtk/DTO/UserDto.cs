namespace srtk.DTO
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }

        // Pola dla klienta:
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? PhoneNumber { get; set; }

        // Pola dla admina:
        public int? FacilityId { get; set; }
    }
}
