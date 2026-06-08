using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AselTeknoloji.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePortfolioSlugAndImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Portfolios",
                newName: "Images");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Portfolios",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            // Mevcut ImageUrl tek görsel → JSON dizisine çevir
            migrationBuilder.Sql(@"
                UPDATE ""Portfolios""
                SET ""Images"" = CONCAT('[""', ""Images"", '""]')
                WHERE ""Images"" IS NOT NULL AND ""Images"" <> '';
            ");

            // Slug oluştur: id bazlı benzersiz değer
            migrationBuilder.Sql(@"UPDATE ""Portfolios"" SET ""Slug"" = 'proje-' || ""Id""::text;");

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_Slug",
                table: "Portfolios",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Portfolios_Slug",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Portfolios");

            migrationBuilder.RenameColumn(
                name: "Images",
                table: "Portfolios",
                newName: "ImageUrl");
        }
    }
}
