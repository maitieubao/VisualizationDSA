using System.Collections.Generic;
using System.Linq;

namespace VisualizationDSA.Domain.Lectures;

/// <summary>
/// In-memory repository chứa kịch bản bài giảng mẫu.
/// Phase 1: hardcoded seed data. Phase 2+: đọc từ DB/file.
/// </summary>
public static class LectureRepository
{
    private static readonly List<Lecture> Lectures = new()
    {
        new Lecture
        {
            LectureId = "bubble-sort-intro-101",
            AlgorithmId = "bubble-sort",
            Title = "Bubble Sort - Sắp xếp Nổi bọt từ Cơ bản đến Thành thạo",
            Slides = new List<Slide>
            {
                new()
                {
                    SlideId = 1,
                    Type = "theory",
                    Content = "<h3>Bubble Sort là gì?</h3><p><b>Bubble Sort</b> (Sắp xếp Nổi bọt) là giải thuật sắp xếp đơn giản nhất. Nguyên lý hoạt động: duyệt qua mảng nhiều lần, mỗi lần so sánh hai phần tử liền kề và hoán đổi nếu chúng sai thứ tự.</p><p><b>Độ phức tạp:</b> O(n²) thời gian | O(1) không gian bổ sung.</p>",
                    Action = new SlideAction { Command = "RESET_CANVAS", TargetFrame = 0 }
                },
                new()
                {
                    SlideId = 2,
                    Type = "guided-animation",
                    Content = "<p>Hãy quan sát lượt duyệt đầu tiên: giải thuật so sánh từng cặp phần tử liền kề <b>(tô màu vàng cam)</b> và hoán đổi nếu cần <b>(tô màu đỏ)</b>.</p>",
                    Action = new SlideAction { Command = "PLAY_UNTIL", TargetFrame = 8 }
                },
                new()
                {
                    SlideId = 3,
                    Type = "interactive-check",
                    Content = "<p>Sau lượt duyệt đầu tiên, phần tử <b>lớn nhất</b> đã được đẩy về vị trí cuối cùng <b>(tô màu xanh lá)</b>. Mỗi lượt duyệt sẽ đưa đúng một phần tử lớn nhất còn lại về vị trí đúng.</p>",
                    Action = new SlideAction { Command = "PAUSE", TargetFrame = 8 }
                },
                new()
                {
                    SlideId = 4,
                    Type = "guided-animation",
                    Content = "<p>Tiếp tục quan sát: giải thuật lặp lại quá trình so sánh và hoán đổi cho phần còn lại của mảng. Mỗi lượt duyệt, vùng chưa sắp xếp thu hẹp lại.</p>",
                    Action = new SlideAction { Command = "PLAY_UNTIL", TargetFrame = 18 }
                },
                new()
                {
                    SlideId = 5,
                    Type = "theory",
                    Content = "<h3>Tổng kết Bubble Sort</h3><p>Bạn đã thấy cách Bubble Sort hoạt động: mỗi lượt duyệt đẩy phần tử lớn nhất về cuối, cần tối đa N-1 lượt cho N phần tử.</p><p>Nhấn <b>Thoát Bài giảng</b> để tự do khám phá!</p>",
                    Action = new SlideAction { Command = "PAUSE", TargetFrame = 18 }
                }
            }
        }
    };

    public static Lecture? GetByAlgorithmId(string algorithmId)
    {
        return Lectures.FirstOrDefault(l =>
            l.AlgorithmId.Equals(algorithmId, System.StringComparison.OrdinalIgnoreCase));
    }

    public static List<Lecture> GetAll()
    {
        return Lectures;
    }
}
