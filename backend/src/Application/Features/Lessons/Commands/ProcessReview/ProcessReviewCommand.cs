using System;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Lessons.Commands.ProcessReview
{
    public class ProcessReviewCommand : IRequest<Unit>
    {
        public Guid AdminId { get; set; }
        public Guid ReviewId { get; set; }
        public bool IsApproved { get; set; }
        public string Feedback { get; set; } = string.Empty;
    }
}
