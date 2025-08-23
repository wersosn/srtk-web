using Microsoft.Extensions.Configuration;
using srtk.Models;
using srtk.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public class JwtServiceHelper : JwtService
    {
        public JwtServiceHelper() : base(
         new ConfigurationBuilder()
             .AddInMemoryCollection(new Dictionary<string, string>
             {
                {"Jwt:Secret", "test-secret"},
                {"Jwt:Issuer", "test-issuer"},
                {"Jwt:Audience", "test-audience"}
             })
             .Build(),
         DbContextHelper.GetDbContext())
        { }

        public override string GenerateToken(User user)
        {
            return "token_testowy"; // Sztuczny token do testów
        }

        public override string GenerateConfirmEmailToken(User user)
        {
            return "test-confirm-token"; // Sztuczny token do testów
        }

        public override string GenerateResetPasswordToken(User user)
        {
            return "test-reset-token"; // Sztuczny token do testów
        }

        public override ClaimsPrincipal ValidateToken(string token)
        {
            if (token == "test-confirm-token" || token == "test-reset-token")
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, "1")
                };
                var identity = new ClaimsIdentity(claims, "mock");
                return new ClaimsPrincipal(identity);
            }
            return null;
        }
    }
}
