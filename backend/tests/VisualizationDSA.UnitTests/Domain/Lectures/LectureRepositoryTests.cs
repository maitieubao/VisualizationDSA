using System.Collections.Generic;
using FluentAssertions;
using VisualizationDSA.Domain.Lectures;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain.Lectures
{
    public class LectureRepositoryTests
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
        public void DefaultConstructor_StartsEmpty_NoBundledSeed()
        {
            var repository = new LectureRepository();

            repository.GetAll().Should().BeEmpty();
        }

        [Fact]
        public void GetAll_ReturnsAllSeededLectures()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort"),
                CreateLecture("quick-sort", "lec-002")
            });

            var result = repository.GetAll();

            result.Should().HaveCount(2);
        }

        [Fact]
        public void GetByAlgorithmId_ExistingLecture_ReturnsLecture()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort", "lec-bubble", 5)
            });

            var result = repository.GetByAlgorithmId("bubble-sort");

            result.Should().NotBeNull();
            result!.LectureId.Should().Be("lec-bubble");
            result!.Slides.Should().HaveCount(5);
        }

        [Fact]
        public void GetByAlgorithmId_IsCaseInsensitive()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort")
            });

            var result = repository.GetByAlgorithmId("BUBBLE-SORT");

            result.Should().NotBeNull();
        }

        [Fact]
        public void GetByAlgorithmId_UnknownAlgorithm_ReturnsNull()
        {
            var repository = new LectureRepository(new List<Lecture>
            {
                CreateLecture("bubble-sort")
            });

            var result = repository.GetByAlgorithmId("dijkstra");

            result.Should().BeNull();
        }

        [Fact]
        public void GetByAlgorithmId_EmptyRepository_ReturnsNull()
        {
            var repository = new LectureRepository();

            var result = repository.GetByAlgorithmId("bubble-sort");

            result.Should().BeNull();
        }
    }
}
