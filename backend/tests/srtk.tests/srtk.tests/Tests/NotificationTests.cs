using srtk.Models;
using srtk.Services;
using srtk.DTO;
using srtk.tests.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit.Abstractions;

namespace srtk.tests.Tests
{
    public class NotificationTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public NotificationTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich powiadomień:
        [Fact]
        public async Task Getting_All_Notifications()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                Language = "pl"
            };
            await service.Add(notif);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Single(result);
            output.WriteLine("Wynik (ilość powiadomień): " + result.Count);
        }

        // Test - próba pobrania wszystkich powiadomień, gdy lista jest pusta:
        [Fact]
        public async Task Getting_All_Notifications_Empty_List()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new NotificationService(context);

            var result = await service.GetAll();

            Assert.Empty(result);
            output.WriteLine("Wynik: Brak powiadomień");
        }

        // Test - pobranie powiadomień konkretnego użytkownika:
        [Fact]
        public async Task Getting_All_For_User()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                Language = "pl"
            };
            await service.Add(notif);

            var result = await service.GetAllForUser(user.Id);

            Assert.NotNull(result);
            Assert.Single(result);
            output.WriteLine($"Wynik - ilość powiadomień użytkownika {user.Email}: " + result.Count);
        }

        // Test - pobranie powiadomień konkretnego użytkownika z błędym Id:
        [Fact]
        public async Task Getting_All_For_User_With_Invalid_Id()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Id = 333,
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                Language = "pl"
            };
            await service.Add(notif);

            var result = await service.GetAllForUser(5);

            Assert.Empty(result);
            output.WriteLine($"Wynik: Brak powiadomeń, ze względu na błędne Id użytkownika");
        }

        // Test - pobranie nieprzeczytanych powiadomień danego użytkownika:
        [Fact]
        public async Task Getting_All_Unread_For_User()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif);

            var notif2 = new NotificationDto
            {
                Title = "Anulowano rezerwację",
                Description = "Anulowano rezerwację na tor kolarski",
                UserId = user.Id,
                Language = "pl"
            };
            await service.Add(notif2);

            var result = await service.GetAllUnRead(user.Id);

            Assert.NotNull(result);
            Assert.Single(result);
            output.WriteLine($"Wynik - ilość nieprzeczytanych powiadomień użytkownika {user.Email}: " + result.Count);
        }

        // Test - pobranie przeczytanych powiadomień danego użytkownika:
        [Fact]
        public async Task Getting_All_Read_For_User()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif);

            var notif2 = new NotificationDto
            {
                Title = "Anulowano rezerwację",
                Description = "Anulowano rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif2);

            var result = await service.GetAllRead(user.Id);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine($"Wynik - ilość przeczytanych powiadomień użytkownika {user.Email}: " + result.Count);
        }

        // Test - pobranie konkretnego powiadomienia:
        [Fact]
        public async Task Getting_Notification_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Id = 1,
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif);

            var notif2 = new NotificationDto
            {
                Title = "Anulowano rezerwację",
                Description = "Anulowano rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif2);

            var result = await service.GetById(notif.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Title}, {result.Description}, {result.TimeStamp}");
        }

        // Test - dodawanie nowego powiadomienia:
        [Fact]
        public async Task Adding_New_Notification()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };

            var result = await service.Add(notif);

            Assert.NotNull(result);
            Assert.Equal("Dodano rezerwację", result.Title);
            Assert.Equal("Dodano nową rezerwację na tor kolarski", result.Description);
            Assert.Equal(user.Id, result.UserId);
            Assert.True(result.IsRead);
            Assert.Single(context.Notifications);
            output.WriteLine($"Wynik: Dodano nowe powiadomienie dla użytkownika: {result.UserId}");
        }

        // Test - usuwanie powiadomienia:
        [Fact]
        public async Task Deleting_Notification()
        {
            var context = DbContextHelper.GetDbContext();
            var userService = new UserService(context);
            var service = new NotificationService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await userService.Add(user);

            var notif = new NotificationDto
            {
                Id = 1,
                Title = "Dodano rezerwację",
                Description = "Dodano nową rezerwację na tor kolarski",
                UserId = user.Id,
                IsRead = true,
                Language = "pl"
            };
            await service.Add(notif);

            var deleted = await service.Delete(notif.Id);

            Assert.Empty(context.Notifications);
            output.WriteLine("Wynik: Usunięto powiadomienie");
        }
    }
}
