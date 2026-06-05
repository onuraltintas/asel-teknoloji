using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AselTeknoloji.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Stat1Label",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat1Value",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat2Label",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat2Value",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat3Label",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat3Value",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat4Label",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat4Value",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaglineSubtitle",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Twitter",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Whatsapp",
                table: "Settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Youtube",
                table: "Settings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stat1Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat1Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat2Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat2Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat3Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat3Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat4Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Stat4Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "TaglineSubtitle",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Twitter",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Whatsapp",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Youtube",
                table: "Settings");
        }
    }
}
