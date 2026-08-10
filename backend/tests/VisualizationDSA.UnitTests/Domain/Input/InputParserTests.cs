using FluentAssertions;
using VisualizationDSA.Domain.Input;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain.Input
{
    public class InputParserTests
    {
        [Fact]
        public void ParseArray_GivenValidInput_ShouldReturnIntArray()
        {
            var result = InputParser.ParseArray("14, 25, 38");
            result.Should().Equal(14, 25, 38);
        }

        [Fact]
        public void ParseArray_GivenNegativeNumbers_ShouldReturnNegativeIntArray()
        {
            var result = InputParser.ParseArray("-5, 10, -3");
            result.Should().Equal(-5, 10, -3);
        }

        [Fact]
        public void ParseArray_GivenSingleNumber_ShouldReturnSingleElementArray()
        {
            var result = InputParser.ParseArray("42");
            result.Should().HaveCount(1);
            result[0].Should().Be(42);
        }

        [Fact]
        public void ParseArray_GivenEmptyString_ShouldThrowArgumentException()
        {
            Action act = () => InputParser.ParseArray("");
            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void ParseArray_GivenWhitespaceOnly_ShouldThrowArgumentException()
        {
            Action act = () => InputParser.ParseArray("   ");
            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void ParseArray_GivenInvalidFormat_ShouldThrowFormatException()
        {
            Action act = () => InputParser.ParseArray("12, a, 5");
            act.Should().Throw<FormatException>();
        }

        [Fact]
        public void ParseArray_GivenTrailingComma_ShouldThrowFormatException()
        {
            Action act = () => InputParser.ParseArray("12, 5,");
            act.Should().Throw<FormatException>();
        }

        [Fact]
        public void ParseArray_GivenDoubleCommas_ShouldThrowFormatException()
        {
            Action act = () => InputParser.ParseArray("12,,5");
            act.Should().Throw<FormatException>();
        }

        [Fact]
        public void ParseArray_GivenDecimals_ShouldThrowFormatException()
        {
            Action act = () => InputParser.ParseArray("12.5, 3");
            act.Should().Throw<FormatException>();
        }

        [Fact]
        public void ParseArray_GivenPlusMinusPrefix_ShouldParseCorrectly()
        {
            var result = InputParser.ParseArray("+5, -3, 10");
            result.Should().Equal(5, -3, 10);
        }

        [Fact]
        public void ParseArray_GivenWhitespaceAroundNumbers_ShouldTrimAndParse()
        {
            var result = InputParser.ParseArray(" 14 , 25 , 38 ");
            result.Should().Equal(14, 25, 38);
        }
    }
}
