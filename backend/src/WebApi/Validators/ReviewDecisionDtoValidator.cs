using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class ReviewDecisionDtoValidator : AbstractValidator<ReviewDecisionDto>
    {
        public ReviewDecisionDtoValidator()
        {
            RuleFor(x => x.Feedback)
                .MaximumLength(2000).WithMessage("Phản hồi không được vượt quá 2000 ký tự.")
                .When(x => !string.IsNullOrEmpty(x.Feedback));
        }
    }
}
