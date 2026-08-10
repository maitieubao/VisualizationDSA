using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Domain.Lectures;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Lectures
{
    public class LecturesControllerTests
    {
        private static Lecture CreateLecture(string algorithmId, string lectureId = "lec-001", int slideCount = 2)
        {
            var lecture = new Lecture
            {
                LectureId = lectureId,
                AlgorithmId = algorithmId,
                Title = $"Lecture {algorithmId}",
                Slides = new List<Slide>()
            };
            for (var i = 1; i <= slideCount; i++)
            {
                lecture.Slides.Add(new Slide
                {
                    SlideId = i,
                    Type = "theory",
                    Content = "<p>Nội dung</p>",
                    Action = new SlideAction { Command = "PAUSE", TargetFrame = 0 }
                });
            }
            return lecture;
        }

        [Fact]
        public void GetAll_ReturnsSummaryListWithSlideCount()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort", "lec-bubble", 5),
                CreateLecture("quick-sort", "lec-quick", 3)
            });
            var controller = new LecturesController(repository);

            var actionResult = controller.GetAll();

            var ok = actionResult.Result.Should().BeOfType<OkObjectResult>().Subject;
            var summaries = ok.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            summaries.Should().HaveCount(2);
        }

        [Fact]
        public void GetAll_EmptyRepository_ReturnsEmptyList()
        {
            var controller = new LecturesController(new LectureRepository());

            var actionResult = controller.GetAll();

            var ok = actionResult.Result.Should().BeOfType<OkObjectResult>().Subject;
            var summaries = ok.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            summaries.Should().BeEmpty();
        }

        [Fact]
        public void GetByAlgorithmId_ExistingLecture_ReturnsOkWithLecture()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort", "lec-bubble", 5)
            });
            var controller = new LecturesController(repository);

            var actionResult = controller.GetByAlgorithmId("bubble-sort");

            var ok = actionResult.Result.Should().BeOfType<OkObjectResult>().Subject;
            var lecture = ok.Value.Should().BeOfType<Lecture>().Subject;
            lecture!.LectureId.Should().Be("lec-bubble");
            lecture!.Slides.Should().HaveCount(5);
        }

        [Fact]
        public void GetByAlgorithmId_UnknownLecture_ReturnsNotFoundWithErrorContract()
        {
            var controller = new LecturesController(new LectureRepository());

            var actionResult = controller.GetByAlgorithmId("dijkstra");

            var notFound = actionResult.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var errorType = notFound.Value?.GetType().GetProperty("errorType")?.GetValue(notFound.Value) as string;
            errorType.Should().Be("LECTURE_NOT_FOUND");
        }
    }
}
