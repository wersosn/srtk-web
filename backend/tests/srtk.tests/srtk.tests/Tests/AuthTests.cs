using Xunit;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.Services;
using Xunit.Abstractions;
using srtk.DTO;
using srtk.tests.Helpers;
using Moq;

namespace srtk.tests.Tests
{
    public class AuthTests
    {
        // Wypisywanie komunikatów w wynikach testu:
        private readonly ITestOutputHelper output;
        public AuthTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        // Test - rejestracja nowego użytkownika:
        [Fact]
        public async Task Register_New_User()
        {
            var context = DbContextHelper.GetDbContext();
            JwtService jwtMock = null; // Tokeny JWT nie są wykorzystywane przy rejestracji, więc zostały ustawione jako null
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var service = new AuthService(context, jwtMock, passwordService);
            var dto = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test",
                LastName = "Testowy",
                Password = "Test123"
            };

            var result = await service.Register(dto);

            Assert.Null(result);
            Assert.Single(context.Users);
            output.WriteLine("Wynik: Użytkownik pomyślnie zarejestrowany");
        }

        // Test - rejestracja użytkownika z użyciem wcześniej wykorzystanego maila:
        [Fact]
        public async Task Register_With_Already_Used_Email()
        {
            var context = DbContextHelper.GetDbContext();
            JwtService jwtMock = null; // Tokeny JWT nie są wykorzystywane przy rejestracji, więc zostały ustawione jako null
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var service = new AuthService(context, jwtMock, passwordService);
            var dto = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test",
                LastName = "Testowy",
                Password = "Test123"
            };
            await service.Register(dto);

            var dtoUsed = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test2",
                LastName = "Testowy2",
                Password = "Test12345"
            };

            var result = await service.Register(dtoUsed);

            Assert.NotNull(result);
            Assert.Single(context.Users);
            Assert.Equal("Użytkownik o takim adresie e-mail już istnieje", result);
            output.WriteLine("Wynik: Wybrany email został już wcześniej użyty");
        }

        // Test - logowanie użytkownika:
        [Fact]
        public async Task Login_User()
        {
            var context = DbContextHelper.GetDbContext();
            var jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var user = new Client
            {
                Email = "test@gmail.com",
                Password = passwordService.HashPassword("tajnehaslo123"),
                Name = "Test",
                Surname = "Testowy",
                PhoneNumber = "123456789",
                RoleId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            var service = new AuthService(context, jwtMock, passwordService);
            var loginDto = new LoginDto
            {
                Email = "test@gmail.com",
                Password = "tajnehaslo123"
            };

            var result = await service.Login(loginDto);

            Assert.Null(result.Error);
            Assert.NotNull(result.UserData);
            Assert.Equal("token_testowy", result.Token);
            output.WriteLine("Wynik: Użytkownik pomyślnie zalogowany");
        }

        // Test - logowanie użytkownika z błędnym hasłem:
        [Fact]
        public async Task Login_User_With_Wrong_Password()
        {
            var context = DbContextHelper.GetDbContext();
            var jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var user = new Client
            {
                Email = "test@gmail.com",
                Password = passwordService.HashPassword("tajnehaslo123"),
                Name = "Test",
                Surname = "Testowy",
                PhoneNumber = "123456789",
                RoleId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            var service = new AuthService(context, jwtMock, passwordService);
            var loginDto = new LoginDto
            {
                Email = "test@gmail.com",
                Password = "tajnehaslo321"
            };

            var result = await service.Login(loginDto);

            Assert.NotNull(result.Error);
            Assert.Null(result.UserData);
            output.WriteLine("Wynik: Nieprawidłowe dane logowania");
        }
    }
}
