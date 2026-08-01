using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.TeacherStudio;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class TeacherStudioService : ITeacherStudioService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRoadmapAuditService _auditService;
        private readonly IMemoryCache _cache;

        public TeacherStudioService(ApplicationDbContext context, IRoadmapAuditService auditService, IMemoryCache cache)
        {
            _context = context;
            _auditService = auditService;
            _cache = cache;
        }

        private CustomRoadmapDto MapToDto(CustomRoadmap entity)
        {
            return new CustomRoadmapDto
            {
                Id = entity.Id,
                TeacherId = entity.TeacherId,
                Name = entity.Name,
                Description = entity.Description,
                Tags = entity.Tags,
                ThumbnailUrl = entity.ThumbnailUrl,
                Visibility = entity.Visibility,
                Status = entity.Status,
                AdminRejectReason = entity.AdminRejectReason,
                CreatedAt = entity.CreatedAt,
                Nodes = entity.Nodes.OrderBy(n => n.SortOrder).Select(MapNodeToDto).ToList()
            };
        }

        private CustomNodeDto MapNodeToDto(CustomNode entity)
        {
            return new CustomNodeDto
            {
                Id = entity.Id,
                RoadmapId = entity.RoadmapId,
                Name = entity.Name,
                Description = entity.Description,
                Difficulty = entity.Difficulty,
                ContentJson = entity.ContentJson,
                VideoUrl = entity.VideoUrl,
                VisualizerId = entity.VisualizerId,
                QuizId = entity.QuizId,
                LabId = entity.LabId,
                LeetCodeId = entity.LeetCodeId,
                SortOrder = entity.SortOrder,
                IsComplete = entity.IsComplete,
                OfficialApproach = entity.OfficialApproach,
                OfficialSolution = entity.OfficialSolution,
                ComplexityNote = entity.ComplexityNote
            };
        }

        public async Task<CustomRoadmapDto> CreateRoadmapAsync(Guid teacherId, CreateRoadmapDto dto)
        {
            var roadmap = new CustomRoadmap(
                teacherId, dto.Name, dto.Description, dto.Tags, dto.ThumbnailUrl, dto.Visibility
            );
            _context.CustomRoadmaps.Add(roadmap);
            await _context.SaveChangesAsync(default);
            return MapToDto(roadmap);
        }

        public async Task<CustomRoadmapDto> GetRoadmapAsync(Guid id)
        {
            var roadmap = await _context.CustomRoadmaps
                .Include(r => r.Nodes)
                .FirstOrDefaultAsync(r => r.Id == id);
            
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            return MapToDto(roadmap);
        }

        public async Task<List<CustomRoadmapDto>> GetMyRoadmapsAsync(Guid teacherId)
        {
            var roadmaps = await _context.CustomRoadmaps
                .Include(r => r.Nodes)
                .Where(r => r.TeacherId == teacherId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            return roadmaps.Select(MapToDto).ToList();
        }

        public async Task<List<CustomRoadmapDto>> GetPendingRoadmapsAsync()
        {
            var roadmaps = await _context.CustomRoadmaps
                .Include(r => r.Nodes)
                .Where(r => r.Status == "Pending")
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();
            return roadmaps.Select(MapToDto).ToList();
        }

        public async Task<CustomRoadmapDto> UpdateRoadmapAsync(Guid id, Guid teacherId, UpdateRoadmapDto dto)
        {
            var roadmap = await _context.CustomRoadmaps.Include(r => r.Nodes).FirstOrDefaultAsync(r => r.Id == id);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            roadmap.UpdateDetails(dto.Name, dto.Description, dto.Tags, dto.ThumbnailUrl, dto.Visibility);
            await _context.SaveChangesAsync(default);

            if (roadmap.Status == "Published")
                await _auditService.LogEditAsync(roadmap.Id, teacherId, "ContentUpdate", "Updated roadmap details");

            return MapToDto(roadmap);
        }

        public async Task DeleteRoadmapAsync(Guid id, Guid teacherId)
        {
            var roadmap = await _context.CustomRoadmaps.FirstOrDefaultAsync(r => r.Id == id);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();
            if (roadmap.Status != "Draft" && roadmap.Status != "Rejected") 
                throw new InvalidOperationException("Can only delete Draft or Rejected roadmaps");

            _context.CustomRoadmaps.Remove(roadmap);
            await _context.SaveChangesAsync(default);
        }

        public async Task<CustomNodeDto> AddNodeAsync(Guid roadmapId, Guid teacherId, CreateNodeDto dto)
        {
            var roadmap = await _context.CustomRoadmaps.FirstOrDefaultAsync(r => r.Id == roadmapId);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            var node = new CustomNode(roadmapId, dto.Name, dto.Description, dto.Difficulty, dto.SortOrder);
            _context.CustomNodes.Add(node);
            await _context.SaveChangesAsync(default);

            if (roadmap.Status == "Published")
                await _auditService.LogEditAsync(roadmap.Id, teacherId, "NodeAdd", $"Added node: {node.Name}");

            return MapNodeToDto(node);
        }

        public async Task<CustomNodeDto> UpdateNodeContentAsync(Guid roadmapId, Guid nodeId, Guid teacherId, UpdateNodeContentDto dto)
        {
            var node = await _context.CustomNodes.Include(n => n.Roadmap).FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);
            if (node == null) throw new KeyNotFoundException("Node not found");
            if (node.Roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            node.UpdateContent(dto.ContentJson, dto.VideoUrl, dto.VisualizerId);
            await _context.SaveChangesAsync(default);

            if (node.Roadmap.Status == "Published")
                await _auditService.LogEditAsync(roadmapId, teacherId, "ContentUpdate", $"Updated content for node: {node.Name}");

            return MapNodeToDto(node);
        }

        public async Task<CustomNodeDto> UpdateNodePracticeAsync(Guid roadmapId, Guid nodeId, Guid teacherId, UpdateNodePracticeDto dto)
        {
            var node = await _context.CustomNodes.Include(n => n.Roadmap).FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);
            if (node == null) throw new KeyNotFoundException("Node not found");
            if (node.Roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            node.UpdatePractice(dto.QuizId, dto.LabId, dto.LeetCodeId);
            await _context.SaveChangesAsync(default);

            if (node.Roadmap.Status == "Published")
                await _auditService.LogEditAsync(roadmapId, teacherId, "QuizUpdate", $"Updated practice for node: {node.Name}");

            return MapNodeToDto(node);
        }

        public async Task DeleteNodeAsync(Guid roadmapId, Guid nodeId, Guid teacherId)
        {
            var node = await _context.CustomNodes.Include(n => n.Roadmap).FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);
            if (node == null) throw new KeyNotFoundException("Node not found");
            if (node.Roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            _context.CustomNodes.Remove(node);
            await _context.SaveChangesAsync(default);

            if (node.Roadmap.Status == "Published")
                await _auditService.LogEditAsync(roadmapId, teacherId, "NodeDelete", $"Deleted node: {node.Name}");
        }

        public async Task<CustomRoadmapDto> PublishRoadmapAsync(Guid id, Guid teacherId, PublishRoadmapDto dto)
        {
            var roadmap = await _context.CustomRoadmaps.Include(r => r.Nodes).FirstOrDefaultAsync(r => r.Id == id);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.TeacherId != teacherId) throw new UnauthorizedAccessException();

            if (roadmap.Nodes.Count == 0)
                throw new InvalidOperationException("Roadmap must have at least 1 node to be published.");

            var incompleteNodes = roadmap.Nodes.Where(n => !n.IsComplete).ToList();
            if (incompleteNodes.Any())
            {
                var details = string.Join(", ", incompleteNodes.Select(n => $"Node {n.Name} thiếu Practice (Quiz, Lab, LeetCode)."));
                throw new InvalidOperationException($"INCOMPLETE_NODES: {details}");
            }

            roadmap.Publish(dto.Visibility);
            await _context.SaveChangesAsync(default);
            return MapToDto(roadmap);
        }

        public async Task<CustomRoadmapDto> ApproveRoadmapAsync(Guid id, Guid adminId)
        {
            var roadmap = await _context.CustomRoadmaps.Include(r => r.Nodes).FirstOrDefaultAsync(r => r.Id == id);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.Status != "Pending") throw new InvalidOperationException("Roadmap is not pending.");

            roadmap.Approve();
            await _context.SaveChangesAsync(default);
            return MapToDto(roadmap);
        }

        public async Task<CustomRoadmapDto> RejectRoadmapAsync(Guid id, Guid adminId, RejectRoadmapDto dto)
        {
            var roadmap = await _context.CustomRoadmaps.Include(r => r.Nodes).FirstOrDefaultAsync(r => r.Id == id);
            if (roadmap == null) throw new KeyNotFoundException("Roadmap not found");
            if (roadmap.Status != "Pending") throw new InvalidOperationException("Roadmap is not pending.");

            roadmap.Reject(dto.Reason);
            await _context.SaveChangesAsync(default);
            return MapToDto(roadmap);
        }

        public async Task<CustomRoadmapDto> CloneRoadmapAsync(Guid sourceId, Guid teacherId)
        {
            string cacheKey = $"clone_limit_{teacherId}_{DateTime.UtcNow:yyyyMMdd}";
            _cache.TryGetValue(cacheKey, out int clonesToday);

            if (clonesToday >= 5)
                throw new InvalidOperationException("You have reached the limit of 5 clones per day.");

            var sourceRoadmap = await _context.CustomRoadmaps
                .Include(r => r.Nodes)
                .FirstOrDefaultAsync(r => r.Id == sourceId);

            if (sourceRoadmap == null) throw new KeyNotFoundException("Source roadmap not found");

            // Allow cloning Public roadmaps or your own roadmaps
            if (sourceRoadmap.Visibility != "Public" && sourceRoadmap.TeacherId != teacherId)
                throw new UnauthorizedAccessException("Cannot clone this roadmap.");

            var clonedRoadmap = new CustomRoadmap(
                teacherId,
                $"{sourceRoadmap.Name} (Clone)",
                sourceRoadmap.Description,
                sourceRoadmap.Tags,
                sourceRoadmap.ThumbnailUrl,
                "Private" // Cloned roadmap is always private draft initially
            );

            // Reflection-like assignment for internal state
            var forkedFromIdProp = typeof(CustomRoadmap).GetProperty("ForkedFromId");
            forkedFromIdProp?.SetValue(clonedRoadmap, sourceRoadmap.Id);
            
            var forkedFromNameProp = typeof(CustomRoadmap).GetProperty("ForkedFromName");
            forkedFromNameProp?.SetValue(clonedRoadmap, sourceRoadmap.Name);

            _context.CustomRoadmaps.Add(clonedRoadmap);
            await _context.SaveChangesAsync(default); // Save to get the clonedRoadmap.Id

            foreach (var node in sourceRoadmap.Nodes)
            {
                var clonedNode = new CustomNode(
                    clonedRoadmap.Id,
                    node.Name,
                    node.Description,
                    node.Difficulty,
                    node.SortOrder
                );
                
                clonedNode.UpdateContent(node.ContentJson, node.VideoUrl, node.VisualizerId);
                clonedNode.UpdatePractice(node.QuizId, node.LabId, node.LeetCodeId);
                clonedNode.SetApproach(node.OfficialApproach ?? "", node.OfficialSolution ?? "", node.ComplexityNote ?? "");

                _context.CustomNodes.Add(clonedNode);
            }

            await _context.SaveChangesAsync(default);

            _cache.Set(cacheKey, clonesToday + 1, TimeSpan.FromDays(1));

            return MapToDto(clonedRoadmap);
        }
    }
}
