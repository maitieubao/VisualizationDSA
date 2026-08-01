using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;






using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/quizzes")]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IMediator _mediator;

        public QuizController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuizzes(
            [FromQuery] string? topic,
            [FromQuery] int? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            
            return Ok(new { message = "Get quizzes endpoint - implement query" });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(Guid id)
        {
            
            return Ok(new { message = "Get quiz by id endpoint - implement query" });
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Create quiz endpoint - implement command" });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateQuiz(Guid id, [FromBody] UpdateQuizRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Update quiz endpoint - implement command" });
        }

        [HttpPost("{id}/questions")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddQuestion(Guid id, [FromBody] AddQuizQuestionRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Add question endpoint - implement command" });
        }

        [HttpPut("{id}/questions/reorder")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> ReorderQuestions(Guid id, [FromBody] ReorderQuestionsRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Reorder questions endpoint - implement command" });
        }
    }

    public class CreateQuizRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public int Difficulty { get; set; } = 1;
        public int XPReward { get; set; } = 50;
        public List<CreateQuizQuestionDto> Questions { get; set; } = new();
    }

    public class CreateQuizQuestionDto
    {
        public string Question { get; set; } = string.Empty;
        public string[] Options { get; set; } = Array.Empty<string>();
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    public class UpdateQuizRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
    }

    public class AddQuizQuestionRequest
    {
        public string Question { get; set; } = string.Empty;
        public string[] Options { get; set; } = Array.Empty<string>();
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    public class ReorderQuestionsRequest
    {
        public List<QuestionOrderDto> QuestionOrders { get; set; } = new();
    }

    public class QuestionOrderDto
    {
        public Guid QuestionId { get; set; }
        public int OrderIndex { get; set; }
    }
}