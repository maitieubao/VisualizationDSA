using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    
    
    
    
    public class SemanticGraphServiceTests
    {
        private static ApplicationDbContext NewContext() =>
            new ApplicationDbContext(
                new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                    .Options);

        private static (SemanticConceptNode oop, SemanticConceptNode solid, SemanticConceptNode dsa) SeedThreeNodes(ApplicationDbContext db)
        {
            var oop   = new SemanticConceptNode("oop.encapsulation", "Encapsulation", "OOP", "Ẩn giấu dữ liệu", new[] { 0.1, 0.2 }, 0.9);
            var solid = new SemanticConceptNode("solid.srp", "Single Responsibility", "SOLID", "Một lý do thay đổi", new[] { 0.2, 0.1 }, 0.8);
            var dsa   = new SemanticConceptNode("dsa.binary-search", "Binary Search", "DSA", "Tìm kiếm nhị phân", new[] { 0.3, 0.4 }, 0.7);
            db.AddRange(oop, solid, dsa);
            db.SaveChanges();
            return (oop, solid, dsa);
        }

        [Fact]
        public async Task GetSemanticGraphAsync_ShouldReturnAllNodesEdgesAndStats()
        {
            using var db = NewContext();
            var (oop, solid, dsa) = SeedThreeNodes(db);
            db.Add(new KnowledgeEdge(solid.Id, oop.Id, "DependsOn", 1.5));
            db.Add(new KnowledgeEdge(dsa.Id, oop.Id, "Precedes", 1.0));
            db.SaveChanges();

            var service = new SemanticGraphService(db);
            var result = await service.GetSemanticGraphAsync();

            result.Nodes.Should().HaveCount(3);
            result.Edges.Should().HaveCount(2);
            result.Stats.NodeCount.Should().Be(3);
            result.Stats.EdgeCount.Should().Be(2);
            result.Stats.CategoryCount.Should().Be(3);
            
            result.Stats.GraphDensity.Should().BeApproximately(0.3333, 0.0001);
        }

        [Fact]
        public async Task GetSemanticGraphAsync_ShouldOrderNodesByImportanceDescending()
        {
            using var db = NewContext();
            SeedThreeNodes(db);

            var service = new SemanticGraphService(db);
            var result = await service.GetSemanticGraphAsync();

            result.Nodes.Select(n => n.Importance)
                .Should().BeInDescendingOrder();
            result.Nodes.First().ConceptKey.Should().Be("oop.encapsulation"); 
        }

        [Fact]
        public async Task GetSemanticGraphAsync_ShouldComputeDegreeFromIncomingAndOutgoingEdges()
        {
            using var db = NewContext();
            var (oop, solid, dsa) = SeedThreeNodes(db);
            db.Add(new KnowledgeEdge(solid.Id, oop.Id, "DependsOn", 1.5)); 
            db.Add(new KnowledgeEdge(dsa.Id, oop.Id, "Precedes", 1.0));    
            db.SaveChanges();

            var service = new SemanticGraphService(db);
            var result = await service.GetSemanticGraphAsync();

            result.Nodes.Single(n => n.ConceptKey == "oop.encapsulation").Degree.Should().Be(2);
            result.Nodes.Single(n => n.ConceptKey == "solid.srp").Degree.Should().Be(1);
            result.Nodes.Single(n => n.ConceptKey == "dsa.binary-search").Degree.Should().Be(1);
        }

        [Fact]
        public async Task GetSemanticGraphAsync_WithCategoryFilter_ShouldReturnInducedSubgraphOnly()
        {
            using var db = NewContext();
            var (oop, solid, dsa) = SeedThreeNodes(db);
            
            db.Add(new KnowledgeEdge(solid.Id, oop.Id, "DependsOn", 1.5));
            db.SaveChanges();

            var service = new SemanticGraphService(db);
            var result = await service.GetSemanticGraphAsync("OOP");

            result.Nodes.Should().ContainSingle().Which.Category.Should().Be("OOP");
            result.Edges.Should().BeEmpty(); 
            result.Stats.NodeCount.Should().Be(1);
            result.Stats.EdgeCount.Should().Be(0);
            result.Stats.GraphDensity.Should().Be(0.0); 
        }

        [Fact]
        public async Task GetSemanticGraphAsync_OnEmptyGraph_ShouldReturnZeroStats()
        {
            using var db = NewContext();
            var service = new SemanticGraphService(db);

            var result = await service.GetSemanticGraphAsync();

            result.Nodes.Should().BeEmpty();
            result.Edges.Should().BeEmpty();
            result.Stats.NodeCount.Should().Be(0);
            result.Stats.GraphDensity.Should().Be(0.0);
        }
    }
}
