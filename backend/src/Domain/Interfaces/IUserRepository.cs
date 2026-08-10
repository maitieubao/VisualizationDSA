using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByIdWithDetailsAsync(Guid id, bool track = true);
        Task<IEnumerable<User>> GetTopUsersAsync(int limit);
        Task<int> GetUserRankAsync(Guid id);
        Task<UserProgressDomainModel?> GetUserProgressDomainModelAsync(Guid userId);
    }
}
