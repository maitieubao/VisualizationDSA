using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
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
        public async Task<ActionResult<QuizAttemptResult>> SubmitAttempt([FromBody] QuizAttemptRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _quizService.SubmitQuizAttemptAsync(userId, request);
            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<QuizAttemptDto>>> GetHistory([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var userId  = GetCurrentUserId();
            var history = await _quizService.GetUserQuizHistoryAsync(userId, pageNumber, pageSize);
            return Ok(history);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}
