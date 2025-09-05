using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.DTO;
using System.Data;
using Microsoft.AspNetCore.SignalR;

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
            var list = notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                TimeStamp = n.TimeStamp,
                IsRead = n.IsRead,
                UserId = n.UserId
            }).ToList();
            return list;
        }

        public async Task<List<NotificationDto>> GetPolishForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && n.Language == "pl")
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

        public async Task<List<NotificationDto>> GetEnglishForUser(int userId)
        {
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && n.Language == "en")
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

        public async Task<List<NotificationDto>> GetAllUnRead(int userId)
        {
            var notifications = await context.Notifications
                .Where(u => u.UserId == userId && u.IsRead == false)
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

        public async Task<List<NotificationDto>> GetAllRead(int userId)
        {
            var notifications = await context.Notifications
                .Where(u => u.UserId == userId && u.IsRead == true)
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

        public async Task<NotificationDto?> GetById(int id)
        {
            var notification = await context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return null;
            }

            var dto = new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Description = notification.Description,
                TimeStamp = notification.TimeStamp,
                IsRead = notification.IsRead,
                UserId = notification.UserId
            };
            return dto;
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
            var notification = new Notification
            {
                Title = dto.Title,
                Description = dto.Description,
                TimeStamp = dto.TimeStamp,
                IsRead = dto.IsRead,
                Language = dto.Language,
                UserId = dto.UserId
            };
            context.Notifications.Add(notification);
            await context.SaveChangesAsync();
            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Description = notification.Description,
                TimeStamp = notification.TimeStamp,
                IsRead = notification.IsRead,
                Language = notification.Language,
                UserId = notification.UserId
            };
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
