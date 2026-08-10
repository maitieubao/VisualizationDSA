using System;
using System.Collections.Generic;
using System.Linq;

namespace VisualizationDSA.Domain.Lectures;

public class LectureRepository
{
    private readonly List<Lecture> _lectures;

    public LectureRepository()
    {
        // Nguồn chân lý duy nhất cho kịch bản lecture hiện tại nằm ở frontend
        // (frontend/src/features/e-lecture/assets/lectures/*.json) để chạy offline.
        // Repository này đóng vai trò extension point cho lecture do server cung cấp
        // trong tương lai — KHÔNG seed dữ liệu trùng lặp với frontend (tránh drift).
        _lectures = new List<Lecture>();
    }

    public LectureRepository(List<Lecture> lectures)
    {
        _lectures = lectures ?? new List<Lecture>();
    }

    public Lecture? GetByAlgorithmId(string algorithmId)
    {
        return _lectures.FirstOrDefault(l =>
            l.AlgorithmId.Equals(algorithmId, StringComparison.OrdinalIgnoreCase));
    }

    public List<Lecture> GetAll()
    {
        return _lectures;
    }
}
