using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs
{
    public class SubmitTeacherApplicationDto
    {
        [Required(ErrorMessage = "Tên trường là bắt buộc")]
        [MaxLength(200, ErrorMessage = "Tên trường tối đa 200 ký tự")]
        public string SchoolName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Link CV là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Link CV tối đa 500 ký tự")]
        public string CvUrl { get; set; } = string.Empty;

        [Required(ErrorMessage = "Lý do là bắt buộc")]
        [MinLength(50, ErrorMessage = "Lý do phải dài ít nhất 50 ký tự")]
        [MaxLength(1000, ErrorMessage = "Lý do tối đa 1000 ký tự")]
        public string Reason { get; set; } = string.Empty;
    }

    public class RejectTeacherApplicationDto
    {
        [Required(ErrorMessage = "Lý do từ chối là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Lý do từ chối tối đa 500 ký tự")]
        public string Reason { get; set; } = string.Empty;
    }

    public class TeacherApplicationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string SchoolName { get; set; } = string.Empty;
        public string CvUrl { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string? RejectReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public Guid? ReviewedBy { get; set; }
        public DateTime? CooldownUntil { get; set; }
    }
}
