using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem
{
    public class CreateClassroomModuleItemCommandHandler : IRequestHandler<CreateClassroomModuleItemCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateClassroomModuleItemCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateClassroomModuleItemCommand request, CancellationToken cancellationToken)
        {
            var module = await _context.ClassroomModules.FindAsync(new object[] { request.ModuleId }, cancellationToken);
            if (module == null)
                throw new ArgumentException("Module not found.");

            var classroom = await _context.Classrooms.FindAsync(new object[] { module.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can add items.");

            
            Guid? lessonId = null, quizId = null, codelabId = null;
            
            switch (request.ItemType)
            {
                case ModuleItemType.Lesson:
                    if (request.LessonId.HasValue)
                        lessonId = request.LessonId;
                    else if (request.CustomLessonId.HasValue)
                    {
                        
                        var customLesson = new Lesson(
                            request.OverrideTitle, 
                            request.OverrideDescription, 
                            "custom", 
                            "{}", 
                            0, 
                            request.TeacherId);
                        _context.Lessons.Add(customLesson);
                        await _context.SaveChangesAsync(cancellationToken);
                        lessonId = customLesson.Id;
                    }
                    else
                        throw new ArgumentException("LessonId or CustomLessonId required for Lesson type.");
                    break;
                    
                case ModuleItemType.Quiz:
                    if (!request.QuizId.HasValue)
                        throw new ArgumentException("QuizId required for Quiz type.");
                    quizId = request.QuizId;
                    break;
                    
                case ModuleItemType.Codelab:
                    if (!request.CodelabId.HasValue)
                        throw new ArgumentException("CodelabId required for Codelab type.");
                    codelabId = request.CodelabId;
                    break;
            }

            var item = new ClassroomModuleItem(
                request.ModuleId,
                request.ItemType,
                lessonId,
                quizId,
                codelabId,
                request.OverrideTitle,
                request.OverrideDescription,
                request.OrderIndex,
                request.IsRequired,
                request.UnlockAt,
                request.DueAt,
                request.MaxAttempts,
                request.IsHidden,
                request.PrerequisiteItemId,
                request.IsSequential);

            _context.ClassroomModuleItems.Add(item);
            await _context.SaveChangesAsync(cancellationToken);

            return item.Id;
        }
    }
}