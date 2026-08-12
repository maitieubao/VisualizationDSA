using System.Linq;
using FluentAssertions;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.WebApi.Validators;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Validators;

// CR-001: validator phải đồng bộ với generator mã mời (6 ký tự ngẫu nhiên [A-Z0-9]) —
// regex cũ ^DSA-\d{4}-[A-Z0-9]{6}$ chặn MỌI code thật → join luôn 400.
public class JoinClassroomDtoValidatorTests
{
    private readonly JoinClassroomDtoValidator _validator = new();

    [Fact]
    public void Validate_AcceptsRealGeneratorCode_Uppercase()
    {
        // Generator tạo mã 6 ký tự từ bảng chữ cái A-Z0-9.
        var result = _validator.Validate(new JoinClassroomDto { InviteCode = "ABC123" });
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_AcceptsLowercaseInput_ControllerNormalizes()
    {
        // Controller gọi ToUpperInvariant() — validator phải chấp nhận chữ thường.
        var result = _validator.Validate(new JoinClassroomDto { InviteCode = "abc123" });
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_RejectsOldDsaPrefixFormat()
    {
        // Định dạng legacy DSA-2024-ABC123 không còn tồn tại.
        var result = _validator.Validate(new JoinClassroomDto { InviteCode = "DSA-2024-ABC123" });
        result.IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("AB12")]        // 4 ký tự
    [InlineData("ABCD123")]     // 7 ký tự
    [InlineData("AB-C12")]      // có ký tự đặc biệt
    [InlineData("AB C12")]
    public void Validate_RejectsMalformedCodes(string code)
    {
        var result = _validator.Validate(new JoinClassroomDto { InviteCode = code });
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_RealCodeFromGenerator_Contract()
    {
        // Mô phỏng chuỗi code thật sinh bởi CreateClassroomCommandHandler
        // (6 ký tự ngẫu nhiên A-Z0-9, chạy nhiều lần để bắt contract).
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new System.Random(42);
        for (int i = 0; i < 50; i++)
        {
            var code = new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
            _validator.Validate(new JoinClassroomDto { InviteCode = code }).IsValid.Should().BeTrue($"code {code} phải hợp lệ");
        }
    }
}
