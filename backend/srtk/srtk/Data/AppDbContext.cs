using Microsoft.EntityFrameworkCore;
using srtk.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Facility> Facilities { get; set; }
    public DbSet<Track> Tracks { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Admin> Admins { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Equipment> Equipments { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Status> Statuses { get; set; }
    public DbSet<EquipmentReservation> EquipmentReservations { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
           .HasIndex(u => u.Name)
           .IsUnique();

        modelBuilder.Entity<Status>()
           .HasIndex(u => u.Name)
           .IsUnique();

        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.TrackId, r.Start, r.End })
            .IsUnique();

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.ReservationList)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EquipmentReservation>()
            .HasKey(re => new { re.ReservationId, re.EquipmentId });

        modelBuilder.Entity<EquipmentReservation>()
            .HasOne(re => re.Reservation)
            .WithMany(r => r.EquipmentReservations)
            .HasForeignKey(re => re.ReservationId);

        modelBuilder.Entity<EquipmentReservation>()
            .HasOne(re => re.Equipment)
            .WithMany(e => e.EquipmentReservations)
            .HasForeignKey(re => re.EquipmentId);
    }
}
