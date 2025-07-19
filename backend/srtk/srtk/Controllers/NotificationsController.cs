using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService service;

        public NotificationsController(NotificationService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich powiadomień (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Notification>>> GetAllNotifications()
        {
            var notifications = await service.GetAll();
            return notifications;
        }

        // Pobieranie powiadomień konkretnego użytkownika:
        [HttpGet("users/{userId}/all")]
        public async Task<ActionResult<List<Notification>>> GetAllUserNotification(int userId)
        {
            var notifications = await service.GetAllForUser(userId);
            return notifications;
        }

        // Pobieranie powiadomień nieprzeczytanych:
        [HttpGet("users/{userId}/unread")]
        public async Task<ActionResult<List<Notification>>> GetAllUnReadNotifications(int userId)
        {
            var notifications = await service.GetAllUnRead(userId);
            return notifications;
        }

        // Pobieranie powiadomień nprzeczytanych:
        [HttpGet("users/{userId}/read")]
        public async Task<ActionResult<List<Notification>>> GetAllReadNotifications(int userId)
        {
            var notifications = await service.GetAllRead(userId);
            return notifications;
        }

        // Pobranie konkretnego powiadomienia:
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotificationById(int id)
        {
            var notification = await service.GetById(id);
            if (notification == null)
            {
                return NotFound();
            }
            return notification;
        }

        // Dodanie nowej roli:
        [HttpPost]
        public async Task<ActionResult<Notification>> AddNotification(Notification notification)
        {
            var n = await service.Add(notification);
            return CreatedAtAction(nameof(GetNotificationById), new { id = n.Id }, n);
        }
    }
}
