using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService service;
        private readonly ILogger<NotificationsController> logger;

        public NotificationsController(NotificationService service, ILogger<NotificationsController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetAllNotifications()
        {
            var notifications = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie powiadomienia, ilość: {Count}", notifications.Count);
            return notifications;
        }

        [HttpGet("{userId}/pl")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllPolishForUser(int userId)
        {
            var notifications = await service.GetPolishForUser(userId);
            logger.LogInformation("Pobrano wszystkie powiadomienia w języku Polskim dla użytkownika z Id {userId}, ilość: {Count}", userId, notifications.Count);
            return notifications;
        }

        [HttpGet("{userId}/en")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllEnglishForUser(int userId)
        {
            var notifications = await service.GetEnglishForUser(userId);
            logger.LogInformation("Pobrano wszystkie powiadomienia w języku Angielskim dla użytkownika z Id {userId}, ilość: {Count}", userId, notifications.Count);
            return notifications;
        }

        [HttpGet("{userId}/all")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllUserNotifications(int userId)
        {
            var notifications = await service.GetAllForUser(userId);
            logger.LogInformation("Pobrano wszystkie powiadomienia dla użytkownika z Id {userId}, ilość: {Count}", userId, notifications.Count);
            return notifications;
        }

        [HttpGet("{userId}/unread")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllUnReadNotifications(int userId)
        {
            var notifications = await service.GetAllUnRead(userId);
            logger.LogInformation("Pobrano wszystkie nieprzeczytane powiadomienia dla użytkownika z Id {userId}, ilość: {Count}", userId, notifications.Count);
            return notifications;
        }

        [HttpGet("{userId}/read")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllReadNotifications(int userId)
        {
            var notifications = await service.GetAllRead(userId);
            logger.LogInformation("Pobrano wszystkie przeczytane powiadomienia dla użytkownika z Id {userId}, ilość: {Count}", userId, notifications.Count);
            return notifications;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotificationById(int id)
        {
            var notification = await service.GetById(id);
            if (notification == null)
            {
                logger.LogWarning("Nie znaleziono powiadomienia z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono powiadomienie z Id {Id}: {Title}", id, notification.Title);
            return notification;
        }

        [HttpPut("{userId}/markAllRead")]
        [Authorize]
        public async Task<IActionResult> MarkAllAsReadForUser(int userId)
        {
            await service.MarkAllAsRead(userId);
            logger.LogInformation("Odznaczono jako przeczytane powiadomienia użytkownika z Id {userId}", userId);
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> AddNotification(NotificationDto dto)
        {
            var notification = await service.Add(dto);
            logger.LogInformation("Dodano nowe powiadomienie: {Title} dla użytkownika z Id: {UserId}", notification.Title, notification.UserId);
            return CreatedAtAction(nameof(GetNotificationById), new { id = notification.Id }, notification);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            var notification = await service.Delete(id);
            if (!notification)
            {
                logger.LogWarning("Nie udało się usunąć powiadomienia z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto powiadomienie z Id {Id}", id);
            return Ok(new { message = "Powiadomienie zostało usunięte" });
        }
    }
}
