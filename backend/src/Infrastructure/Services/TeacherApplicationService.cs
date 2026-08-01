using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class TeacherApplicationService : ITeacherApplicationService
    {
        private readonly ApplicationDbContext _dbContext;

        public TeacherApplicationService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TeacherApplicationDto> SubmitApplicationAsync(Guid userId, SubmitTeacherApplicationDto dto)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new KeyNotFoundException("Không tìm thấy người dùng.");

            if (user.Role == "Teacher" || user.Role == "Admin")
                throw new InvalidOperationException("Bạn đã có quyền Teacher hoặc Admin.");

            var latestApplication = await _dbContext.TeacherApplications
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestApplication != null)
            {
                if (latestApplication.Status == "Pending")
                    throw new InvalidOperationException("Bạn đã có đơn đăng ký đang chờ xử lý.");

                if (latestApplication.Status == "Rejected" && latestApplication.ReviewedAt.HasValue)
                {
                    var cooldownUntil = latestApplication.ReviewedAt.Value.AddDays(30);
                    if (DateTime.UtcNow < cooldownUntil)
                        throw new InvalidOperationException($"Bạn cần đợi đến {cooldownUntil:dd/MM/yyyy HH:mm} để nộp đơn mới.");
                }
            }

            var application = new TeacherApplication(userId, dto.SchoolName, dto.CvUrl, dto.Reason);
            _dbContext.TeacherApplications.Add(application);

            user.SetTeacherAppStatus("Pending");

            await _dbContext.SaveChangesAsync();

            return MapToDto(application, user);
        }

        public async Task<TeacherApplicationDto?> GetMyApplicationAsync(Guid userId)
        {
            var application = await _dbContext.TeacherApplications
                .Include(a => a.User)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (application == null)
                return null;

            return MapToDto(application, application.User);
        }

        public async Task<IEnumerable<TeacherApplicationDto>> GetPendingApplicationsAsync(string? status = null)
        {
            var query = _dbContext.TeacherApplications.Include(a => a.User).AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            var applications = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
            return applications.Select(a => MapToDto(a, a.User)).ToList();
        }

        public async Task<TeacherApplicationDto> ApproveApplicationAsync(Guid applicationId, Guid adminId)
        {
            var application = await _dbContext.TeacherApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new KeyNotFoundException("Không tìm thấy đơn đăng ký.");

            if (application.Status != "Pending")
                throw new InvalidOperationException("Chỉ có thể duyệt đơn đang ở trạng thái Pending.");

            application.Approve(adminId);
            application.User.SetRole("Teacher");
            application.User.SetTeacherAppStatus("Approved");

            var notification = new Notification(
                application.UserId,
                "Đơn đăng ký Giáo viên của bạn đã được duyệt! Bạn hiện có thể truy cập Teacher Studio.",
                ""
            );
            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync();

            return MapToDto(application, application.User);
        }

        public async Task<TeacherApplicationDto> RejectApplicationAsync(Guid applicationId, Guid adminId, string rejectReason)
        {
            var application = await _dbContext.TeacherApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new KeyNotFoundException("Không tìm thấy đơn đăng ký.");

            if (application.Status != "Pending")
                throw new InvalidOperationException("Chỉ có thể từ chối đơn đang ở trạng thái Pending.");

            application.Reject(adminId, rejectReason);
            application.User.SetTeacherAppStatus("Rejected");

            var notification = new Notification(
                application.UserId,
                $"Đơn đăng ký Giáo viên của bạn đã bị từ chối. Lý do: {rejectReason}",
                ""
            );
            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync();

            return MapToDto(application, application.User);
        }

        private static TeacherApplicationDto MapToDto(TeacherApplication application, User user)
        {
            return new TeacherApplicationDto
            {
                Id = application.Id,
                UserId = application.UserId,
                UserName = user.Username,
                UserEmail = user.Email,
                SchoolName = application.SchoolName,
                CvUrl = application.CvUrl,
                Reason = application.Reason,
                Status = application.Status,
                RejectReason = application.RejectReason,
                CreatedAt = application.CreatedAt,
                ReviewedAt = application.ReviewedAt,
                ReviewedBy = application.ReviewedBy,
                CooldownUntil = application.Status == "Rejected" && application.ReviewedAt.HasValue
                    ? application.ReviewedAt.Value.AddDays(30)
                    : null
            };
        }
    }
}
