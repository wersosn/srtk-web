using Microsoft.EntityFrameworkCore;
using srtk.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Facility> Facilities { get; set; }
}
