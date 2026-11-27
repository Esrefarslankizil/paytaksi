using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PayTaksi.Api.Data;
using PayTaksi.Api.Models;
using PayTaksi.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var connStr = builder.Configuration.GetConnectionString("Default")!;
var useMySql = connStr.Contains("Server=", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<AppDbContext>(o =>
{
    if (useMySql)
        o.UseMySql(connStr, ServerVersion.AutoDetect(connStr));
    else
        o.UseSqlite(connStr);
});

builder.Services
    .AddIdentityCore<ApplicationUser>(o =>
    {
        o.Password.RequireNonAlphanumeric = false;
        o.Password.RequiredLength = 6;
        o.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddHttpClient<WhatsAppService>();
builder.Services.AddScoped<RideDispatchService>();
builder.Services.AddHostedService<RideWatchdogService>();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Veritabanını oluştur/migrate et ve varsayılan admin'i ekle
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (useMySql)
    {
        await db.Database.EnsureCreatedAsync();
        // EnsureCreated mevcut veritabanına sonradan eklenen tabloları/kolonları açmaz; eksik şemayı garanti altına al
        await db.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS `AnalyticsEvents` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `EventType` longtext CHARACTER SET utf8mb4 NOT NULL,
                `CreatedAt` datetime(6) NOT NULL,
                PRIMARY KEY (`Id`)
            ) CHARACTER SET=utf8mb4;");
        try
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE `Drivers` ADD COLUMN `IsBusy` tinyint(1) NOT NULL DEFAULT 0;");
        }
        catch { /* kolon zaten varsa geç */ }
        foreach (var sql in new[]
        {
            "ALTER TABLE `RideRequests` ADD COLUMN `DestinationLat` double NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `DestinationLng` double NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `EstimatedPrice` decimal(18,2) NOT NULL DEFAULT 250;",
            "ALTER TABLE `RideRequests` ADD COLUMN `TrackToken` varchar(64) NOT NULL DEFAULT '';",
            "ALTER TABLE `RideRequests` ADD COLUMN `TriedDriverIds` longtext NOT NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `DispatchedAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `AcceptedAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `PickedUpAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `CompletedAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `CancelReason` longtext NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `DriverLat` double NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `DriverLng` double NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `DriverLocationAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `ScheduledAt` datetime(6) NULL;",
            "ALTER TABLE `RideRequests` ADD COLUMN `IsShared` tinyint(1) NOT NULL DEFAULT 0;",
            "ALTER TABLE `RideRequests` ADD COLUMN `PassengerCount` int NOT NULL DEFAULT 1;",
            "ALTER TABLE `RideRequests` ADD COLUMN `SharedGroupId` varchar(64) NULL;"
        })
        {
            try { await db.Database.ExecuteSqlRawAsync(sql); } catch { }
        }
    }
    else
    {
        await db.Database.MigrateAsync();
        foreach (var sql in new[]
        {
            "ALTER TABLE \"Drivers\" ADD COLUMN \"IsBusy\" INTEGER NOT NULL DEFAULT 0;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DestinationLat\" REAL NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DestinationLng\" REAL NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"EstimatedPrice\" REAL NOT NULL DEFAULT 250;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"TrackToken\" TEXT NOT NULL DEFAULT '';",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"TriedDriverIds\" TEXT NOT NULL DEFAULT '';",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DispatchedAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"AcceptedAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"PickedUpAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"CompletedAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"CancelReason\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DriverLat\" REAL NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DriverLng\" REAL NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"DriverLocationAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"ScheduledAt\" TEXT NULL;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"IsShared\" INTEGER NOT NULL DEFAULT 0;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"PassengerCount\" INTEGER NOT NULL DEFAULT 1;",
            "ALTER TABLE \"RideRequests\" ADD COLUMN \"SharedGroupId\" TEXT NULL;"
        })
        {
            try { await db.Database.ExecuteSqlRawAsync(sql); } catch { }
        }
    }

    var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = app.Configuration["SeedAdmin:Email"]!;
    if (await users.FindByEmailAsync(adminEmail) is null)
    {
        var admin = new ApplicationUser { UserName = adminEmail, Email = adminEmail, FullName = "Sistem Yöneticisi", EmailConfirmed = true };
        var res = await users.CreateAsync(admin, app.Configuration["SeedAdmin:Password"]!);
        if (res.Succeeded) await users.AddToRoleAsync(admin, AppRoles.Admin);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
