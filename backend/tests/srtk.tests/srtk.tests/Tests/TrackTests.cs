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

namespace srtk.tests.Tests
{
    public class TrackTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public TrackTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich torów:
        [Fact]
        public async Task Getting_All_Tracks()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota"
            };
            await service.Add(track);

            var track2 = new TrackDto
            {
                Name = "Tor 2",               
                TypeOfSurface = "Asfalt",
                Length = 200,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(18, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota"
            };
            await service.Add(track2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość torów): " + result.Count);
        }

        // Test - próba pobrania wszystkich torów, gdy lista jest pusta:
        [Fact]
        public async Task Getting_All_Tracks_Empty_List()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);

            var result = await service.GetAll();

            Assert.Empty(result);
            output.WriteLine("Wynik: Brak torów");
        }

        // Test - pobranie torów należących do konkretnego obiektu:
        [Fact]
        public async Task Getting_All_Tracks_In_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var facilityService = new FacilityService(context);
            var service = new TrackService(context);
            var facility = new FacilityDto
            {
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            await facilityService.Add(facility);

            var track = new TrackDto
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
                FacilityId = facility.Id
            };
            await service.Add(track);

            var track2 = new TrackDto
            {
                Name = "Tor 2",
                TypeOfSurface = "Asfalt",
                Length = 200,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(18, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
                FacilityId = facility.Id
            };
            await service.Add(track2);

            var result = await service.GetAllInFacility(facility.Id);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine($"Wynik - ilość torów w obiekcie {facility.Name}: " + result.Count);
        }

        // Test - pobranie konkretnego toru:
        [Fact]
        public async Task Getting_Track_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };
            await service.Add(track);

            var track2 = new TrackDto
            {
                Id = 2,
                Name = "Tor 2",
                TypeOfSurface = "Asfalt",
                Length = 200,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(16, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Sobota",
            };
            await service.Add(track2);

            var result = await service.GetById(track2.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}, {result.TypeOfSurface}, {result.Length}");
        }

        // Test - pobranie konkretnego toru, z nieprawidłowym Id:
        [Fact]
        public async Task Getting_Track_ById_With_Invalid_Id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };
            await service.Add(track);

            var track2 = new TrackDto
            {
                Id = 2,
                Name = "Tor 2",
                TypeOfSurface = "Asfalt",
                Length = 200,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(16, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Sobota",
            };
            await service.Add(track2);

            var result = await service.GetById(3);

            Assert.Null(result);
            output.WriteLine($"Wynik: Brak toru z podanym Id");
        }

        // Test - dodawanie nowego toru:
        [Fact]
        public async Task Adding_New_Track()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };

            var result = await service.Add(track);

            Assert.NotNull(result);
            Assert.Equal("Tor kolarski", result.Name);
            Assert.Equal("Gładka", result.TypeOfSurface);
            Assert.Equal(1000, result.Length);
            Assert.Equal(new TimeSpan(8, 0, 0), result.OpeningHour);
            Assert.Equal(new TimeSpan(20, 0, 0), result.ClosingHour);
            Assert.Equal("Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota", result.AvailableDays);
            Assert.Single(context.Tracks);
            output.WriteLine("Wynik: Dodano nowy tor");
        }

        // Test - dodawanie nowego toru bez nazwy:
        [Fact]
        public async Task Adding_New_Track_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Name = null,
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Add(track);
            });

            Assert.Contains("Nie uzupełniono wszystkich wymaganych pól", exception.Message);
            output.WriteLine("Wynik: Nie dodano nowego toru, ze względu na brak nazwy");
        }

        // Test - edycja toru:
        [Fact]
        public async Task Updating_Track()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };
            await service.Add(track);

            var updatedTrack = new TrackDto
            {
                Name = "Fajny tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 2000,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Piątek,Sobota",
            };

            var updated = await service.Update(track.Id, updatedTrack);

            Assert.NotNull(updated);
            Assert.Equal("Fajny tor kolarski", updated.Name);
            Assert.Equal("Gładka", updated.TypeOfSurface);
            Assert.Equal(2000, updated.Length);
            Assert.Equal("Poniedziałek,Wtorek,Piątek,Sobota", updated.AvailableDays);
            Assert.Single(context.Tracks);
            output.WriteLine("Wynik: Zmodyfikowano tor");
        }

        // Test - edycja toru (usunięcie nazwy i rodzaju nawierzchni):
        [Fact]
        public async Task Updating_Track_Without_Name_And_TypeOfSurface()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota",
            };
            await service.Add(track);

            var updatedTrack = new TrackDto
            {
                Name = null,
                TypeOfSurface = null,
                Length = 2000,
                OpeningHour = new TimeSpan(9, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Piątek,Sobota",
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Update(track.Id, updatedTrack);
            });

            Assert.Contains("Nie uzupełniono wszystkich wymaganych pól", exception.Message);
            output.WriteLine("Wynik: Nie zmodyfikowano toru, ze względu na brak nazwy i rodzaju nawierzchni");
        }

        // Test - usuwanie toru:
        [Fact]
        public async Task Deleting_Track()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota"
            };
            await service.Add(track);

            var deleted = await service.Delete(track.Id);

            Assert.Empty(context.Tracks);
            output.WriteLine("Wynik: Usunięto tor");
        }

        // Test - usuwanie nieistniejącego toru:
        [Fact]
        public async Task Deleting_Track_With_Invalid_id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new TrackService(context);
            var track = new TrackDto
            {
                Id = 1,
                Name = "Tor kolarski",
                TypeOfSurface = "Gładka",
                Length = 1000,
                OpeningHour = new TimeSpan(8, 0, 0),
                ClosingHour = new TimeSpan(20, 0, 0),
                AvailableDays = "Poniedziałek,Wtorek,Środa,Czwartek,Piątek,Sobota"
            };
            await service.Add(track);

            var deleted = await service.Delete(3);

            Assert.False(deleted);
            output.WriteLine($"Wynik: Nie można usunąć toru z podanym Id (tor o takim Id nie istnieje)");
        }

    }
}
