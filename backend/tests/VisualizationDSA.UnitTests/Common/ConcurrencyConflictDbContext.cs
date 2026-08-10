using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.UnitTests.Common;

/// <summary>
/// Stub context that throws DbUpdateConcurrencyException on SaveChangesAsync
/// to simulate a stale RowVersion optimistic-concurrency conflict.
/// </summary>
public class ConcurrencyConflictDbContext : IApplicationDbContext
{
    private readonly ApplicationDbContext _inner;

    public ConcurrencyConflictDbContext(ApplicationDbContext inner) => _inner = inner;

    public DbSet<Course> Courses => _inner.Courses;
    public DbSet<CourseModule> CourseModules => _inner.CourseModules;
    public DbSet<ModuleItem> ModuleItems => _inner.ModuleItems;
    public DbSet<ClassroomModuleItemOverride> ClassroomModuleItemOverrides => _inner.ClassroomModuleItemOverrides;
    public DbSet<UserModuleItemProgress> UserModuleItemProgresses => _inner.UserModuleItemProgresses;
    public DbSet<Lesson> Lessons => _inner.Lessons;
    public DbSet<Quiz> Quizzes => _inner.Quizzes;
    public DbSet<Classroom> Classrooms => _inner.Classrooms;
    public DbSet<Codelab> Codelabs => _inner.Codelabs;
    public DbSet<CodelabTestCase> CodelabTestCases => _inner.CodelabTestCases;
    public DbSet<CodelabTemplate> CodelabTemplates => _inner.CodelabTemplates;
    public DbSet<CodelabHint> CodelabHints => _inner.CodelabHints;
    public DbSet<CodelabSubmission> CodelabSubmissions => _inner.CodelabSubmissions;
    public DbSet<ClassroomModule> ClassroomModules => _inner.ClassroomModules;
    public DbSet<ClassroomModuleItem> ClassroomModuleItems => _inner.ClassroomModuleItems;
    public DbSet<TheoryArticle> TheoryArticles => _inner.TheoryArticles;
    public DbSet<TheoryArticleVersion> TheoryArticleVersions => _inner.TheoryArticleVersions;
    public DbSet<LessonTheoryArticle> LessonTheoryArticles => _inner.LessonTheoryArticles;
    public DbSet<ClassroomAnnouncement> ClassroomAnnouncements => _inner.ClassroomAnnouncements;
    public DbSet<User> Users => _inner.Users;
    public DbSet<ClassroomEnrollment> ClassroomEnrollments => _inner.ClassroomEnrollments;
    public DbSet<LessonReview> LessonReviews => _inner.LessonReviews;

    public DbSet<TEntity> Set<TEntity>() where TEntity : class => _inner.Set<TEntity>();

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        => throw new DbUpdateConcurrencyException("Concurrency conflict simulated.");
}
