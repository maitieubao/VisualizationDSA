using System;
using System.Linq;
using FluentAssertions;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain
{
    /// <summary>
    /// Bao phủ trực tiếp các entity domain của module Codelab (trước đây chỉ được cover gián tiếp).
    /// </summary>
    public class CodelabEntityTests
    {
        [Fact]
        public void Codelab_GivenConstructorDefaults_ShouldApply()
        {
            var codelab = new Codelab("Title", "Desc", "code", 2, 80);

            codelab.Id.Should().NotBeEmpty();
            codelab.Title.Should().Be("Title");
            codelab.Difficulty.Should().Be(2);
            codelab.XPReward.Should().Be(80);
            codelab.MaxRuntimeMs.Should().Be(2000);
            codelab.MaxMemoryBytes.Should().Be(128000000);
            codelab.AllowedLanguages.Should().Be("csharp,python,java,javascript");
            codelab.IsDeleted.Should().BeFalse();
            codelab.Constraints.Should().BeEmpty();
            codelab.Examples.Should().BeEmpty();
            codelab.Tags.Should().BeEmpty();
            codelab.TestCases.Should().BeEmpty();
            codelab.Templates.Should().BeEmpty();
            codelab.Hints.Should().BeEmpty();
            codelab.Submissions.Should().BeEmpty();
        }

        [Fact]
        public void Codelab_GivenCustomLimitsAndMetadata_ShouldApply()
        {
            var codelab = new Codelab(
                "T", "D", "code", 3, 100,
                maxRuntimeMs: 5000, maxMemoryBytes: 256000000,
                allowedLanguages: "python,go",
                constraints: "N <= 10^5", examples: "[{\"input\":\"1\",\"expectedOutput\":\"1\"}]",
                tags: "array,math");

            codelab.MaxRuntimeMs.Should().Be(5000);
            codelab.MaxMemoryBytes.Should().Be(256000000);
            codelab.AllowedLanguages.Should().Be("python,go");
            codelab.Constraints.Should().Be("N <= 10^5");
            codelab.Examples.Should().Contain("expectedOutput");
            codelab.Tags.Should().Be("array,math");
        }

        [Fact]
        public void Codelab_GivenUpdate_ShouldReplaceAllScalars()
        {
            var codelab = new Codelab("Old", "OldDesc", "old", 1, 50);
            codelab.Update("New", "NewDesc", "newCode", 5, 200, 1000, 64000000, "rust", "C1", "E1", "tag1");

            codelab.Title.Should().Be("New");
            codelab.Description.Should().Be("NewDesc");
            codelab.InitialCode.Should().Be("newCode");
            codelab.Difficulty.Should().Be(5);
            codelab.XPReward.Should().Be(200);
            codelab.MaxRuntimeMs.Should().Be(1000);
            codelab.MaxMemoryBytes.Should().Be(64000000);
            codelab.AllowedLanguages.Should().Be("rust");
            codelab.Constraints.Should().Be("C1");
            codelab.Examples.Should().Be("E1");
            codelab.Tags.Should().Be("tag1");
            codelab.IsDeleted.Should().BeFalse();
        }

        [Fact]
        public void Codelab_GivenDelete_ShouldMarkSoftDeleted()
        {
            var codelab = new Codelab("T", "D", "c", 1, 50);
            codelab.Delete();

            codelab.IsDeleted.Should().BeTrue();
        }

        [Fact]
        public void CodelabTestCase_GivenUpdate_ShouldReplaceAllFields()
        {
            var testCase = new CodelabTestCase(Guid.NewGuid(), "1", "1", false, 1, 0);
            testCase.Update("2 3", "5", true, 4, 9);

            testCase.Input.Should().Be("2 3");
            testCase.ExpectedOutput.Should().Be("5");
            testCase.IsHidden.Should().BeTrue();
            testCase.ScoreWeight.Should().Be(4);
            testCase.OrderIndex.Should().Be(9);
        }

        [Fact]
        public void CodelabTemplate_GivenUpdate_ShouldReplaceFields()
        {
            var template = new CodelabTemplate(Guid.NewGuid(), "python", "old");
            template.Update("javascript", "new code");

            template.Language.Should().Be("javascript");
            template.BoilerplateCode.Should().Be("new code");
        }

        [Fact]
        public void CodelabHint_GivenUpdate_ShouldReplaceFields()
        {
            var hint = new CodelabHint(Guid.NewGuid(), "old", false, 5, 0);
            hint.Update("new", true, 15, 3);

            hint.Content.Should().Be("new");
            hint.IsTiered.Should().BeTrue();
            hint.XpCost.Should().Be(15);
            hint.OrderIndex.Should().Be(3);
        }

        [Fact]
        public void Submission_GivenConstructor_ShouldDefaultToPending()
        {
            var submission = new CodelabSubmission(Guid.NewGuid(), Guid.NewGuid(), "print(1)", "python", isSubmit: true);

            submission.Id.Should().NotBeEmpty();
            submission.Status.Should().Be(SubmissionStatus.Pending);
            submission.IsSubmit.Should().BeTrue();
            submission.Code.Should().Be("print(1)");
            submission.Language.Should().Be("python");
            submission.PassedCount.Should().Be(0);
            submission.TotalCount.Should().Be(0);
            submission.Score.Should().Be(0);
            submission.PerTestCaseResultJson.Should().Be("[]");
            submission.ErrorMessage.Should().BeEmpty();
            submission.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        }

        [Fact]
        public void Submission_GivenRunFlag_ShouldSetIsSubmitFalse()
        {
            var submission = new CodelabSubmission(Guid.NewGuid(), Guid.NewGuid(), "x", "python", isSubmit: false);
            submission.IsSubmit.Should().BeFalse();
        }

        [Fact]
        public void Submission_GivenUpdateResult_ShouldReplaceAllMetrics()
        {
            var submission = new CodelabSubmission(Guid.NewGuid(), Guid.NewGuid(), "x", "python", true);
            submission.UpdateResult(
                SubmissionStatus.WrongAnswer, 120, 4096, 3, 5, 3,
                "[{\"passed\":false}]", "Wrong Answer on case #4");

            submission.Status.Should().Be(SubmissionStatus.WrongAnswer);
            submission.RuntimeMs.Should().Be(120);
            submission.MemoryBytes.Should().Be(4096);
            submission.PassedCount.Should().Be(3);
            submission.TotalCount.Should().Be(5);
            submission.Score.Should().Be(3);
            submission.PerTestCaseResultJson.Should().Be("[{\"passed\":false}]");
            submission.ErrorMessage.Should().Be("Wrong Answer on case #4");
        }

        [Fact]
        public void Submission_GivenUpdateResultWithoutError_ShouldKeepEmptyMessage()
        {
            var submission = new CodelabSubmission(Guid.NewGuid(), Guid.NewGuid(), "x", "python", true);
            submission.UpdateResult(SubmissionStatus.Accepted, 10, 100, 1, 1, 1, "[]");

            submission.Status.Should().Be(SubmissionStatus.Accepted);
            submission.ErrorMessage.Should().BeEmpty();
        }

        [Fact]
        public void Submission_PrivateCtor_ShouldBeInvokableByEfMaterialization()
        {
            var ctor = typeof(CodelabSubmission).GetConstructor(
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                binder: null, types: Type.EmptyTypes, modifiers: null);

            ctor.Should().NotBeNull();
            var submission = ctor!.Invoke(null) as CodelabSubmission;

            submission.Should().NotBeNull();
            submission!.Status.Should().Be(SubmissionStatus.Pending);
            submission.IsSubmit.Should().BeFalse();
        }
    }
}
