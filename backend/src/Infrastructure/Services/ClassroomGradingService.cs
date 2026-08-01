using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ClassroomGradingService : IClassroomGradingService
    {
        private readonly ApplicationDbContext _context;

        public ClassroomGradingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassStatsDto> GetClassStatisticsAsync(Guid classroomId, Guid teacherId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                .ThenInclude(e => e.Student)
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null || classroom.OwnerTeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Classroom not found or access denied.");
            }

            var activeStudents = classroom.Enrollments.Where(e => e.Status == EnrollmentStatus.Active).ToList();
            var studentIds = activeStudents.Select(e => e.StudentId).ToList();

            var result = new ClassStatsDto
            {
                TotalStudents = activeStudents.Count,
                StudentScores = new List<StudentScoreRow>(),
                QuizTitles = new Dictionary<Guid, string>(),
                CodelabTitles = new Dictionary<Guid, string>()
            };

            if (!classroom.CourseId.HasValue) return result;

            var moduleItems = await _context.ModuleItems
                .Include(m => m.Quiz)
                .Include(m => m.Codelab)
                .Where(m => m.Module.CourseId == classroom.CourseId)
                .ToListAsync();

            var quizItems = moduleItems.Where(m => m.ItemType == ModuleItemType.Quiz && m.QuizId.HasValue).ToList();
            var codelabItems = moduleItems.Where(m => m.ItemType == ModuleItemType.Codelab && m.CodelabId.HasValue).ToList();

            var quizIds = quizItems.Select(m => m.QuizId.Value).ToList();
            var codelabIds = codelabItems.Select(m => m.CodelabId.Value).ToList();
            
            
            var classroomQuizzes = await _context.Set<ClassroomQuiz>()
                .Include(cq => cq.Attempts)
                .Include(cq => cq.Quiz)
                .Where(cq => cq.ClassroomId == classroomId && !cq.IsArchived)
                .ToListAsync();

            foreach (var cq in classroomQuizzes)
            {
                if (!result.QuizTitles.ContainsKey(cq.QuizId))
                {
                    result.QuizTitles[cq.QuizId] = cq.Quiz?.Title ?? "Unknown Quiz";
                }
            }

            
            var codelabSubmissions = await _context.CodelabSubmissions
                .Where(s => codelabIds.Contains(s.CodelabId) && studentIds.Contains(s.UserId))
                .ToListAsync();

            foreach (var ci in codelabItems)
            {
                if (!result.CodelabTitles.ContainsKey(ci.CodelabId.Value))
                {
                    result.CodelabTitles[ci.CodelabId.Value] = ci.Codelab?.Title ?? "Unknown Codelab";
                }
            }

            int totalPassedAssignments = 0;
            int totalAssignmentsTaken = 0;
            int totalScores = 0;

            foreach (var student in activeStudents)
            {
                var row = new StudentScoreRow
                {
                    StudentId = student.StudentId,
                    Name = student.Student.Username ?? student.Student.Email,
                    TotalXP = student.Student.TotalXP
                };

                
                foreach (var cq in classroomQuizzes)
                {
                    var bestAttempt = cq.Attempts
                        .Where(a => a.StudentId == student.StudentId)
                        .OrderByDescending(a => a.Score)
                        .FirstOrDefault();

                    if (bestAttempt != null)
                    {
                        var pct = bestAttempt.MaxScore > 0 ? (int)((bestAttempt.Score * 100.0) / bestAttempt.MaxScore) : 0;
                        row.ScoresPerQuiz[cq.QuizId] = pct;
                        totalScores += pct;
                        totalAssignmentsTaken++;
                        if (pct >= 50) totalPassedAssignments++;
                    }
                    else
                    {
                        row.ScoresPerQuiz[cq.QuizId] = 0;
                    }
                }

                foreach (var ci in codelabItems)
                {
                    var bestSubmission = codelabSubmissions
                        .Where(s => s.UserId == student.StudentId && s.CodelabId == ci.CodelabId.Value)
                        .OrderByDescending(s => s.Score)
                        .FirstOrDefault();
                    
                    if (bestSubmission != null)
                    {
                        int pct = bestSubmission.Score;
                        row.ScoresPerCodelab[ci.CodelabId.Value] = pct;
                        totalScores += pct;
                        totalAssignmentsTaken++;
                        if (pct >= 50) totalPassedAssignments++;
                    }
                    else
                    {
                        row.ScoresPerCodelab[ci.CodelabId.Value] = 0;
                    }
                }
                
                result.StudentScores.Add(row);
            }

            if (totalAssignmentsTaken > 0)
            {
                result.AvgScore = Math.Round((double)totalScores / totalAssignmentsTaken, 2);
                result.PassRate = Math.Round((double)totalPassedAssignments * 100 / totalAssignmentsTaken, 2);
            }

            var allRequiredItems = await _context.ModuleItems
                .Where(m => m.Module.CourseId == classroom.CourseId && m.IsRequired)
                .CountAsync();

            if (activeStudents.Count > 0 && allRequiredItems > 0)
            {
                var allProgresses = await _context.UserModuleItemProgresses
                    .Where(p => studentIds.Contains(p.UserId) && p.Status == "Completed")
                    .CountAsync();

                result.CompletionRate = Math.Round((double)allProgresses / (activeStudents.Count * allRequiredItems), 2);
            }

            return result;
        }
    }
}
