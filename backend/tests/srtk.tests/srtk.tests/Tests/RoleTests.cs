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

        // Test - próba pobrania wszystkich ról, gdy lista jest pusta:
        [Fact]
        public async Task Getting_All_Roles_Empty_List()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);

            var result = await service.GetAll();

            Assert.Empty(result);
            output.WriteLine("Wynik: Brak ról");
        }

        // Test - pobranie konkretnej roli:
        [Fact]
        public async Task Getting_Role_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
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

        // Test - pobranie konkretnej roli, z nieprawidłowym Id:
        [Fact]
        public async Task Getting_Role_ById_With_Invalid_Id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = "Klient"
            };
            await service.Add(role);

            var role2 = new RoleDto
            {
                Id = 2,
                Name = "Admin"
            };
            await service.Add(role2);

            var result = await service.GetById(3);

            Assert.Null(result);
            output.WriteLine($"Wynik: Brak roli z podanym Id");
        }

        // Test - dodawanie nowej roli:
        [Fact]
        public async Task Adding_New_Role()
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

        // Test - dodawanie nowej roli bez nazwy:
        [Fact]
        public async Task Adding_New_Role_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = null
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Add(role);
            });

            Assert.Contains("Nie podano nazwy roli", exception.Message);
            output.WriteLine("Wynik: Nie dodano nowej roli, ze względu na brak nazwy");
        }

        // Test - edycja roli:
        [Fact]
        public async Task Updating_Role()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = "Klient"
            };
            await service.Add(role);

            var updatedRole = new RoleDto
            {
                Name = "Moderator"
            };

            var updated = await service.Update(role.Id, updatedRole);

            Assert.NotNull(updated);
            Assert.Equal("Moderator", updated.Name);
            Assert.Single(context.Roles);
            output.WriteLine("Wynik: Zmodyfikowano rolę");
        }

        // Test - edycja roli (usunięcie nazwy):
        [Fact]
        public async Task Updating_Role_Without_Name()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = "Klient"
            };
            await service.Add(role);

            var updatedRole = new RoleDto
            {
                Name = null
            };

            var exception = await Assert.ThrowsAsync<Exception>(async () =>
            {
                await service.Update(role.Id, updatedRole);
            });

            Assert.Contains("Nie podano nazwy roli", exception.Message);
            output.WriteLine("Wynik: Nie zmodyfikowano roli, ze względu na brak nazwy");
        }

        // Test - usuwanie roli:
        [Fact]
        public async Task Deleting_Role()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = "Klient"
            };
            await service.Add(role);

            var deleted = await service.Delete(role.Id);

            Assert.Empty(context.Roles);
            output.WriteLine("Wynik: Usunięto rolę");
        }

        // Test - usuwanie nieistniejącej roli:
        [Fact]
        public async Task Deleting_Role_With_Invalid_id()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new RoleService(context);
            var role = new RoleDto
            {
                Id = 1,
                Name = "Klient"
            };
            await service.Add(role);

            var deleted = await service.Delete(3);

            Assert.False(deleted);
            output.WriteLine($"Wynik: Nie można usunąć roli z podanym Id (rola o takim Id nie istnieje)");
        }
    }
}
