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
    public class StatusTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public StatusTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich statusów:
        [Fact]
        public async Task Getting_All_Statuses()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new Status
            {
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var status2 = new Status
            {
                Name = "Anulowano"
            };
            await service.Add(status2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość statusów): " + result.Count);
        }

        // Test - pobranie konkretnego statusu:
        [Fact]
        public async Task Getting_Status_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new Status
            {
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var status2 = new Status
            {
                Name = "Anulowano"
            };
            await service.Add(status2);

            var result = await service.GetById(status.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}");
        }

        // Test - dodawanie nowego statusu:
        [Fact]
        public async Task Adding_New_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new Status
            {
                Name = "Zarezerwowano"
            };

            var result = await service.Add(status);

            Assert.NotNull(result);
            Assert.Equal("Zarezerwowano", result.Name);
            Assert.Single(context.Statuses);
            output.WriteLine("Wynik: Dodano nowy status");
        }

        // Test - edycja statusu:
        [Fact]
        public async Task Updating_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new Status
            {
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var updatedStatus = new StatusDto
            {
                Name = "Zmodyfikowano",
            };

            var updated = await service.Update(status.Id, updatedStatus);

            Assert.NotNull(updated);
            Assert.Equal("Zmodyfikowano", updated.Name);
            Assert.Single(context.Statuses);
            output.WriteLine("Wynik: Zmodyfikowano status");
        }

        // Test - usuwanie statusu:
        [Fact]
        public async Task Deleting_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new Status
            {
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var deleted = await service.Delete(status.Id);

            Assert.Empty(context.Statuses);
            output.WriteLine("Wynik: Usunięto status");
        }
    }
}
