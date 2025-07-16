using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext context;

        public NotificationsController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich powiadomień (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Notification>>> GetAllNotifications()
        {
            var notifications = await context.Notifications.ToListAsync();
            return notifications;
        }

        // Pobieranie powiadomień konkretnego użytkownika:
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Notification>>> GetAllUserNotification(int userId)
        {
            var notifications = await context.Notifications.Where(u => u.UserId == userId).ToListAsync();
            return notifications;
        }
    }
}
