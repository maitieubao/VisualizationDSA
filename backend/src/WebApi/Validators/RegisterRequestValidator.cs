using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Định dạng email không hợp lệ.")
                .MaximumLength(255).WithMessage("Email không được vượt quá 255 ký tự.");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username không được để trống.")
                .MinimumLength(3).WithMessage("Username phải có ít nhất 3 ký tự.")
                .MaximumLength(100).WithMessage("Username không được vượt quá 100 ký tự.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MinimumLength(8).WithMessage("Mật khẩu phải có ít nhất 8 ký tự.");
        }
    }
}
