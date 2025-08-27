using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace srtk.tests.Helpers
{
    public static class DbContextHelper
    {
        // Tworzenie sztucznej bazy w pamięci (do testów):
        public static AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unikalna baza dla każdego testu, aby nie powielały się obiekty
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .EnableSensitiveDataLogging()
                .Options;
            return new AppDbContext(options);
        }
    }
}
