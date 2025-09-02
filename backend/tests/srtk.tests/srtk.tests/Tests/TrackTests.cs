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

        // Test - edycja toru:
        [Fact]
        public async Task Updating_Track()
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

        // Test - usuwanie toru:
        [Fact]
        public async Task Deleting_Track()
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

            var deleted = await service.Delete(track.Id);

            Assert.Empty(context.Tracks);
            output.WriteLine("Wynik: Usunięto tor");
        }
    }
}
