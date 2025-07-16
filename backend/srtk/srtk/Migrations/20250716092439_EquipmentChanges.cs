using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace srtk.Migrations
{
    /// <inheritdoc />
    public partial class EquipmentChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FacilityId",
                table: "Equipments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Equipments_FacilityId",
                table: "Equipments",
                column: "FacilityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Equipments_Facilities_FacilityId",
                table: "Equipments",
                column: "FacilityId",
                principalTable: "Facilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Equipments_Facilities_FacilityId",
                table: "Equipments");

            migrationBuilder.DropIndex(
                name: "IX_Equipments_FacilityId",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "FacilityId",
                table: "Equipments");
        }
    }
}
