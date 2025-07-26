using Microsoft.EntityFrameworkCore.Scaffolding;
using Microsoft.IdentityModel.Tokens;
using srtk.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace srtk.Services
{
    public class JwtService
    {
        private readonly IConfiguration config;
        private readonly AppDbContext context;
        public JwtService(IConfiguration configuration, AppDbContext cntxt)
        {
            config = configuration;
            context = cntxt;
        }

        public virtual string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Id użytkownika
                new Claim(ClaimTypes.Email, user.Email), // Email użytkownika
                new Claim(ClaimTypes.Role, user.Role.Name), // Rola: Admin lub Klient
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Zapewni unikalność tokena
            };

            if (user.Role.Name == "Admin")
            {
                var admin = context.Admins.FirstOrDefault(a => a.Id == user.Id);
                if (admin != null)
                {
                    claims.Add(new Claim("FacilityId", admin.FacilityId.ToString()));
                }
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(config["Jwt:ExpiresInMinutes"])),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
