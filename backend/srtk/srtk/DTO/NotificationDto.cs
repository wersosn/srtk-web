using System.ComponentModel.DataAnnotations;

namespace srtk.DTO
{
    public class NotificationDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tytuł powiadomienia jest wymagany")]
        [StringLength(50, ErrorMessage = "tytuł może mieć maksymalnie 50 znaków!")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Treść powiadomienia jest wymagana")]
        [StringLength(100, ErrorMessage = "Treść może mieć maksymalnie 100 znaków!")]
        public string Description { get; set; }

        public DateTime TimeStamp { get; set; }
        public bool IsRead { get; set; }
        public string Language { get; set; }

        [Required(ErrorMessage = "Id użytkownika jest wymagane")]
        [Range(1, int.MaxValue, ErrorMessage = "Id użytkownika musi być większe od 0!")]
        public int UserId { get; set; }
    }
}
