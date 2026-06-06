using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AselTeknoloji.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Admin");

            // Mevcut tüm kullanıcıları SuperAdmin yap (rol sistemi ilk kez ekleniyor)
            migrationBuilder.Sql("UPDATE \"Users\" SET \"Role\" = 'SuperAdmin'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
