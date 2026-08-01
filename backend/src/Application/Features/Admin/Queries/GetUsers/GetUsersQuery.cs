using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using System.Collections.Generic;
using System;

namespace VisualizationDSA.Application.Features.Admin.Queries.GetUsers
{
    public class GetUsersQuery : IRequest<GetUsersResult>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; } = string.Empty;
    }

    public class GetUsersResult
    {
        public List<UserDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, GetUsersResult>
    {
        private readonly IApplicationDbContext _context;

        public GetUsersQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetUsersResult> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchTerm = request.Search.ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(searchTerm) || u.Email.ToLower().Contains(searchTerm));
            }

            int totalCount = await query.CountAsync(cancellationToken);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    IsPremium = u.IsPremium,
                    TotalXP = u.TotalXP,
                    CurrentLevel = u.CurrentLevel,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new GetUsersResult
            {
                Items = users,
                TotalCount = totalCount
            };
        }
    }
}
