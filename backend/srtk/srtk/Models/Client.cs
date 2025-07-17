namespace srtk.Models
{
    public class Client : User
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
