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
    public class UserTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public UserTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie wszystkich użytkowników:
        [Fact]
        public async Task Getting_All_Users()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await service.Add(user);

            var user2 = new User
            {
                Email = "ania@nowak.pl",
                Password = "321cba",
                RoleId = 1
            };
            await service.Add(user2);

            var result = await service.GetAll();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość użytkowników): " + result.Count);
        }

        // Test - pobranie wszystkich klientów:
        [Fact]
        public async Task Getting_All_Clients()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new Client
            {
                Email = "test@test.pl",
                Password = "abc123",
                Name = "Test",
                Surname = "Test",
                RoleId = 1
            };
            await service.Add(user);

            var user2 = new User
            {
                Email = "ania@nowak.pl",
                Password = "321cba",
                RoleId = 2
            };
            await service.Add(user2);

            var result = await service.GetAllClients();

            Assert.NotNull(result);
            Assert.Single(result);
            output.WriteLine("Wynik (ilość klientów): " + result.Count);
        }

        // Test - pobranie wszystkich adminów:
        [Fact]
        public async Task Getting_All_Admins()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new Admin
            {
                Email = "test@test.pl",
                Password = "abc123",
                FacilityId = 1,
                RoleId = 2
            };
            await service.Add(user);

            var user2 = new Admin
            {
                Email = "ania@nowak.pl",
                Password = "321cba",
                FacilityId = 1,
                RoleId = 2
            };
            await service.Add(user2);

            var result = await service.GetAllAdmins();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine("Wynik (ilość adminów): " + result.Count);
        }

        // Test - pobranie użytkowników z rolą "Klient":
        [Fact]
        public async Task Getting_Users_With_Role()
        {
            var context = DbContextHelper.GetDbContext();
            var roleService = new RoleService(context);
            var service = new UserService(context);
            var role = new Role
            {
                Name = "Klient"
            };
            await roleService.Add(role);

            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = role.Id
            };
            await service.Add(user);

            var user2 = new User
            {
                Email = "ania@nowak.pl",
                Password = "321cba",
                RoleId = role.Id
            };
            await service.Add(user2);

            var result = await service.GetByRole(role.Id);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            output.WriteLine($"Wynik - ilość użytkowników z rolą {role.Name}: " + result.Count);
        }

        // Test - pobranie konkretnego użytkownika:
        [Fact]
        public async Task Getting_User_ById()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await service.Add(user);

            var user2 = new User
            {
                Email = "ania@nowak.pl",
                Password = "321cba",
                RoleId = 1
            };
            await service.Add(user2);

            var result = await service.GetById(user.Id);

            Assert.NotNull(result);
            output.WriteLine($"Wynik: {result.Email}, {result.RoleId}");
        }

        // Test - dodawanie nowego użytkownika:
        [Fact]
        public async Task Adding_New_User()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };

            var result = await service.Add(user);

            Assert.NotNull(result);
            Assert.Equal("test@test.pl", result.Email);
            Assert.Equal("abc123", result.Password);
            Assert.Equal(1, result.RoleId);
            Assert.Single(context.Users);
            output.WriteLine("Wynik: Dodano nowego użytkownika");
        }

        // Test - edycja użytkownika:
        [Fact]
        public async Task Updating_User()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);

            var client = new Client
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1,
                Name = "Jan",
                Surname = "Kowalski",
                PhoneNumber = "123456789"
            };
            await service.Add(client);

            var updatedUserDto = new UserDto
            {
                Email = "testNowy@test.pl",
            };

            var updated = await service.Update(client.Id, updatedUserDto);

            Assert.NotNull(updated);
            Assert.Equal("testNowy@test.pl", updated.Email);
            output.WriteLine("Wynik: Zmodyfikowano użytkownika");
        }

        // Test - edycja użytkownika przez samego siebie:
        [Fact]
        public async Task Updating_Myself()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);

            var client = new Client
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1,
                Name = "Jan",
                Surname = "Kowalski",
                PhoneNumber = "123456789"
            };
            await service.Add(client);

            var updatedUserDto = new UserDto
            {
                Email = "testNowy@test.pl",
            };

            var updated = await service.UpdateMyself(client.Id, updatedUserDto);
            Assert.Equal("testNowy@test.pl", updated.Email);
            output.WriteLine("Wynik: Zmodyfikowano swoje dane");
        }

        // Test - usuwanie użytkownika:
        [Fact]
        public async Task Deleting_User()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Email = "test@test.pl",
                Password = "abc123",
                RoleId = 1
            };
            await service.Add(user);

            var deleted = await service.Delete(user.Id);

            Assert.Empty(context.Users);
            output.WriteLine("Wynik: Usunięto użytkownika");
        }
    }
}
