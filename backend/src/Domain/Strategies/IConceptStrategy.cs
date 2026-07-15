using System.Threading;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Interface lõi cho các mô-đun trực quan hóa khái niệm (OOP, System Design).
/// Khác với IAlgorithmStrategy (nhận int[] đầu vào), IConceptStrategy nhận
/// chuỗi scenarioId hoặc cấu hình JSON và trả về danh sách frame tùy loại.
/// Tuân thủ Strategy Pattern + Open/Closed Principle (SOLID).
/// </summary>
public interface IConceptStrategy
{
    /// <summary>Mã định danh duy nhất của mô-đun khái niệm.</summary>
    string ConceptId { get; }

    /// <summary>Tên hiển thị đầy đủ.</summary>
    string Name { get; }

    /// <summary>Danh mục phân loại (ví dụ: "OOP", "SystemDesign").</summary>
    string Category { get; }

    /// <summary>Danh sách các kịch bản mà mô-đun hỗ trợ.</summary>
    List<string> SupportedScenarios { get; }
}
