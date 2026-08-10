using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using VisualizationDSA.Domain.Lectures;

namespace VisualizationDSA.WebApi.Controllers;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LecturesController : ControllerBase
{
    private readonly LectureRepository _repository;

    public LecturesController(LectureRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<object>> GetAll()
    {
        var lectures = _repository.GetAll();
        var summary = lectures.Select(l => new
        {
            l.LectureId,
            l.AlgorithmId,
            l.Title,
            SlideCount = l.Slides.Count
        });
        return Ok(summary);
    }

    [HttpGet("{algorithmId}")]
    [ResponseCache(Duration = 604800, Location = ResponseCacheLocation.Any)]
    public ActionResult<Lecture> GetByAlgorithmId(string algorithmId)
    {
        var lecture = _repository.GetByAlgorithmId(algorithmId);
        if (lecture == null)
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "LECTURE_NOT_FOUND",
                message = $"Không tìm thấy kịch bản bài giảng điện tử cho thuật toán: '{algorithmId}'."
            });
        }

        return Ok(lecture);
    }
}
