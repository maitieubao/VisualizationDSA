using System;
using System.IO;
using System.Threading.Tasks;
using ClosedXML.Excel;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ClassroomExcelExportService : IClassroomExcelExportService
    {
        private readonly IClassroomGradingService _gradingService;

        public ClassroomExcelExportService(IClassroomGradingService gradingService)
        {
            _gradingService = gradingService;
        }

        public async Task<byte[]> ExportClassReportAsync(Guid classroomId, Guid teacherId)
        {
            var stats = await _gradingService.GetClassStatisticsAsync(classroomId, teacherId);

            using var workbook = new XLWorkbook();
            
            
            var wsOverview = workbook.Worksheets.Add("Tổng quan");
            wsOverview.Cell(1, 1).Value = "Tổng số học sinh";
            wsOverview.Cell(1, 2).Value = stats.TotalStudents;
            wsOverview.Cell(2, 1).Value = "Điểm trung bình (%)";
            wsOverview.Cell(2, 2).Value = stats.AvgScore;
            wsOverview.Cell(3, 1).Value = "Tỉ lệ qua môn";
            wsOverview.Cell(3, 2).Value = stats.PassRate;
            wsOverview.Cell(4, 1).Value = "Tỉ lệ hoàn thành bài giảng (%)";
            wsOverview.Cell(4, 2).Value = stats.CompletionRate * 100;
            wsOverview.Columns().AdjustToContents();

            
            var wsDetail = workbook.Worksheets.Add("Bảng điểm chi tiết");
            wsDetail.Cell(1, 1).Value = "Mã HS";
            wsDetail.Cell(1, 2).Value = "Tên";
            wsDetail.Cell(1, 3).Value = "Tổng XP";

            if (stats.StudentScores.Count > 0)
            {
                var quizIds = stats.StudentScores[0].ScoresPerQuiz.Keys.ToList();
                for (int i = 0; i < quizIds.Count; i++)
                {
                    var quizTitle = stats.QuizTitles.TryGetValue(quizIds[i], out var t) ? t : $"Quiz {quizIds[i].ToString().Substring(0, 4)}";
                    wsDetail.Cell(1, 4 + i).Value = quizTitle;
                }

                for (int r = 0; r < stats.StudentScores.Count; r++)
                {
                    var row = stats.StudentScores[r];
                    wsDetail.Cell(r + 2, 1).Value = row.StudentId.ToString();
                    wsDetail.Cell(r + 2, 2).Value = row.Name;
                    wsDetail.Cell(r + 2, 3).Value = row.TotalXP;

                    for (int c = 0; c < quizIds.Count; c++)
                    {
                        var quizId = quizIds[c];
                        if (row.ScoresPerQuiz.TryGetValue(quizId, out var score))
                        {
                            wsDetail.Cell(r + 2, 4 + c).Value = score;
                        }
                    }
                }
            }
            wsDetail.Columns().AdjustToContents();

            
            if (stats.QuizTitles.Count > 0)
            {
                var wsQuiz = workbook.Worksheets.Add("Thống kê theo Quiz");
                wsQuiz.Cell(1, 1).Value = "Tên Quiz";
                wsQuiz.Cell(1, 2).Value = "Điểm trung bình (%)";
                wsQuiz.Cell(1, 3).Value = "Tỉ lệ đậu (%)";

                int rowIndex = 2;
                foreach (var quizId in stats.QuizTitles.Keys)
                {
                    wsQuiz.Cell(rowIndex, 1).Value = stats.QuizTitles[quizId];

                    
                    var scores = stats.StudentScores
                        .Where(s => s.ScoresPerQuiz.ContainsKey(quizId))
                        .Select(s => s.ScoresPerQuiz[quizId])
                        .ToList();

                    if (scores.Count > 0)
                    {
                        wsQuiz.Cell(rowIndex, 2).Value = Math.Round(scores.Average(), 2);
                        wsQuiz.Cell(rowIndex, 3).Value = "N/A"; 
                    }
                    else
                    {
                        wsQuiz.Cell(rowIndex, 2).Value = 0;
                        wsQuiz.Cell(rowIndex, 3).Value = 0;
                    }
                    rowIndex++;
                }
                wsQuiz.Columns().AdjustToContents();
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}
