using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<RideRequest> RideRequests => Set<RideRequest>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Sabit Id'li roller (migration'a seed edilir)
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = "role-admin", Name = AppRoles.Admin, NormalizedName = AppRoles.Admin.ToUpperInvariant(), ConcurrencyStamp = "role-admin" },
            new IdentityRole { Id = "role-taksici", Name = AppRoles.Taksici, NormalizedName = AppRoles.Taksici.ToUpperInvariant(), ConcurrencyStamp = "role-taksici" },
            new IdentityRole { Id = "role-yolcu", Name = AppRoles.Yolcu, NormalizedName = AppRoles.Yolcu.ToUpperInvariant(), ConcurrencyStamp = "role-yolcu" }
        );

        builder.Entity<Driver>().HasData(
            new Driver { Id = 1, FullName = "Ahmet Usta", Phone = "905011366815", Plate = "23 T 0421", Station = "Merkez", ShiftStart = new TimeOnly(0, 0), ShiftEnd = new TimeOnly(23, 59), IsEnabled = true },
            new Driver { Id = 2, FullName = "Mehmet Kaya", Phone = "905011366815", Plate = "23 T 1042", Station = "Üniversite", ShiftStart = new TimeOnly(20, 0), ShiftEnd = new TimeOnly(8, 0), IsEnabled = true }
        );
    }
}
