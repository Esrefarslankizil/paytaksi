using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PayTaksi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDriversAndWhatsAppDispatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    Plate = table.Column<string>(type: "TEXT", nullable: false),
                    Station = table.Column<string>(type: "TEXT", nullable: false),
                    ShiftStart = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    ShiftEnd = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    PausedUntil = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    LastDispatchedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RideRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PickupAddress = table.Column<string>(type: "TEXT", nullable: false),
                    PickupLat = table.Column<double>(type: "REAL", nullable: true),
                    PickupLng = table.Column<double>(type: "REAL", nullable: true),
                    DestinationAddress = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerPhone = table.Column<string>(type: "TEXT", nullable: false),
                    PaymentType = table.Column<string>(type: "TEXT", nullable: false),
                    AssignedDriverId = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    WhatsAppSent = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RideRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RideRequests_Drivers_AssignedDriverId",
                        column: x => x.AssignedDriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Drivers",
                columns: new[] { "Id", "FullName", "IsEnabled", "LastDispatchedAt", "PausedUntil", "Phone", "Plate", "ShiftEnd", "ShiftStart", "Station" },
                values: new object[,]
                {
                    { 1, "Ahmet Usta", true, null, null, "905551112233", "23 T 0421", new TimeOnly(23, 59, 0), new TimeOnly(8, 0, 0), "Merkez" },
                    { 2, "Mehmet Kaya", true, null, null, "905554445566", "23 T 1042", new TimeOnly(8, 0, 0), new TimeOnly(20, 0, 0), "Üniversite" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_RideRequests_AssignedDriverId",
                table: "RideRequests",
                column: "AssignedDriverId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RideRequests");

            migrationBuilder.DropTable(
                name: "Drivers");
        }
    }
}
