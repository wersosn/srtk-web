using srtk.DTO;
using srtk.Models;
using srtk.Services;
using srtk.tests.Helpers;
using Xunit.Abstractions;

namespace srtk.tests.Tests
{
    public class EquipmentTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public EquipmentTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich sprzętów:
        [Fact]
        public async Task Getting_All_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new EquipmentDto
            {
                Name = "Rower",
                Type = "BMX",
                Cost = 80
            };
            await service.Add(eq2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość sprzętów): " + result.Count);
        }

        // Test - próba pobrania wszystkich sprzętów, gdy lista jest pusta:
        [Fact]
        public async Task Getting_All_Equipmentss_Empty_List()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);

            var result = await service.GetAll();

            Assert.Empty(result);
            output.WriteLine("Wynik: Brak sprzętów");
        }

        // Test - pobranie wszystkich sprzętów należących do danego obiektu:
        [Fact]
        public async Task Getting_Equipment_In_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var facilityService = new FacilityService(context);
            var service = new EquipmentService(context);
            var facility = new FacilityDto
            {
                Name = "Duży obiekt",
                City = "Białystok",
                Address = "ul. Sportowa 1"
            };
            var f = await facilityService.Add(facility);

            var eq = new EquipmentDto
            {
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new EquipmentDto
            {
                Name = "Rower",
                Type = "BMX",
                Cost = 80,
                FacilityId = f.Id
            };
            await service.Add(eq2);

            var result = await service.GetAllInFacility(f.Id);

            Assert.NotNull(result);
            Assert.Single(result);
            output.WriteLine("Wynik - ilość sprzętów w danym obiekcie: " + result.Count);
        }

        // Test - pobranie konkretnego sprzętu:
        [Fact]
        public async Task Getting_Equipment_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new EquipmentDto
            {
                Id = 1235,
                Name = "Rower",
                Type = "BMX",
                Cost = 80
            };
            await service.Add(eq2);

            var result = await service.GetById(eq.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}, {result.Type}, {result.Cost}");
        }

        // Test - pobranie konkretnego sprzętu, z nieprawidłowym Id:
        [Fact]
        public async Task Getting_Equipment_ById_With_Invalid_Id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new EquipmentDto
            {
                Id = 1235,
                Name = "Rower",
                Type = "BMX",
                Cost = 80
            };
            await service.Add(eq2);

            var result = await service.GetById(3);

            Assert.Null(result);
            output.WriteLine($"Wynik: Brak sprzętu z podanym Id");
        }

        // Test - dodawanie nowego sprzętu:
        [Fact]
        public async Task Adding_New_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };

            var result = await service.Add(eq);

            Assert.NotNull(result);
            Assert.Equal("Rower", result.Name);
            Assert.Equal("Miejski", result.Type);
            Assert.Equal(60, result.Cost);
            Assert.Single(context.Equipments);
            output.WriteLine("Wynik: Dodano nowy sprzęt");
        }

        // Test - dodawanie nowego sprzętu bez rodzaju:
        [Fact]
        public async Task Adding_New_Equipment_Without_Type()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Name = "Rower",
                Type = null,
                Cost = 60
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Add(eq);
            });

            Assert.Contains("Nie uzupełniono wszystkich wymaganych pól", exception.Message);
            output.WriteLine("Wynik: Nie dodano nowego sprzętu, ze względu na brak podanego rodzaju");
        }

        // Test - edycja sprzętu:
        [Fact]
        public async Task Updating_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };
            await service.Add(eq);

            var updatedEq = new EquipmentDto
            {
                Name = "Rower",
                Type = "Crossowy",
                Cost = 100
            };

            var updated = await service.Update(eq.Id, updatedEq);

            Assert.NotNull(updated);
            Assert.Equal("Rower", updated.Name);
            Assert.Equal("Crossowy", updated.Type);
            Assert.Equal(100, updated.Cost);
            Assert.Single(context.Equipments);
            output.WriteLine("Wynik: Zmodyfikowano sprzęt");
        }

        // Test - edycja sprzętu (usunięcie nazwy):
        [Fact]
        public async Task Updating_Equipment_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };
            await service.Add(eq);

            var updatedEq = new EquipmentDto
            {
                Name = null,
                Type = "Crossowy",
                Cost = 100
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Update(eq.Id, updatedEq);
            });

            Assert.Contains("Nie uzupełniono wszystkich wymaganych pól", exception.Message);
            output.WriteLine("Wynik: Nie zmodyfikowano sprzętu, ze względu na brak nazwy");
        }

        // Test - usuwanie sprzętu:
        [Fact]
        public async Task Deleting_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };
            await service.Add(eq);

            var deleted = await service.Delete(eq.Id);

            Assert.Empty(context.Equipments);
            output.WriteLine("Wynik: Usunięto sprzęt");
        }

        // Test - usuwanie nieistniejącego sprzętu:
        [Fact]
        public async Task Deleting_Equipment_With_Invalid_id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new EquipmentDto
            {
                Id = 1,
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };
            await service.Add(eq);

            var deleted = await service.Delete(3);

            Assert.False(deleted);
            output.WriteLine($"Wynik: Nie można usunąć sprzętu z podanym Id (sprzęt o takim Id nie istnieje)");
        }
    }
}
