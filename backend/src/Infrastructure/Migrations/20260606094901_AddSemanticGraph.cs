using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSemanticGraph : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SemanticConceptNodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConceptKey = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Embedding = table.Column<double[]>(type: "double precision[]", nullable: false),
                    Importance = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SemanticConceptNodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KnowledgeEdges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceNodeId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetNodeId = table.Column<Guid>(type: "uuid", nullable: false),
                    RelationType = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false, defaultValue: 1.0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KnowledgeEdges_SemanticConceptNodes_SourceNodeId",
                        column: x => x.SourceNodeId,
                        principalTable: "SemanticConceptNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KnowledgeEdges_SemanticConceptNodes_TargetNodeId",
                        column: x => x.TargetNodeId,
                        principalTable: "SemanticConceptNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_RelationType",
                table: "KnowledgeEdges",
                column: "RelationType");

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_SourceNodeId_TargetNodeId_RelationType",
                table: "KnowledgeEdges",
                columns: new[] { "SourceNodeId", "TargetNodeId", "RelationType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_TargetNodeId",
                table: "KnowledgeEdges",
                column: "TargetNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_SemanticConceptNodes_Category",
                table: "SemanticConceptNodes",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SemanticConceptNodes_ConceptKey",
                table: "SemanticConceptNodes",
                column: "ConceptKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KnowledgeEdges");

            migrationBuilder.DropTable(
                name: "SemanticConceptNodes");
        }
    }
}
