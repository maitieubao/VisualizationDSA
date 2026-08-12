using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom
{
    public class ImportCourseToClassroomCommandHandler : IRequestHandler<ImportCourseToClassroomCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public ImportCourseToClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(ImportCourseToClassroomCommand request, CancellationToken cancellationToken)
        {
            // TC-025: bọc toàn bộ import trong 1 transaction — lỗi giữa chừng (thiếu module,
            // duplicate order, DB lỗi) rollback toàn bộ, không để lại classroom "dở dang".
            // InMemory store (test) không hỗ trợ transaction → chạy thẳng HandleCoreAsync.
            var providerName = (_context as DbContext)?.Database.ProviderName;
            if (_context is DbContext relationalContext && !string.Equals(providerName, "Microsoft.EntityFrameworkCore.InMemory", StringComparison.Ordinal))
            {
                await using var transaction = await relationalContext.Database.BeginTransactionAsync(cancellationToken);
                try
                {
                    var result = await HandleCoreAsync(request, cancellationToken);
                    await transaction.CommitAsync(cancellationToken);
                    return result;
                }
                catch
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw;
                }
            }

            return await HandleCoreAsync(request, cancellationToken);
        }

        private async Task<Guid> HandleCoreAsync(ImportCourseToClassroomCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new InvalidOperationException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this classroom.");

            var course = await _context.Courses
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                        .ThenInclude(i => i.Lesson)
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                        .ThenInclude(i => i.Quiz)
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                        .ThenInclude(i => i.Codelab)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null)
                throw new InvalidOperationException("Course not found.");

            // TC-025: teacher chỉ được import khóa học MÌNH sở hữu — không import trộm khóa học
            // của teacher khác vào classroom (trước đây thiếu check ownership).
            if (course.TeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this course.");

            if (request.OverrideExisting)
            {
                
                foreach (var module in classroom.Modules)
                {
                    module.Delete();
                    foreach (var item in module.Items)
                    {
                        item.Delete();
                    }
                }
            }

            
            var modulesToImport = request.IncludeAllModules 
                ? course.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.OrderIndex).ToList()
                : course.Modules.Where(m => !m.IsDeleted && request.SelectedModuleIds.Contains(m.Id)).OrderBy(m => m.OrderIndex).ToList();

            int moduleOrder = 1;
            foreach (var courseModule in modulesToImport)
            {
                var classroomModule = new ClassroomModule(
                    classroom.Id,
                    courseModule.Title,
                    courseModule.Description,
                    moduleOrder,
                    false,
                    null);

                _context.ClassroomModules.Add(classroomModule);
                await _context.SaveChangesAsync(cancellationToken);

                
                var itemsToImport = courseModule.Items.Where(i => !i.IsDeleted).OrderBy(i => i.OrderIndex).ToList();
                int itemOrder = 1;

                foreach (var courseItem in itemsToImport)
                {
                    var classroomModuleItem = new ClassroomModuleItem(
                        classroomModule.Id,
                        courseItem.ItemType,
                        courseItem.LessonId,
                        courseItem.QuizId,
                        courseItem.CodelabId,
                        courseItem.OverrideTitle,
                        "", 
                        itemOrder,
                        courseItem.IsRequired,
                        null, 
                        null, 
                        null, 
                        false, 
                        null, 
                        true 
                    );

                    _context.ClassroomModuleItems.Add(classroomModuleItem);
                    itemOrder++;
                }

                moduleOrder++;
            }

            
            classroom.SetImportedFromCourse(course.Id);
            classroom.LinkToCourse(course.Id);

            await _context.SaveChangesAsync(cancellationToken);

            return classroom.Id;
        }
    }
}