using Microsoft.VisualStudio.TestPlatform.Utilities;
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
    public class RoleTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public RoleTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich ról:
        [Fact]
        public async Task Getting_All_Roles()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Name = "Klient"
            };
            await service.Add(role);

            var role2 = new RoleDto
            {
                Name = "Admin"
            };
            await service.Add(role2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość ról): " + result.Count);
        }

        // Test - pobranie konkretnej roli:
        [Fact]
        public async Task Getting_Role_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Name = "Klient"
            };
            await service.Add(role);

            var role2 = new RoleDto
            {
                Name = "Admin"
            };
            await service.Add(role2);

            var result = await service.GetById(role.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Name}");
        }

        // Test - dodawanie nowej roli:
        [Fact]
        public async Task Adding_New_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Name = "Klient"
            };

            var result = await service.Add(role);

            Assert.NotNull(result);
            Assert.Equal("Klient", result.Name);
            Assert.Single(context.Roles);
            output.WriteLine("Wynik: Dodano nową rolę");
        }

        // Test - edycja roli:
        [Fact]
        public async Task Updating_Facility()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Name = "Klient"
            };
            await service.Add(role);

            var updatedRole = new RoleDto
            {
                Name = "Moderator",
            };

            var updated = await service.Update(role.Id, updatedRole);

            Assert.NotNull(updated);
            Assert.Equal("Moderator", updated.Name);
            Assert.Single(context.Roles);
            output.WriteLine("Wynik: Zmodyfikowano rolę");
        }

        // Test - usuwanie roli:
        [Fact]
        public async Task Deleting_Role()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Name = "Klient"
            };
            await service.Add(role);

            var deleted = await service.Delete(role.Id);

            Assert.Empty(context.Roles);
            output.WriteLine("Wynik: Usunięto rolę");
        }
    }
}
