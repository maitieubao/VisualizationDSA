using FluentAssertions;
using VisualizationDSA.Domain.Input;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain.Input
{
    public class ConstraintResolverTests
    {
        [Theory]
        [InlineData("bubble-sort", 50)]
        [InlineData("selection-sort", 50)]
        [InlineData("insertion-sort", 50)]
        [InlineData("quick-sort", 150)]
        [InlineData("merge-sort", 150)]
        [InlineData("heap-sort", 150)]
        [InlineData("linear-search", 100)]
        [InlineData("binary-search", 150)]
        [InlineData("stack", 20)]
        [InlineData("queue", 20)]
        [InlineData("bst", 15)]
        public void GetAllowedLimit_KnownAlgorithm_ShouldReturnCorrectLimit(string algorithmId, int expected)
        {
            var result = ConstraintResolver.GetAllowedLimit(algorithmId);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("unknown-algorithm")]
        [InlineData("")]
        [InlineData("random-sort")]
        public void GetAllowedLimit_UnknownAlgorithm_ShouldReturnDefaultLimit(string algorithmId)
        {
            var result = ConstraintResolver.GetAllowedLimit(algorithmId);
            result.Should().Be(15);
        }

        [Theory]
        [InlineData("bubble-sort", 30, true)]
        [InlineData("bubble-sort", 50, true)]
        [InlineData("bubble-sort", 60, false)]
        [InlineData("binary-search", 100, true)]
        [InlineData("binary-search", 150, true)]
        [InlineData("binary-search", 200, false)]
        public void ValidateSize_VariousCases_ShouldReturnExpected(string algorithmId, int size, bool expected)
        {
            var result = ConstraintResolver.ValidateSize(algorithmId, size, out _);
            result.Should().Be(expected);
        }

        [Fact]
        public void ValidateSize_OutCases_ShouldReturnAllowedLimit()
        {
            ConstraintResolver.ValidateSize("bubble-sort", 30, out int allowedLimit);
            allowedLimit.Should().Be(50);
        }

        [Fact]
        public void GetAllowedLimit_IsCaseInsensitive()
        {
            var result = ConstraintResolver.GetAllowedLimit("Bubble-Sort");
            result.Should().Be(50);
        }
    }
}
