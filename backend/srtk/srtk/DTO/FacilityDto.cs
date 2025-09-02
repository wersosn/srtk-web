using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class FacilityDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nazwa obiektu jest wymagana")]
        [StringLength(100, ErrorMessage = "Nazwa może mieć maksymalnie 100 znaków!")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Miasto, w którym znajduje się obiekt jest wymagane")]
        [StringLength(50, ErrorMessage = "Nazwa miasta może mieć maksymalnie 50 znaków!")]
        public string City { get; set; }

        [Required(ErrorMessage = "Adres, pod którym znajduje się obiekt jest wymagany")]
        [StringLength(50, ErrorMessage = "Adres może mieć maksymalnie 50 znaków!")]
        public string Address { get; set; }
    }
}
