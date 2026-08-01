using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.PracticeLadder;

namespace VisualizationDSA.Application.Services
{
    public interface IPracticeLadderService
    {
        Task<PracticeStatusDto> GetPracticeStatusAsync(Guid userId, string nodeId);
        Task<QuizSubmitResponseDto> SubmitQuizAsync(Guid userId, string nodeId, QuizSubmitRequestDto request);
        Task<LabSubmitResponseDto> SubmitLabAsync(Guid userId, string nodeId, LabSubmitRequestDto request);
        Task<LeetCodeSubmitResponseDto> SubmitLeetCodeAsync(Guid userId, string nodeId, LeetCodeSubmitRequestDto request);
        Task<HintResponseDto> GetHintAsync(Guid userId, string nodeId, HintRequestDto request);
    }
}
