using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Filters
{
    /// <summary>
    /// ActionFilter tập trung kiểm tra JWT token và role.
    /// Áp dụng ở class hoặc method level thay vì gọi JwtHelper thủ công trong mỗi action.
    /// 
    /// Ví dụ sử dụng:
    /// - [RequireJwtRole("Admin")]           → Chỉ Admin mới truy cập
    /// - [RequireJwtRole("Teacher,Admin")]   → Teacher hoặc Admin
    /// - [RequireJwtRole]                    → Chỉ yêu cầu có token hợp lệ (bất kỳ role nào)
    /// 
    /// ✅ PB-705: Centralized JWT authorization — không cần gọi JwtHelper.RequireToken() + IsAdmin() 
    ///    thủ công trong từng action method nữa, tránh bỏ sót gây lỗ hổng bảo mật.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireJwtRoleAttribute : ActionFilterAttribute
    {
        private readonly string[] _allowedRoles;

        /// <summary>
        /// Tạo filter yêu cầu JWT token hợp lệ.
        /// Nếu truyền roles (phân cách bằng dấu phẩy), chỉ cho phép các role được liệt kê.
        /// Nếu không truyền roles, chỉ yêu cầu token hợp lệ (bất kỳ role nào).
        /// </summary>
        /// <param name="roles">Danh sách role được phép, phân cách bằng dấu phẩy. Ví dụ: "Teacher,Admin"</param>
        public RequireJwtRoleAttribute(string? roles = null)
        {
            _allowedRoles = string.IsNullOrWhiteSpace(roles)
                ? Array.Empty<string>()
                : roles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Bước 1: Kiểm tra token hợp lệ (signature + expiration)
            var tokenResult = JwtHelper.RequireToken(context.HttpContext.Request);
            if (tokenResult != null)
            {
                context.Result = tokenResult;
                return;
            }

            // Bước 2: Kiểm tra trạng thái hoạt động (IsActive)
            var userIdStr = JwtHelper.ExtractSubFromToken(context.HttpContext.Request);
            if (userIdStr != null && Guid.TryParse(userIdStr, out var userId))
            {
                var unitOfWork = (IUnitOfWork?)context.HttpContext.RequestServices.GetService(typeof(IUnitOfWork));
                if (unitOfWork != null)
                {
                    var user = await unitOfWork.Users.GetByIdAsync(userId);
                    if (user != null && !user.IsActive)
                    {
                        context.Result = new ObjectResult(new
                        {
                            error = "FORBIDDEN",
                            message = "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động."
                        })
                        {
                            StatusCode = 403
                        };
                        return;
                    }
                }
            }

            // Bước 3: Kiểm tra role nếu có yêu cầu
            if (_allowedRoles.Length > 0)
            {
                var userRole = JwtHelper.ExtractRoleFromToken(context.HttpContext.Request);
                if (userRole == null || !_allowedRoles.Contains(userRole, StringComparer.OrdinalIgnoreCase))
                {
                    context.Result = new ObjectResult(new
                    {
                        error = "FORBIDDEN",
                        message = $"Yêu cầu quyền {string.Join(" hoặc ", _allowedRoles)} để truy cập tài nguyên này."
                    })
                    {
                        StatusCode = 403
                    };
                    return;
                }
            }

            await next();
        }
    }
}
