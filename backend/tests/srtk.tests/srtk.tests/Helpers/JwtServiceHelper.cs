using Microsoft.Extensions.Configuration;
using srtk.Models;
using srtk.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public class JwtServiceHelper : JwtService
    {
        public JwtServiceHelper() : base(new ConfigurationBuilder().Build()) { }

        public override string GenerateToken(User user)
        {
            return "token_testowy"; // Sztuczny token do testów
        }
    }
}
