using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Filters
{
    
    
    
    
    
    
    
    
    
    
    
    
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireJwtRoleAttribute : ActionFilterAttribute
    {
        private readonly string[] _allowedRoles;

        
        
        
        
        
        
        public RequireJwtRoleAttribute(string? roles = null)
        {
            _allowedRoles = string.IsNullOrWhiteSpace(roles)
                ? Array.Empty<string>()
                : roles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            
            var tokenResult = JwtHelper.RequireToken(context.HttpContext.Request);
            if (tokenResult != null)
            {
                context.Result = tokenResult;
                return;
            }

            
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
