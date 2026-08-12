using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom
{
    public class JoinClassroomCommandHandler : IRequestHandler<JoinClassroomCommand, ClassroomResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public JoinClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomResponseDto> Handle(JoinClassroomCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                .Include(c => c.OwnerTeacher)
                .FirstOrDefaultAsync(c => c.InviteCode == request.InviteCode && !c.IsArchived, cancellationToken);

            if (classroom == null)
            {
                throw new ArgumentException("Invalid or expired invite code.");
            }

            // Chặn code đã hết hạn (trước đây bỏ qua InviteCodeExpiresAt → code hết hạn vẫn join được).
            if (classroom.InviteCodeExpiresAt.HasValue && classroom.InviteCodeExpiresAt.Value < DateTime.UtcNow)
            {
                throw new ArgumentException("Invalid or expired invite code.");
            }

            var student = await _context.Users.FindAsync(new object[] { request.StudentId }, cancellationToken);
            if (student == null)
            {
                throw new ArgumentException("User not found.");
            }

            // Học viên ĐÃ BỊ KICK/BANNED: không được rejoin (CR-014 — kick = cấm quay lại lớp;
            // unique index (ClassroomId, StudentId) chặn Add trùng nên chỉ còn đường tạo mới không khả thi).
            var existing = classroom.Enrollments.FirstOrDefault(e => e.StudentId == request.StudentId);
            if (existing != null)
            {
                if (existing.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active)
                {
                    throw new InvalidOperationException("Already enrolled in this classroom.");
                }
                if (existing.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Kicked ||
                    existing.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Banned)
                {
                    throw new InvalidOperationException("Bạn đã bị xóa khỏi lớp học này và không thể tham gia lại.");
                }

                // Left → reactivate (học viên tự rời lớp được quay lại).
                existing.Reactivate();
                await _context.SaveChangesAsync(cancellationToken);

                return new ClassroomResponseDto
                {
                    Id = classroom.Id,
                    Name = classroom.Name,
                    Description = classroom.Description,
                    InviteCode = null,
                    CreatedAt = classroom.CreatedAt,
                    OwnerTeacherName = classroom.OwnerTeacher?.Username ?? classroom.OwnerTeacher?.Email ?? "Unknown",
                    StudentCount = classroom.Enrollments.Count(e => e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active)
                };
            }

            // Enforce sức chứa tối đa (nếu được cấu hình).
            var activeCount = classroom.Enrollments.Count(e => e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);
            if (classroom.MaxEnrollmentCapacity.HasValue && activeCount >= classroom.MaxEnrollmentCapacity.Value)
            {
                throw new InvalidOperationException("Classroom đã đạt số lượng học viên tối đa.");
            }

            var enrollment = new ClassroomEnrollment(classroom.Id, request.StudentId);
            _context.ClassroomEnrollments.Add(enrollment);
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Race 2 request join cùng lúc — unique index (ClassroomId, StudentId) chặn bản trùng.
                throw new InvalidOperationException("Already enrolled in this classroom.");
            }

            return new ClassroomResponseDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                Description = classroom.Description,
                InviteCode = null,
                CreatedAt = classroom.CreatedAt,
                OwnerTeacherName = classroom.OwnerTeacher?.Username ?? classroom.OwnerTeacher?.Email ?? "Unknown",
                StudentCount = activeCount + 1
            };
        }
    }
}
