using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Course> Courses { get; }
        DbSet<CourseModule> CourseModules { get; }
        DbSet<ModuleItem> ModuleItems { get; }
        DbSet<ClassroomModuleItemOverride> ClassroomModuleItemOverrides { get; }
        DbSet<UserModuleItemProgress> UserModuleItemProgresses { get; }
        DbSet<Lesson> Lessons { get; }
        DbSet<Quiz> Quizzes { get; }
        DbSet<Classroom> Classrooms { get; }
        DbSet<Codelab> Codelabs { get; }
        DbSet<CodelabTestCase> CodelabTestCases { get; }
        DbSet<CodelabTemplate> CodelabTemplates { get; }
        DbSet<CodelabHint> CodelabHints { get; }
        DbSet<CodelabSubmission> CodelabSubmissions { get; }
        DbSet<ClassroomModule> ClassroomModules { get; }
        DbSet<ClassroomModuleItem> ClassroomModuleItems { get; }
        DbSet<TheoryArticle> TheoryArticles { get; }
        DbSet<TheoryArticleVersion> TheoryArticleVersions { get; }
        DbSet<LessonTheoryArticle> LessonTheoryArticles { get; }
        DbSet<ClassroomAnnouncement> ClassroomAnnouncements { get; }
        
        DbSet<User> Users { get; }
        DbSet<ClassroomEnrollment> ClassroomEnrollments { get; }
        DbSet<LessonReview> LessonReviews { get; }
        
        DbSet<TEntity> Set<TEntity>() where TEntity : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}