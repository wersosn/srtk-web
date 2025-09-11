using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class NotificationMapping
    {
        public static NotificationDto ToDto(this Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Description = notification.Description,
                TimeStamp = notification.TimeStamp,
                IsRead = notification.IsRead,
                UserId = notification.UserId
            };
        }

        public static Notification ToNotification(this NotificationDto dto)
        {
            return new Notification
            {
                Title = dto.Title,
                Description = dto.Description,
                TimeStamp = dto.TimeStamp,
                IsRead = dto.IsRead,
                Language = dto.Language,
                UserId = dto.UserId
            };
        }
    }
}
