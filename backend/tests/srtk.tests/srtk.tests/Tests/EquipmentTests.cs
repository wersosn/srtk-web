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
            var eq = new Equipment
            {
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new Equipment
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

        // Test - pobranie konkretnego sprzętu:
        [Fact]
        public async Task Getting_Equipment_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new Equipment
            {
                Name = "Rower",
                Type = "Górski",
                Cost = 50
            };
            await service.Add(eq);

            var eq2 = new Equipment
            {
                Name = "Rower",
                Type = "BMX",
                Cost = 80
            };
            await service.Add(eq2);

            var result = await service.GetById(eq.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}, {result.Type}, {result.Cost}");
        }

        // Test - dodawanie nowego sprzętu:
        [Fact]
        public async Task Adding_New_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new Equipment
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

        // Test - edycja sprzętu:
        [Fact]
        public async Task Updating_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new Equipment
            {
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

        // Test - usuwanie sprzętu:
        [Fact]
        public async Task Deleting_Equipment()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new EquipmentService(context);
            var eq = new Equipment
            {
                Name = "Rower",
                Type = "Miejski",
                Cost = 60
            };
            await service.Add(eq);

            var deleted = await service.Delete(eq.Id);

            Assert.Empty(context.Equipments);
            output.WriteLine("Wynik: Usunięto sprzęt");
        }
    }
}
