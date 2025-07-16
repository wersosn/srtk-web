using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace srtk.Migrations
{
    /// <inheritdoc />
    public partial class ReservationUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "Hour",
                table: "Reservations",
                newName: "Start");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Reservations",
                newName: "End");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Start",
                table: "Reservations",
                newName: "Hour");

            migrationBuilder.RenameColumn(
                name: "End",
                table: "Reservations",
                newName: "Date");

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "Reservations",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
