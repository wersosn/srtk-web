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

        public NotificationsController(NotificationService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetAllNotifications()
        {
            var notifications = await service.GetAll();
            return notifications;
        }

        [HttpGet("{userId}/all")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllUserNotifications(int userId)
        {
            var notifications = await service.GetAllForUser(userId);
            return notifications;
        }

        [HttpGet("{userId}/unread")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllUnReadNotifications(int userId)
        {
            var notifications = await service.GetAllUnRead(userId);
            return notifications;
        }

        [HttpGet("{userId}/read")]
        public async Task<ActionResult<List<NotificationDto>>> GetAllReadNotifications(int userId)
        {
            var notifications = await service.GetAllRead(userId);
            return notifications;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotificationById(int id)
        {
            var notification = await service.GetById(id);
            if (notification == null)
            {
                return NotFound();
            }
            return notification;
        }

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> AddNotification(NotificationDto notification)
        {
            var n = await service.Add(notification);
            return CreatedAtAction(nameof(GetNotificationById), new { id = n.Id }, n);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            var notification = await service.Delete(id);
            if (!notification)
            {
                return NotFound();
            }
            return Ok(new { message = "Powiadomienie zostało usunięte" });
        }
    }
}
