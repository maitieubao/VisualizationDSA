using System;
using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Validators
{
    public class CreateClassroomDtoValidator : AbstractValidator<CreateClassroomDto>
    {
        public CreateClassroomDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Length(3, 200).WithMessage("Name must be between 3 and 200 characters.");
            
            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
        }
    }

    public class JoinClassroomDtoValidator : AbstractValidator<JoinClassroomDto>
    {
        public JoinClassroomDtoValidator()
        {
            RuleFor(x => x.InviteCode)
                .NotEmpty().WithMessage("Invite code is required.")
                .Matches(@"^DSA-\d{4}-[A-Z0-9]{6}$").WithMessage("Invite code must be in format DSA-YYYY-XXXXXX");
        }
    }

    public class PublishToClassroomDtoValidator : AbstractValidator<PublishToClassroomDto>
    {
        public PublishToClassroomDtoValidator()
        {
            RuleFor(x => x.ClassroomId)
                .NotEmpty().WithMessage("ClassroomId is required.");
                
            RuleFor(x => x.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("OrderIndex must be >= 0.");
                
            RuleFor(x => x.UnlockAt)
                .GreaterThan(DateTime.UtcNow).WithMessage("UnlockAt must be in the future.");
        }
    }

    
    public class UpdateClassroomDtoValidator : AbstractValidator<UpdateClassroomDto>
    {
        public UpdateClassroomDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Length(3, 200).WithMessage("Name must be between 3 and 200 characters.");
            
            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
        }
    }

    public class UpdateClassroomLessonDtoValidator : AbstractValidator<UpdateClassroomLessonDto>
    {
        public UpdateClassroomLessonDtoValidator()
        {
            RuleFor(x => x.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("OrderIndex must be >= 0.");
                
            RuleFor(x => x.UnlockAt)
                .GreaterThan(DateTime.UtcNow).WithMessage("UnlockAt must be in the future.");
        }
    }
}
