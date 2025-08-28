using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.DTO;
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

        // Pobranie wszystkich powiadomień (ogółem):
        public async Task<List<Notification>> GetAll()
        {
            return await context.Notifications.ToListAsync();
        }

        // Pobieranie powiadomień konkretnego użytkownika:
        public async Task<List<NotificationDto>> GetAllForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    TimeStamp = n.TimeStamp,
                    IsRead = n.IsRead
                })
                .ToListAsync();
            return notifications;
        }

        // Pobieranie powiadomień nieprzeczytanych:
        public async Task<List<Notification>> GetAllUnRead(int userId)
        {
            return await context.Notifications.Where(u => u.UserId == userId && u.IsRead == false).ToListAsync();
        }

        // Pobieranie powiadomień przeczytanych:
        public async Task<List<Notification>> GetAllRead(int userId)
        {
            return await context.Notifications.Where(u => u.UserId == userId && u.IsRead == true).ToListAsync();
        }

        // Pobranie konkretnego powiadomienia:
        public async Task<Notification?> GetById(int id)
        {
            return await context.Notifications.FindAsync(id);
        }

        // Dodanie nowego powiadomienia:
        public async Task<Notification> Add(Notification notification)
        {
            context.Notifications.Add(notification);
            await context.SaveChangesAsync();
            return notification;
        }

        // Usuwanie istniejącego powiadomienia:
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
