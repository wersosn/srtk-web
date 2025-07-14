using Microsoft.AspNetCore.Identity;

namespace srtk.Services
{
    public class PasswordService
    {
        private readonly PasswordHasher<object> hasher = new();

        public string HashPassword(string password)
        {
            return hasher.HashPassword(null, password);
        }

        public bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            var result = hasher.VerifyHashedPassword(null, hashedPassword, providedPassword);
            return result == PasswordVerificationResult.Success;
        }
    }
}
