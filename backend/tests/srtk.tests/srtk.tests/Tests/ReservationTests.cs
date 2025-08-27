using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using srtk.tests.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit.Abstractions;
using DocumentFormat.OpenXml;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Microsoft.Extensions.Configuration;

namespace srtk.tests.Tests
{
    public class ReservationTests
    {
        private EmailService emailService = new EmailServiceHelper(); // Pomocniczy serwis do wysyłania maili

        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public ReservationTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich rezerwacji (ogółem):
        [Fact]
        public async Task Getting_All_Reservations()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = 1
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.MinValue,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = 1
            };
            await service.Add(reservation2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość rezerwacji): " + result.Count);
        }

        // Test - pobranie konkretnej rezerwacji po Id:
        [Fact]
        public async Task Getting_Reservation_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var userService = new UserService(context);
            var trackService = new TrackService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track
            {
                Name = "Tor 1",
                Length = 100,
                TypeOfSurface = "Beton",
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.MinValue,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation2);

            var result = await service.GetById(reservation2.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Start}, {result.End}, {result.Track.Name}, {result.User.Email}");
        }

        // Test - pobranie rezerwacji po Torze:
        [Fact]
        public async Task Get_All_Reservations_In_Track()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track 
            { 
                Name = "Tor 1", 
                Length = 100, 
                TypeOfSurface = "Beton",
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var track2 = new Track 
            { 
                Name = "Tor 2", 
                Length = 200, 
                TypeOfSurface = "Asfalt",
                OpeningHour = new TimeSpan(10, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track2);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.Now.AddHours(2),
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.MinValue,
                End = DateTime.Now.AddHours(5),
                UserId = user.Id,
                TrackId = track2.Id
            };
            await service.Add(reservation2);

            var result = await service.GetAllInTrack(track.Id);
            Assert.Single(result);
            Assert.Equal(track.Id, result[0].TrackId);
            output.WriteLine($"Wynik dla {track.Name}: " + result.Count);
        }

        // Test - pobranie rezerwacji z danym statusem:
        [Fact]
        public async Task Get_All_Reservations_With_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var statusService = new StatusService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var status = new Status
            {
                Name = "Zarezerwowano"
            };
            await statusService.Add(status);

            var status2 = new Status
            {
                Name = "Anulowano"
            };
            await statusService.Add(status2);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.Now.AddHours(2),
                UserId = user.Id,
                TrackId = 1,
                StatusId = status.Id
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.MinValue,
                End = DateTime.Now.AddHours(5),
                UserId = user.Id,
                TrackId = 1,
                StatusId = status2.Id
            };
            await service.Add(reservation2);

            var result = await service.GetAllWithStatus(status.Id);
            Assert.Single(result);
            Assert.Equal(status.Id, result[0].StatusId);
            output.WriteLine($"Wynik dla {status.Name}: " + result.Count);
        }

        // Test - pobranie rezerwacji danego użytkownika:
        [Fact]
        public async Task Get_All_Reservations_With_User()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            user = await userService.Add(user);

            var user2 = new User
            {
                Email = "t3st@test.pl",
                Password = "test12345",
                RoleId = 1
            };
            user2 = await userService.Add(user2);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.Now.AddHours(2),
                UserId = user.Id,
                TrackId = 1
            };
            reservation = await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.MinValue,
                End = DateTime.Now.AddHours(5),
                UserId = user.Id,
                TrackId = 1
            };
            reservation2 = await service.Add(reservation2);

            var result = await service.GetUserReservations(user.Id);
            Assert.Equal(2, result.Count);
            output.WriteLine($"Wynik dla {user.Email}: " + result.Count);
        }

        // Test - rezerwacje z określoną datą i godziną rozpoczęcia:
        [Fact]
        public async Task Get_Reservations_With_Start()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var start = DateTime.Today.AddHours(10);

            var reservation = new Reservation
            {
                Start = start,
                End = start.AddMinutes(55),
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = start.AddHours(1),
                End = start.AddHours(2),
            };
            await service.Add(reservation2);

            var result = await service.GetByStartDateAndHour(start.Date, start.TimeOfDay);

            Assert.Single(result);
            Assert.Equal(start, result[0].Start);
            output.WriteLine($"Wynik (ilość rezerwacji z określoną datą i godziną rozpoczęcia): " + result.Count);
        }

        // Test - rezerwacje z określoną datą i godziną zakończenia:
        [Fact]
        public async Task Get_Reservations_With_End()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var end = DateTime.Today.AddHours(20);

            var reservation = new Reservation
            {
                Start = end.AddHours(-2),
                End = end,
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = end.AddHours(-8),
                End = end.AddHours(-6)
            };
            await service.Add(reservation2);

            var result = await service.GetByEndDateAndHour(end.Date, end.TimeOfDay);

            Assert.Single(result);
            Assert.Equal(end, result[0].End);
            output.WriteLine($"Wynik (ilość rezerwacji z określoną datą i godziną zakończenia): " + result.Count);
        }

        // Test - sprawdzenie czy rezerwacje się pokrywają:
        [Fact]
        public async Task Get_Overlapping_Reservations()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var start = DateTime.Today.AddHours(10).ToUniversalTime();
            var end = DateTime.Today.AddHours(12).ToUniversalTime();

            var reservation = new Reservation
            {
                Start = start.AddMinutes(-30),
                End = start.AddMinutes(30),
                TrackId = 1
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = end.AddHours(1), 
                End = end.AddHours(2),
                TrackId = 1
            };
            await service.Add(reservation2);

            var isAvailable = await service.IsTrackAvailable(1, start, end);

            Assert.True(isAvailable);
            output.WriteLine($"Wynik: rezerwacje się nie pokrywają");
        }

        // Test - dodawanie nowej rezerwacji:
        [Fact]
        public async Task Adding_New_Reservation()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var reservation = new Reservation
            {
                Start = DateTime.Now.ToUniversalTime(),
                End = DateTime.MaxValue.ToUniversalTime(),
                UserId = user.Id,
                TrackId = track.Id
            };

            var result = await service.Add(reservation);

            Assert.NotNull(result);
            Assert.Equal(DateTime.MaxValue.ToUniversalTime(), result.End);
            Assert.Equal("test@test.pl", result.User.Email);
            Assert.Equal("Tor kolarski", result.Track.Name);
            Assert.Single(context.Reservations);
            output.WriteLine("Wynik: Dodano nową rezerwację");
        }

        // Test - edycja rezerwacji:
        [Fact]
        public async Task Updating_Reservation()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation);

            var updatedReservation = new ReservationDto
            {
                Start = DateTime.MinValue,
                End = DateTime.MaxValue,
                TrackId = track.Id
            };

            var updated = await service.Update(reservation.Id, updatedReservation, "Client");

            Assert.NotNull(updated);
            Assert.Equal(DateTime.MinValue.ToUniversalTime(), updated.Start);
            Assert.Equal(DateTime.MaxValue.ToUniversalTime(), updated.End);
            Assert.Equal("test@test.pl", updated.User.Email);
            Assert.Equal("Tor kolarski", updated.Track.Name);
            Assert.Single(context.Reservations);
            output.WriteLine("Wynik: Zmodyfikowano rezerwację");
        }

        // Test - usuwanie rezerwacji:
        [Fact]
        public async Task Deleting_Reservation()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation);

            var deleted = await service.Delete(reservation.Id);

            Assert.Empty(context.Reservations);
            output.WriteLine("Wynik: Usunięto rezerwację");
        }

        // Test - sprawdzenie eksportu w formacie .xlsx:
        [Fact]
        public async Task Export_Reservations()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new ReservationServiceHelper(context, emailService);
            var trackService = new TrackService(context);
            var userService = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            await userService.Add(user);

            var track = new Track
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Czwartek"
            };
            await trackService.Add(track);

            var reservation = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation);

            var reservation2 = new Reservation
            {
                Start = DateTime.Now,
                End = DateTime.MaxValue,
                UserId = user.Id,
                TrackId = track.Id
            };
            await service.Add(reservation2);

            var result = await service.ExportToExcel(track.Id);
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
            output.WriteLine("Wynik: Wyeksportowano rezerwacje w formacie .xlsx");
        }
    }
}
