using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class StatusDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nazwa statusu jest wymagana")]
        [StringLength(100, ErrorMessage = "Nazwa może mieć maksymalnie 100 znaków!")]
        public string Name { get; set; }
    }
}
