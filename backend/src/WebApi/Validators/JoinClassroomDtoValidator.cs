using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class JoinClassroomDtoValidator : AbstractValidator<JoinClassroomDto>
    {
        public JoinClassroomDtoValidator()
        {
            RuleFor(x => x.InviteCode)
                .NotEmpty().WithMessage("Mã mời không được để trống.")
                // CR-001: đồng bộ với generator (6 ký tự ngẫu nhiên A-Z0-9). Chấp nhận cả
                // chữ thường — controller chuẩn hóa ToUpperInvariant() trước khi join.
                .Matches(@"^[A-Za-z0-9]{6}$").WithMessage("Mã mời phải gồm đúng 6 ký tự chữ hoặc số.")
                .MaximumLength(6).WithMessage("Mã mời không được vượt quá 6 ký tự.");
        }
    }
}
