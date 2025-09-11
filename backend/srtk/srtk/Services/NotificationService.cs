using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.DTO;
using srtk.Mappings;
using System.Data;

namespace srtk.Services
{
    public class NotificationService
    {
        private readonly AppDbContext context;

        public NotificationService(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<NotificationDto>> GetAll()
        {
            var notifications = await context.Notifications.ToListAsync();
            return notifications.Select(n => n.ToDto()).ToList();
        }

        public async Task<List<NotificationDto>> GetPolishForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && n.Language == "pl")
                .Select(n => n.ToDto())
                .ToListAsync();
            return notifications;
        }

        public async Task<List<NotificationDto>> GetEnglishForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && n.Language == "en")
                .Select(n => n.ToDto())
                .ToListAsync();
            return notifications;
        }

        public async Task<List<NotificationDto>> GetAllForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId)
                .Select(n => n.ToDto())
                .ToListAsync();
            return notifications;
        }

        public async Task<List<NotificationDto>> GetAllUnRead(int userId)
        {
            var notifications = await context.Notifications
                .Where(u => u.UserId == userId && u.IsRead == false)
                .Select(n => n.ToDto())
                .ToListAsync();
            return notifications;
        }

        public async Task<List<NotificationDto>> GetAllRead(int userId)
        {
            var notifications = await context.Notifications
                .Where(u => u.UserId == userId && u.IsRead == true)
                .Select(n => n.ToDto())
                .ToListAsync();
            return notifications;
        }

        public async Task<NotificationDto?> GetById(int id)
        {
            var notification = await context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return null;
            }
            return notification.ToDto();
        }

        public async Task MarkAllAsRead(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            notifications.ForEach(n => n.IsRead = true);
            await context.SaveChangesAsync();
        }

        public async Task<NotificationDto> Add(NotificationDto dto)
        {
            var notification = dto.ToNotification();
            context.Notifications.Add(notification);
            await context.SaveChangesAsync();
            return notification.ToDto();
        }

        public async Task<bool> Delete(int id)
        {
            var notification = await context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return false;
            }
            context.Notifications.Remove(notification);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
