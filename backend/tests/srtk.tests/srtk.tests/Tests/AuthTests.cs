using Xunit;
using Microsoft.EntityFrameworkCore;
using srtk.Models;
using srtk.Services;
using Xunit.Abstractions;
using srtk.DTO;
using srtk.tests.Helpers;
using Moq;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace srtk.tests.Tests
{
    public class AuthTests
    {
        private EmailService emailService = new EmailServiceHelper(); // Pomocniczy serwis do wysyłania maili (w tym wypadku nic się nie wysyła)
        private static Dictionary<string, string> inMemorySettings = new Dictionary<string, string>
            {
                {"Email:Host", "smtp.test.local"},
                {"Email:Port", "25"},
                {"Email:Username", "test"},
                {"Email:Password", "test"},
                {"Email:From", "test@test.com"},
                {"Email:FromName", "Test Sender"},
                {"Frontend:BaseUrl", "http://localhost"},
                {"MobileApp:DeepLink", "app://localhost"}
            };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();

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
            JwtService jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var userService = new UserService(context); // Serwis do zapisania użytkownika w bazie

            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);
            var dto = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test",
                LastName = "Testowy",
                Password = "Test123"
            };

            var result = await service.Register(dto, "test", "pl");

            Assert.Null(result);
            Assert.Single(context.Users);
            output.WriteLine("Wynik: Użytkownik pomyślnie zarejestrowany");
        }

        // Test - rejestracja użytkownika z użyciem wcześniej wykorzystanego maila:
        [Fact]
        public async Task Register_With_Already_Used_Email()
        {
            var context = DbContextHelper.GetDbContext();
            JwtService jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var userService = new UserService(context); // Serwis do zapisania użytkownika w bazie

            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);
            var dto = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test",
                LastName = "Testowy",
                Password = "Test123"
            };
            await service.Register(dto, "test", "pl");

            var dtoUsed = new RegisterDto
            {
                Email = "test@gmail.com",
                Name = "Test2",
                LastName = "Testowy2",
                Password = "Test12345"
            };

            var result = await service.Register(dtoUsed, "test", "pl");

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
            var userService = new UserService(context); // Serwis użytkowników

            context.Roles.Add(new Role { Id = 1, Name = "Client" }); // Rola do testów

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

            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);
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
            var userService = new UserService(context); // Serwis użytkowników

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
            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);
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

        // Test - potwierdzenie adrwesu e-mail:
        [Fact]
        public async Task Confirm_Email()
        {
            var context = DbContextHelper.GetDbContext();
            var jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var userService = new UserService(context); // Serwis użytkowników

            var user = new Client
            {
                Id = 1,
                Email = "test@gmail.com",
                Password = passwordService.HashPassword("tajnehaslo123"),
                Name = "Test",
                Surname = "Testowy",
                PhoneNumber = "123456789",
                RoleId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);

            var result = service.EmailConfirmed("test-confirm-token");
            var updatedUser = await context.Users.FirstOrDefaultAsync(u => u.Id == 1);
            Assert.True(updatedUser.EmailConfirmed);
            output.WriteLine("Wynik: Potwierdzono adres e-mail");
        }

        // Test - reset hasła:
        [Fact]
        public async Task Reset_Password()
        {
            var context = DbContextHelper.GetDbContext();
            var jwtMock = new srtk.tests.Helpers.JwtServiceHelper(); // Metoda pomocnicza do tokenów JWT w testach
            var passwordService = new srtk.tests.Helpers.PasswordServiceHelper(); // Metoda pomocnicza do haszowania haseł w testach
            var userService = new UserService(context); // Serwis użytkowników

            var user = new Client
            {
                Id = 1,
                Email = "test@gmail.com",
                Password = passwordService.HashPassword("tajnehaslo123"),
                Name = "Test",
                Surname = "Testowy",
                PhoneNumber = "123456789",
                RoleId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            var service = new AuthService(context, jwtMock, passwordService, userService, emailService, config);
            var newPassword = passwordService.HashPassword("haslotajne321");

            var result = service.ResetPassword("test-reset-token", newPassword);
            var updatedUser = await context.Users.FirstOrDefaultAsync(u => u.Id == 1);
            Assert.Equal(newPassword, updatedUser.Password);
            output.WriteLine("Wynik: Zresetowano hasło");
        }
    }
}
