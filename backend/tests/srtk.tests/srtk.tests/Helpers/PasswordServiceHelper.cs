using srtk.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public class PasswordServiceHelper : PasswordService
    {
        public override string HashPassword(string password)
        {
            return "hashed";
        }

        public override bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            return hashedPassword == "hashed" && providedPassword == "tajnehaslo123";
        }
    }
}
