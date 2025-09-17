using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace srtk.Migrations
{
    /// <inheritdoc />
    public partial class UniqueNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Statuses_Name",
                table: "Statuses",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Statuses_Name",
                table: "Statuses");

            migrationBuilder.DropIndex(
                name: "IX_Roles_Name",
                table: "Roles");
        }
    }
}
