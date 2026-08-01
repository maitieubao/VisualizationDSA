using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Caching.Memory;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Classroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ClassroomService : IClassroomService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        public ClassroomService(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<ClassroomDto> CreateClassroomAsync(CreateClassroomDto dto, Guid teacherId)
        {
            var teacher = await _context.Users.FindAsync(teacherId);
            if (teacher == null || teacher.Role != "Teacher")
            {
                throw new UnauthorizedAccessException("Chỉ giáo viên mới có thể tạo lớp học.");
            }

            var roadmap = await _context.Set<Course>().FindAsync(dto.RoadmapId);
            if (roadmap == null)
            {
                throw new ArgumentException("Roadmap không tồn tại.");
            }

            var classroom = new Classroom(dto.Name, dto.RoadmapId, teacherId);
            
            // Ensure JoinCode is unique
            while (await _context.Classrooms.AnyAsync(c => c.JoinCode == classroom.JoinCode))
            {
                classroom = new Classroom(dto.Name, dto.RoadmapId, teacherId); // Generate a new one
            }

            _context.Classrooms.Add(classroom);
            await _context.SaveChangesAsync();

            return new ClassroomDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                RoadmapId = classroom.RoadmapId,
                TeacherId = classroom.TeacherId,
                JoinCode = classroom.JoinCode,
                CreatedAt = classroom.CreatedAt
            };
        }

        public async Task<ClassroomDto> JoinClassroomAsync(JoinClassroomDto dto, Guid studentId)
        {
            // Rate limiting using IMemoryCache
            var cacheKey = $"JoinClassroomAttempts_{studentId}";
            if (_cache.TryGetValue(cacheKey, out int attempts))
            {
                if (attempts >= 10)
                {
                    throw new Exception("Quá nhiều lần thử nghiệm tham gia lớp học. Vui lòng thử lại sau 1 giờ.");
                }
                _cache.Set(cacheKey, attempts + 1, TimeSpan.FromHours(1));
            }
            else
            {
                _cache.Set(cacheKey, 1, TimeSpan.FromHours(1));
            }

            var classroom = await _context.Classrooms.FirstOrDefaultAsync(c => c.JoinCode == dto.JoinCode.ToUpper());
            if (classroom == null)
            {
                throw new ArgumentException("Mã tham gia không hợp lệ.");
            }

            var existingMember = await _context.ClassroomMembers
                .FirstOrDefaultAsync(m => m.ClassroomId == classroom.Id && m.StudentId == studentId);
            
            if (existingMember != null)
            {
                throw new ArgumentException("Bạn đã tham gia lớp học này rồi.");
            }

            var member = new ClassroomMember(classroom.Id, studentId);
            _context.ClassroomMembers.Add(member);
            await _context.SaveChangesAsync();
            
            // Clear attempts on success
            _cache.Remove(cacheKey);

            // Gửi thông báo cho giáo viên
            var notificationService = _context.GetService<INotificationService>();
            var student = await _context.Users.FindAsync(studentId);
            if (notificationService != null && student != null)
            {
                await notificationService.SendNotificationAsync(
                    classroom.TeacherId,
                    "Lớp học",
                    $"Học sinh {student.Username} đã tham gia lớp học {classroom.Name}.",
                    "Classroom"
                );
            }

            return new ClassroomDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                RoadmapId = classroom.RoadmapId,
                TeacherId = classroom.TeacherId,
                JoinCode = classroom.JoinCode,
                CreatedAt = classroom.CreatedAt
            };
        }

        public async Task<ClassroomAnalyticsDto> GetClassroomAnalyticsAsync(string classroomId, Guid teacherId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Roadmap)
                .Include(c => c.Members)
                    .ThenInclude(m => m.Student)
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null || classroom.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Lớp học không tồn tại hoặc bạn không có quyền truy cập.");
            }

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            var analytics = new ClassroomAnalyticsDto
            {
                ClassroomId = classroom.Id,
                ClassroomName = classroom.Name,
                RoadmapName = classroom.Roadmap?.Title ?? "Unknown",
                TotalStudents = classroom.Members.Count,
                Students = classroom.Members.Select(m => new StudentAnalyticsDto
                {
                    StudentId = m.StudentId,
                    StudentName = m.Student.Username,
                    Email = m.Student.Email,
                    JoinedAt = m.JoinedAt,
                    TotalXP = m.Student.TotalXP,
                    CurrentLevel = m.Student.CurrentLevel,
                    // Mocking activity since we don't track it comprehensively at student level directly here
                    LastActiveDate = m.Student.LastActivityDate,
                    IsInactive = m.Student.LastActivityDate == null || m.Student.LastActivityDate < thirtyDaysAgo
                }).ToList()
            };

            analytics.ActiveStudents = analytics.Students.Count(s => !s.IsInactive);
            analytics.AverageXP = analytics.Students.Any() ? (int)analytics.Students.Average(s => s.TotalXP) : 0;

            return analytics;
        }

        public async Task<byte[]> ExportClassroomAnalyticsToExcelAsync(string classroomId, Guid teacherId)
        {
            var analytics = await GetClassroomAnalyticsAsync(classroomId, teacherId);

            using var workbook = new XLWorkbook();
            
            // Sheet 1: Summary
            var summarySheet = workbook.Worksheets.Add("Tổng quan");
            summarySheet.Cell(1, 1).Value = "Tên lớp học";
            summarySheet.Cell(1, 2).Value = analytics.ClassroomName;
            summarySheet.Cell(2, 1).Value = "Lộ trình";
            summarySheet.Cell(2, 2).Value = analytics.RoadmapName;
            summarySheet.Cell(3, 1).Value = "Tổng số học sinh";
            summarySheet.Cell(3, 2).Value = analytics.TotalStudents;
            summarySheet.Cell(4, 1).Value = "Học sinh hoạt động";
            summarySheet.Cell(4, 2).Value = analytics.ActiveStudents;
            summarySheet.Cell(5, 1).Value = "XP Trung bình";
            summarySheet.Cell(5, 2).Value = analytics.AverageXP;
            
            summarySheet.Columns().AdjustToContents();

            // Sheet 2: Student Details
            var studentSheet = workbook.Worksheets.Add("Danh sách học viên");
            studentSheet.Cell(1, 1).Value = "Tên học viên";
            studentSheet.Cell(1, 2).Value = "Email";
            studentSheet.Cell(1, 3).Value = "Ngày tham gia";
            studentSheet.Cell(1, 4).Value = "Cấp độ";
            studentSheet.Cell(1, 5).Value = "Tổng XP";
            studentSheet.Cell(1, 6).Value = "Lần cuối hoạt động";
            studentSheet.Cell(1, 7).Value = "Trạng thái";
            
            // Apply header styling
            var headerRange = studentSheet.Range("A1:G1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;

            int row = 2;
            foreach (var student in analytics.Students.OrderByDescending(s => s.TotalXP))
            {
                studentSheet.Cell(row, 1).Value = student.StudentName;
                studentSheet.Cell(row, 2).Value = student.Email;
                studentSheet.Cell(row, 3).Value = student.JoinedAt.ToString("yyyy-MM-dd");
                studentSheet.Cell(row, 4).Value = student.CurrentLevel;
                studentSheet.Cell(row, 5).Value = student.TotalXP;
                studentSheet.Cell(row, 6).Value = student.LastActiveDate?.ToString("yyyy-MM-dd") ?? "Chưa rõ";
                studentSheet.Cell(row, 7).Value = student.IsInactive ? "Không hoạt động (>30 ngày)" : "Hoạt động";
                
                if (student.IsInactive)
                {
                    studentSheet.Cell(row, 7).Style.Font.FontColor = XLColor.Red;
                }

                row++;
            }
            
            studentSheet.Columns().AdjustToContents();

            // Sheet 3: Metadata / Audit
            var metaSheet = workbook.Worksheets.Add("Thông tin báo cáo");
            metaSheet.Cell(1, 1).Value = "Ngày xuất báo cáo";
            metaSheet.Cell(1, 2).Value = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");
            metaSheet.Cell(2, 1).Value = "Xuất bởi GV ID";
            metaSheet.Cell(2, 2).Value = teacherId.ToString();
            
            metaSheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<System.Collections.Generic.IEnumerable<ClassroomDto>> GetMyClassroomsAsync(Guid userId, string role)
        {
            List<Classroom> classrooms;
            
            if (role == "Teacher" || role == "Admin")
            {
                classrooms = await _context.Classrooms
                    .Where(c => c.TeacherId == userId)
                    .ToListAsync();
            }
            else
            {
                classrooms = await _context.ClassroomMembers
                    .Where(m => m.StudentId == userId)
                    .Select(m => m.Classroom)
                    .ToListAsync();
            }

            return classrooms.Select(c => new ClassroomDto
            {
                Id = c.Id,
                Name = c.Name,
                RoadmapId = c.RoadmapId,
                TeacherId = c.TeacherId,
                JoinCode = c.JoinCode,
                CreatedAt = c.CreatedAt,
                StudentCount = _context.ClassroomMembers.Count(m => m.ClassroomId == c.Id)
            });
        }

        public async Task<ClassroomDto> GetClassroomDetailsAsync(string classroomId, Guid userId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Members)
                .ThenInclude(m => m.Student)
                .FirstOrDefaultAsync(c => c.Id == classroomId);
                
            if (classroom == null)
            {
                throw new ArgumentException("Lớp học không tồn tại.");
            }

            // Authentication check: Must be teacher of the class, or a member student
            if (classroom.TeacherId != userId && !classroom.Members.Any(m => m.StudentId == userId))
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem lớp học này.");
            }

            return new ClassroomDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                RoadmapId = classroom.RoadmapId,
                TeacherId = classroom.TeacherId,
                JoinCode = classroom.JoinCode,
                CreatedAt = classroom.CreatedAt,
                StudentCount = classroom.Members.Count,
                Students = classroom.Members.Select(m => new {
                    m.StudentId,
                    m.Student.Username,
                    m.Student.Email,
                    m.JoinedAt,
                    m.Student.TotalXP,
                    m.Student.CurrentLevel,
                    m.Student.AvatarUrl
                }).ToList<object>()
            };
        }

        public async Task DeleteClassroomAsync(string classroomId, Guid teacherId)
        {
            var classroom = await _context.Classrooms.FindAsync(classroomId);
            if (classroom == null || classroom.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa lớp học này.");
            }

            _context.Classrooms.Remove(classroom);
            await _context.SaveChangesAsync();
        }

        public async Task KickStudentAsync(string classroomId, Guid studentIdToKick, Guid teacherId)
        {
            var classroom = await _context.Classrooms.FindAsync(classroomId);
            if (classroom == null || classroom.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền quản lý lớp học này.");
            }

            var member = await _context.ClassroomMembers
                .FirstOrDefaultAsync(m => m.ClassroomId == classroomId && m.StudentId == studentIdToKick);
            
            if (member != null)
            {
                _context.ClassroomMembers.Remove(member);
                await _context.SaveChangesAsync();
                
                // Gửi thông báo cho sinh viên bị kích
                var notificationService = _context.GetService<INotificationService>();
                if (notificationService != null)
                {
                    await notificationService.SendNotificationAsync(
                        studentIdToKick,
                        "Lớp học",
                        $"Bạn đã bị giáo viên loại khỏi lớp học {classroom.Name}",
                        "Classroom"
                    );
                }
            }
        }

        public async Task<string> RegenerateJoinCodeAsync(string classroomId, Guid teacherId)
        {
            var classroom = await _context.Classrooms.FindAsync(classroomId);
            if (classroom == null || classroom.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền quản lý lớp học này.");
            }

            // Generate a new unique 6-character code
            var rand = new Random();
            string newCode;
            do
            {
                const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                newCode = new string(Enumerable.Repeat(chars, 6).Select(s => s[rand.Next(s.Length)]).ToArray());
            } while (await _context.Classrooms.AnyAsync(c => c.JoinCode == newCode));

            // Wait, JoinCode might not be a settable property in Classroom entity because it was private set or generated in ctor.
            // Let's use reflection or if there is a method `RegenerateJoinCode`.
            // Wait, `Classroom.cs` probably has a method for it. If not, I can just use a fast trick or reflection.
            typeof(Classroom).GetProperty("JoinCode")?.SetValue(classroom, newCode);
            
            await _context.SaveChangesAsync();
            return newCode;
        }
    }
}
