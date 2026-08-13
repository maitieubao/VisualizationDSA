using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Lessons.Commands.UpdateLesson
{
    public class UpdateLessonCommandHandler : IRequestHandler<UpdateLessonCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public UpdateLessonCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == request.LessonId, cancellationToken);
            if (lesson == null)
                throw new ArgumentException("Lesson not found.");

            if (lesson.CreatedByTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this lesson.");

            // A1.1: codelab gắn mới phải thuộc teacher hoặc dùng chung (OwnerId null).
            if (request.CodelabId.HasValue)
            {
                var codelab = await _context.Codelabs
                    .FirstOrDefaultAsync(c => c.Id == request.CodelabId.Value, cancellationToken);
                if (codelab == null)
                    throw new ArgumentException("Codelab not found.");
                if (codelab.OwnerId != null && codelab.OwnerId != request.TeacherId)
                    throw new UnauthorizedAccessException("You cannot link a codelab owned by another teacher.");
            }

            // A1.2: map chuỗi trạng thái authoring (chuỗi rỗng = giữ nguyên trạng thái hiện tại).
            LessonPublishStatus? publishStatus = null;
            if (!string.IsNullOrWhiteSpace(request.PublishStatus))
            {
                if (!Lesson.TryParseAuthorPublishStatus(request.PublishStatus, out var parsed))
                    throw new ArgumentException("PublishStatus chỉ nhận một trong: Draft, Private, Published.");
                publishStatus = parsed;
            }

            lesson.Update(request.Title, request.ContentMd, request.SandboxType, request.SandboxConfig, request.XPReward, request.CodelabId, publishStatus);

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
