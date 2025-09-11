using Xunit;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.Services;
using Xunit.Abstractions;
using srtk.DTO;
using srtk.tests.Helpers;

namespace srtk.tests.Tests
{
    public class FacilityTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public FacilityTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich obiektów:
        [Fact]
        public async Task Getting_All_Facilities()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new FacilityService(context);
            var facility = new FacilityDto
            {
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            await service.Add(facility);

            var facility2 = new FacilityDto
            {
                Name = "Mały obiekt",
                City = "Kraków",
                Address = "ul. Sportowa 3"
            };
            await service.Add(facility2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość obiektów): " + result.Count);
        }

        // Test - pobranie konkretnego obiektu:
        [Fact]
        public async Task Getting_Facility_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new FacilityService(context);
            var facility = new FacilityDto
            {
                Id = 1,
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            await service.Add(facility);

            var facility2 = new FacilityDto
            {
                Name = "Mały obiekt",
                City = "Kraków",
                Address = "ul. Sportowa 3"
            };
            await service.Add(facility2);

            var result = await service.GetById(facility.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}, {result.City}, {result.Address}");
        }

        // Test - dodawanie nowego obiektu:
        [Fact]
        public async Task Adding_New_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new FacilityService(context);
            var facility = new FacilityDto
            {
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };

            var result = await service.Add(facility);

            Assert.NotNull(result);
            Assert.Equal("Duży obiekt", result.Name);
            Assert.Equal("Białystok", result.City);
            Assert.Equal("ul. Sportowa 1", result.Address);
            Assert.Single(context.Facilities);
            output.WriteLine("Wynik: Dodano nowy obiekt");
        }

        // Test - edycja obiektu:
        [Fact]
        public async Task Updating_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new FacilityService(context);
            var facility = new FacilityDto
            {
                Id = 1,
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            await service.Add(facility);

            var updatedFacility = new FacilityDto
            {
                Name = "Mały obiekt",
                City = "Kraków",
                Address = "ul. Sportowa 3"
            };

            var updated = await service.Update(facility.Id, updatedFacility);

            Assert.NotNull(updated);
            Assert.Equal("Mały obiekt", updated.Name);
            Assert.Equal("Kraków", updated.City);
            Assert.Equal("ul. Sportowa 3", updated.Address);
            Assert.Single(context.Facilities);
            output.WriteLine("Wynik: Zmodyfikowano obiekt");
        }

        // Test - usuwanie obiektu:
        [Fact]
        public async Task Deleting_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new FacilityService(context);
            var facility = new FacilityDto
            {
                Id = 1,
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            await service.Add(facility);

            var deleted = await service.Delete(facility.Id);

            Assert.Empty(context.Facilities);
            output.WriteLine("Wynik: Usunięto obiekt");
        }
    }
}
