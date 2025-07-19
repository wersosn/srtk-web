using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;

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
        public async Task<List<Notification>> GetAllForUser(int userId)
        {
            return await context.Notifications.Where(u => u.UserId == userId).ToListAsync();
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
    }
}
