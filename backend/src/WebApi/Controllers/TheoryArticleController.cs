using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.TheoryArticles.Commands.CreateTheoryArticle;
using VisualizationDSA.Application.Features.TheoryArticles.Commands.UpdateTheoryArticle;
using VisualizationDSA.Application.Features.TheoryArticles.Commands.PublishTheoryArticle;
using VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticles;
using VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticleById;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/theory-articles")]
    [Authorize]
    public class TheoryArticleController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TheoryArticleController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetArticles(
            [FromQuery] string? category,
            [FromQuery] string? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool onlyPublished = true)
        {
            var query = new GetTheoryArticlesQuery
            {
                Category = category,
                Difficulty = difficulty,
                Search = search,
                Page = page,
                PageSize = pageSize,
                OnlyPublished = onlyPublished
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticle(Guid id, [FromQuery] bool incrementView = false)
        {
            var query = new GetTheoryArticleByIdQuery
            {
                ArticleId = id,
                IncrementView = incrementView
            };
            var result = await _mediator.Send(query);
            if (result == null)
                return NotFound(new { error = "NOT_FOUND", message = "Article not found." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateArticle([FromBody] CreateTheoryArticleRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var authorId))
                return Unauthorized();

            var command = new CreateTheoryArticleCommand
            {
                AuthorId = authorId,
                Title = request.Title,
                Slug = request.Slug,
                ContentMd = request.ContentMd,
                Category = request.Category,
                Difficulty = request.Difficulty,
                Tags = request.Tags,
                ReadTimeMinutes = request.ReadTimeMinutes
            };

            var articleId = await _mediator.Send(command);
            return Ok(new { articleId });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateArticle(Guid id, [FromBody] UpdateTheoryArticleRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var authorId))
                return Unauthorized();

            var command = new UpdateTheoryArticleCommand
            {
                ArticleId = id,
                AuthorId = authorId,
                Title = request.Title,
                Slug = request.Slug,
                ContentMd = request.ContentMd,
                Category = request.Category,
                Difficulty = request.Difficulty,
                Tags = request.Tags,
                ReadTimeMinutes = request.ReadTimeMinutes
            };

            try
            {
                await _mediator.Send(command);
                return Ok(new { message = "Article updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
        }

        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> PublishArticle(Guid id, [FromBody] PublishArticleRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var authorId))
                return Unauthorized();

            var command = new PublishTheoryArticleCommand
            {
                ArticleId = id,
                AuthorId = authorId,
                Publish = request.Publish
            };

            try
            {
                await _mediator.Send(command);
                return Ok(new { message = request.Publish ? "Article published" : "Article unpublished" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
        }
    }

    public class CreateTheoryArticleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Beginner";
        public string Tags { get; set; } = string.Empty;
        public int ReadTimeMinutes { get; set; }
    }

    public class UpdateTheoryArticleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public int ReadTimeMinutes { get; set; }
    }

    public class PublishArticleRequest
    {
        public bool Publish { get; set; } = true;
    }
}