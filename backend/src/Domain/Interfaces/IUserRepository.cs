using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>Lấy thông tin User kèm eager load Progresses và Badges (đã map thực thể Badge)</summary>
        Task<User?> GetByIdWithDetailsAsync(Guid id, bool track = true);

        /// <summary>Lấy top N user theo TotalXP trực tiếp dưới DB (sắp xếp ở mức SQL)</summary>
        Task<IEnumerable<User>> GetTopUsersAsync(int limit);

        /// <summary>Tính toán xếp hạng của một User dựa vào Count lượng XP lớn hơn (chạy mức SQL, O(1) memory)</summary>
        Task<int> GetUserRankAsync(Guid id);

        /// <summary>Truy vấn tiến độ học tập tối ưu sử dụng Projection để tránh load toàn bộ object graph</summary>
        Task<UserProgressDomainModel?> GetUserProgressDomainModelAsync(Guid userId);
    }
}
