using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Lessons.Commands.ProcessReview
{
    public class ProcessReviewCommandHandler : IRequestHandler<ProcessReviewCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public ProcessReviewCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(ProcessReviewCommand request, CancellationToken cancellationToken)
        {
            var admin = await _context.Users.FindAsync(new object[] { request.AdminId }, cancellationToken);
            if (admin == null || admin.Role != "Admin")
            {
                throw new UnauthorizedAccessException("Only admins can review lessons.");
            }

            var review = await _context.LessonReviews
                .Include(r => r.Lesson)
                .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken);

            if (review == null)
            {
                throw new ArgumentException("Review not found.");
            }

            review.ProcessReview(request.AdminId, request.IsApproved, request.Feedback);

            if (request.IsApproved)
            {
                review.Lesson.ApproveAndPublish();
            }
            else
            {
                review.Lesson.Reject();
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
