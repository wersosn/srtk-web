namespace srtk.DTO
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime TimeStamp { get; set; }
        public bool IsRead { get; set; }
        public int UserId { get; set; }
    }
}
