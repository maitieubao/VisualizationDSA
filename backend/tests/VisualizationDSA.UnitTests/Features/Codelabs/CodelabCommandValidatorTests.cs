using System;
using System.Linq;
using FluentAssertions;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    /// <summary>
    /// Bao phủ trực tiếp các FluentValidation validators của module Codelab.
    /// </summary>
    public class CodelabCommandValidatorTests
    {
        private static CreateCodelabCommand ValidCreate() => new()
        {
            Title = "Two Sum",
            Description = "Find pair",
            InitialCode = "def solve(): pass",
            Difficulty = 1,
            XPReward = 50,
            AllowedLanguages = "python"
        };

        [Theory]
        [InlineData("", "Description", 1, 50, "python")]          // title trống
        [InlineData("   ", "Description", 1, 50, "python")]      // title chỉ khoảng trắng
        [InlineData("Title", "", 1, 50, "python")]               // description trống
        [InlineData("Title", "Desc", 0, 50, "python")]           // difficulty quá thấp
        [InlineData("Title", "Desc", 6, 50, "python")]           // difficulty quá cao
        [InlineData("Title", "Desc", 1, -1, "python")]           // xpReward âm
        [InlineData("Title", "Desc", 1, 50, "")]                 // allowedLanguages trống
        [InlineData("Title", "Desc", 1, 50, " ")]                // allowedLanguages khoảng trắng
        public void Create_GivenInvalidInput_ShouldFail(
            string title, string description, int difficulty, int xpReward, string languages)
        {
            var validator = new CreateCodelabCommandValidator();
            var command = new CreateCodelabCommand
            {
                Title = title,
                Description = description,
                InitialCode = "code",
                Difficulty = difficulty,
                XPReward = xpReward,
                AllowedLanguages = languages
            };

            validator.Validate(command).IsValid.Should().BeFalse();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public void Create_GivenInvalidMaxRuntime_ShouldFail(int maxRuntimeMs)
        {
            var validator = new CreateCodelabCommandValidator();
            var command = ValidCreate();
            command.MaxRuntimeMs = maxRuntimeMs;

            validator.Validate(command).IsValid.Should().BeFalse();
        }

        [Fact]
        public void Create_GivenValidInput_ShouldPass()
        {
            var validator = new CreateCodelabCommandValidator();
            validator.Validate(ValidCreate()).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Create_GivenLongTitle_ShouldFail()
        {
            var validator = new CreateCodelabCommandValidator();
            var command = ValidCreate();
            command.Title = new string('a', 201);

            validator.Validate(command).IsValid.Should().BeFalse();
        }

        [Fact]
        public void Create_GivenValidMaxLimits_ShouldPass()
        {
            var validator = new CreateCodelabCommandValidator();
            var command = ValidCreate();
            command.MaxRuntimeMs = 10000;
            command.MaxMemoryBytes = 0; // phải fail
            validator.Validate(command).IsValid.Should().BeFalse();

            command.MaxMemoryBytes = 1;
            validator.Validate(command).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Update_GivenEmptyCodelabId_ShouldFail()
        {
            var validator = new UpdateCodelabCommandValidator();
            var command = new UpdateCodelabCommand
            {
                CodelabId = Guid.Empty,
                Title = "T",
                Description = "D",
                InitialCode = "c",
                AllowedLanguages = "python"
            };

            validator.Validate(command).IsValid.Should().BeFalse();
        }

        [Fact]
        public void Update_GivenValid_ShouldPass()
        {
            var validator = new UpdateCodelabCommandValidator();
            var command = new UpdateCodelabCommand
            {
                CodelabId = Guid.NewGuid(),
                Title = "T",
                Description = "D",
                InitialCode = "c",
                AllowedLanguages = "python"
            };

            validator.Validate(command).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Delete_GivenEmptyCodelabId_ShouldFail()
        {
            var validator = new DeleteCodelabCommandValidator();
            validator.Validate(new DeleteCodelabCommand { CodelabId = Guid.Empty }).IsValid.Should().BeFalse();
            validator.Validate(new DeleteCodelabCommand { CodelabId = Guid.NewGuid() }).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Submit_GivenEmptyFields_ShouldFail()
        {
            var validator = new SubmitCodelabCommandValidator();
            validator.Validate(new SubmitCodelabCommand()).IsValid.Should().BeFalse();

            var valid = new SubmitCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = Guid.NewGuid(),
                Code = "x",
                Language = "python"
            };
            validator.Validate(valid).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Run_GivenEmptyFields_ShouldFail()
        {
            var validator = new RunCodelabCommandValidator();
            validator.Validate(new RunCodelabCommand()).IsValid.Should().BeFalse();

            var valid = new RunCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = Guid.NewGuid(),
                Code = "x",
                Language = "python"
            };
            validator.Validate(valid).IsValid.Should().BeTrue();
        }
    }
}
