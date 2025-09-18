using srtk.DTO;
using srtk.Models;
using srtk.Services;
using srtk.tests.Helpers;
using Xunit.Abstractions;

namespace srtk.tests.Tests
{
    public class UserPreferenceTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public UserPreferenceTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - pobranie preferencji użytkownika (domyślne 10):
        [Fact]
        public async Task Get_Elements_Per_Page_Default()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Id = 1,
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            var u = await service.Add(user);

            var result = await service.GetElementsPerPage(user.Id);

            Assert.NotNull(result);
            Assert.Equal(10, result.ElementsPerPage);
            output.WriteLine("Wynik (ilość elementów na stronie): " + result.ElementsPerPage);
        }

        // Test - ustawienie nowej liczby elementów na stronę i pobranie preferencji użytkownika:
        [Fact]
        public async Task Get_Elements_Per_Page_Default_With_Value()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Id = 1,
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            var u = await service.Add(user);
            var up = await service.AddElementsPerPage(user.Id, 25);

            var result = await service.GetElementsPerPage(user.Id);

            Assert.NotNull(result);
            Assert.Equal(25, result.ElementsPerPage);
            output.WriteLine("Wynik (ilość elementów na stronie): " + result.ElementsPerPage);
        }

        // Test - aktualizacja preferencji użytkownika:
        [Fact]
        public async Task Update_Elements_Per_Page()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Id = 1,
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            var u = await service.Add(user);
            var up = await service.AddElementsPerPage(user.Id, 25);

            var result = await service.UpdateElementsPerPage(user.Id, 5);

            Assert.NotNull(result);
            Assert.Equal(5, result.ElementsPerPage);
            output.WriteLine("Wynik (ilość elementów na stronie): " + result.ElementsPerPage);
        }

        // Test - próba aktualizacji preferencji użytkownika na wartość ujemną:
        [Fact]
        public async Task Update_Elements_Per_Page_With_Invalid_Value()
        {
            var context = DbContextHelper.GetDbContext();
            var service = new UserService(context);
            var user = new User
            {
                Id = 1,
                Email = "test@test.pl",
                Password = "test123",
                RoleId = 1
            };
            var u = await service.Add(user);
            var up = await service.AddElementsPerPage(user.Id, 15);

            var exception = await Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await service.UpdateElementsPerPage(user.Id, -5);
            });

            Assert.Contains("Ilość elementów musi być > 0", exception.Message);
            output.WriteLine("Wynik: nie zmodyfikowano ilości elementów na stronie, ze względu na nieprawidłową wartość");
        }
    }
}
