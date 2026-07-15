using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class XPAwardRequestValidator : AbstractValidator<XPAwardRequest>
    {
        public XPAwardRequestValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Số lượng XP phải lớn hơn 0.")
                .LessThanOrEqualTo(10000).WithMessage("Số lượng XP cho một lần cộng tối đa là 10,000 XP.");

            RuleFor(x => x.Reason)
                .NotEmpty().WithMessage("Lý do cộng XP không được để trống.")
                .MaximumLength(200).WithMessage("Lý do không được dài quá 200 ký tự.");
        }
    }
}
