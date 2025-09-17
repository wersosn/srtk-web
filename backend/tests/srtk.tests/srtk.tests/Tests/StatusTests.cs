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
            var status = new StatusDto
            {
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var status2 = new StatusDto
            {
                Name = "Anulowano"
            };
            await service.Add(status2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość statusów): " + result.Count);
        }

        // Test - próba pobrania wszystkich statusów, gdy lista jest pusta:
        [Fact]
        public async Task Getting_All_Statuses_Empty_List()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);

            var result = await service.GetAll();

            Assert.Empty(result);
            output.WriteLine("Wynik: Brak statusów");
        }

        // Test - pobranie konkretnego statusu:
        [Fact]
        public async Task Getting_Status_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var status2 = new StatusDto
            {
                Name = "Anulowano"
            };
            await service.Add(status2);

            var result = await service.GetById(status.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}");
        }

        // Test - pobranie konkretnego statusu, z nieprawidłowym Id:
        [Fact]
        public async Task Getting_Status_ById_With_Invalid_Id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var status2 = new StatusDto
            {
                Name = "Anulowano"
            };
            await service.Add(status2);

            var result = await service.GetById(3);

            Assert.Null(result);
            output.WriteLine($"Wynik: Brak statusu z podanym Id");
        }

        // Test - dodawanie nowego statusu:
        [Fact]
        public async Task Adding_New_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Name = "Zarezerwowano"
            };

            var result = await service.Add(status);

            Assert.NotNull(result);
            Assert.Equal("Zarezerwowano", result.Name);
            Assert.Single(context.Statuses);
            output.WriteLine("Wynik: Dodano nowy status");
        }

        // Test - dodawanie nowego statusu bez nazwy:
        [Fact]
        public async Task Adding_New_Status_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = null
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Add(status);
            });

            Assert.Contains("Nie podano nazwy statusu", exception.Message);
            output.WriteLine("Wynik: Nie dodano nowej statusu, ze względu na brak nazwy");
        }

        // Test - edycja statusu:
        [Fact]
        public async Task Updating_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
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

        // Test - edycja statusu (usunięcie nazwy):
        [Fact]
        public async Task Updating_Status_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var updatedStatus = new StatusDto
            {
                Name = null,
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Update(status.Id, updatedStatus);
            });

            Assert.Contains("Nie podano nazwy statusu", exception.Message);
            output.WriteLine("Wynik: Nie zmodyfikowano statusu, ze względu na brak nazwy");
        }

        // Test - usuwanie statusu:
        [Fact]
        public async Task Deleting_Status()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var deleted = await service.Delete(status.Id);

            Assert.Empty(context.Statuses);
            output.WriteLine("Wynik: Usunięto status");
        }

        // Test - usuwanie nieistniejącego statusu:
        [Fact]
        public async Task Deleting_Status_With_Invalid_id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new StatusService(context);
            var status = new StatusDto
            {
                Id = 1,
                Name = "Zarezerwowano"
            };
            await service.Add(status);

            var deleted = await service.Delete(3);

            Assert.False(deleted);
            output.WriteLine($"Wynik: Nie można usunąć statusu z podanym Id (status o takim Id nie istnieje)");
        }
    }
}
