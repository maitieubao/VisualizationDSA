using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [RequireJwtRole]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizzesController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<QuizDto>>> GetAll()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();
            return Ok(quizzes);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<QuizDto>> GetById(Guid id)
        {
            var quiz = await _quizService.GetQuizByIdAsync(id);
            return Ok(quiz);
        }

        [HttpGet("topic/{topic}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<QuizDto>>> GetByTopic(string topic)
        {
            var quizzes = await _quizService.GetQuizzesByTopicAsync(topic);
            return Ok(quizzes);
        }

        [HttpPost("attempt")]
        public async Task<ActionResult<QuizAttemptResult>> SubmitAttempt([FromBody] QuizAttemptRequest? request)
        {
            // Guard body null/thiếu answers → 400 thay vì NRE 500.
            if (request == null || request.Answers == null || request.Answers.Length == 0)
            {
                return BadRequest(new { message = "Dữ liệu bài làm không hợp lệ." });
            }
            var userId = GetCurrentUserId();
            var result = await _quizService.SubmitQuizAttemptAsync(userId, request);
            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<ActionResult<VisualizationDSA.Application.Features.Analytics.Queries.GetQuizHistory.QuizHistoryResult>> GetHistory(
            [FromServices] MediatR.IMediator mediator,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            // Clamp phân trang.
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var userId  = GetCurrentUserId();
            var result = await mediator.Send(new VisualizationDSA.Application.Features.Analytics.Queries.GetQuizHistory.GetQuizHistoryQuery
            {
                UserId = userId,
                Page = pageNumber,
                PageSize = pageSize
            });
            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("User identity claim không hợp lệ hoặc bị thiếu.");
            return userId;
        }
    }
}
