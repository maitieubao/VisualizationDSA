using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace VisualizationDSA.WebApi.Hubs
{
    [Authorize]
    public class QuizRoomHub : Hub
    {
        private static readonly ConcurrentDictionary<string, QuizRoomState> Rooms = new();

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await SendActiveRoomsToClient();
        }

        public async Task CreateRoom(string quizId)
        {
            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();
            var roomCode = GenerateRoomCode();

            var room = new QuizRoomState
            {
                RoomCode = roomCode,
                QuizId = quizId,
                QuizTitle = GetQuizTitle(quizId),
                HostUserId = userId,
                HostUsername = username,
                Status = "Waiting",
                CurrentQuestionIndex = -1,
                TotalQuestions = GetQuizQuestionCount(quizId)
            };

            room.Participants.Add(new ParticipantState
            {
                UserId = userId,
                Username = username,
                Score = 0,
                HasAnswered = false,
                IsHost = true,
                ConnectionId = Context.ConnectionId
            });

            Rooms[roomCode] = room;

            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("RoomCreated", GetRoomDto(room));
            await BroadcastActiveRooms();
        }

        public async Task JoinRoom(string roomCode)
        {
            roomCode = roomCode.Trim().ToUpperInvariant();
            if (!Rooms.TryGetValue(roomCode, out var room))
            {
                await Clients.Caller.SendAsync("JoinFailed", "Không tìm thấy phòng thi này.");
                return;
            }

            if (room.Status != "Waiting")
            {
                await Clients.Caller.SendAsync("JoinFailed", "Phòng thi đã bắt đầu hoặc đã kết thúc.");
                return;
            }

            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();

            
            var participant = room.Participants.FirstOrDefault(p => p.UserId == userId);
            if (participant == null)
            {
                room.Participants.Add(new ParticipantState
                {
                    UserId = userId,
                    Username = username,
                    Score = 0,
                    HasAnswered = false,
                    IsHost = false,
                    ConnectionId = Context.ConnectionId
                });
            }
            else
            {
                participant.ConnectionId = Context.ConnectionId; 
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Group(roomCode).SendAsync("ParticipantJoined", GetRoomDto(room));
            await BroadcastActiveRooms();
        }

        public async Task LeaveRoom(string roomCode)
        {
            roomCode = roomCode.Trim().ToUpperInvariant();
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                var userId = GetCurrentUserId();
                var participant = room.Participants.FirstOrDefault(p => p.UserId == userId);
                if (participant != null)
                {
                    room.Participants.Remove(participant);
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);

                    if (room.Participants.Count == 0 || room.HostUserId == userId)
                    {
                        
                        Rooms.TryRemove(roomCode, out _);
                    }
                    else
                    {
                        await Clients.Group(roomCode).SendAsync("ParticipantLeft", GetRoomDto(room));
                    }
                }
            }
            await Clients.Caller.SendAsync("ParticipantLeft", (object)null!);
            await BroadcastActiveRooms();
        }

        public async Task StartQuiz(string roomCode)
        {
            roomCode = roomCode.Trim().ToUpperInvariant();
            if (!Rooms.TryGetValue(roomCode, out var room)) return;

            var userId = GetCurrentUserId();
            if (room.HostUserId != userId)
            {
                await Clients.Caller.SendAsync("StartFailed", "Chỉ chủ phòng mới có quyền bắt đầu.");
                return;
            }

            room.Status = "InProgress";
            room.CurrentQuestionIndex = 0;

            await Clients.Group(roomCode).SendAsync("QuizStarted", GetRoomDto(room));
            await BroadcastActiveRooms();
            await SendQuestion(room);
        }

        public async Task SubmitAnswer(string roomCode, int questionIndex, int answerIndex)
        {
            roomCode = roomCode.Trim().ToUpperInvariant();
            if (!Rooms.TryGetValue(roomCode, out var room)) return;
            if (room.Status != "InProgress" || room.CurrentQuestionIndex != questionIndex) return;

            var userId = GetCurrentUserId();
            var participant = room.Participants.FirstOrDefault(p => p.UserId == userId);
            if (participant == null || participant.HasAnswered) return;

            
            var isCorrect = IsAnswerCorrect(room.QuizId, questionIndex, answerIndex);
            var points = isCorrect ? 100 : 0;
            
            participant.Score += points;
            participant.HasAnswered = true;

            await Clients.Group(roomCode).SendAsync("AnswerResult", new
            {
                UserId = userId,
                Username = participant.Username,
                IsCorrect = isCorrect,
                PointsEarned = points,
                TotalScore = participant.Score,
                CorrectIndex = GetCorrectAnswerIndex(room.QuizId, questionIndex),
                Explanation = GetExplanation(room.QuizId, questionIndex)
            });

            await Clients.Group(roomCode).SendAsync("ScoreUpdate", room.Participants.Select(p => new
            {
                p.UserId,
                p.Username,
                p.Score,
                p.HasAnswered,
                p.IsHost
            }));

            
            if (room.Participants.All(p => p.HasAnswered))
            {
                if (room.CurrentQuestionIndex >= room.TotalQuestions - 1)
                {
                    await CompleteQuiz(room);
                }
            }
        }

        public async Task NextQuestion(string roomCode)
        {
            roomCode = roomCode.Trim().ToUpperInvariant();
            if (!Rooms.TryGetValue(roomCode, out var room)) return;
            if (room.Status != "InProgress") return;

            var userId = GetCurrentUserId();
            if (room.HostUserId != userId) return;

            if (room.CurrentQuestionIndex < room.TotalQuestions - 1)
            {
                room.CurrentQuestionIndex++;
                foreach (var p in room.Participants)
                {
                    p.HasAnswered = false;
                }
                await SendQuestion(room);
            }
            else
            {
                await CompleteQuiz(room);
            }
        }

        public async Task GetActiveRooms()
        {
            await SendActiveRoomsToClient();
        }

        private async Task SendQuestion(QuizRoomState room)
        {
            var questions = GetQuizQuestions(room.QuizId);
            if (room.CurrentQuestionIndex >= 0 && room.CurrentQuestionIndex < questions.Count)
            {
                var q = questions[room.CurrentQuestionIndex];
                await Clients.Group(room.RoomCode).SendAsync("NewQuestion", new
                {
                    QuestionIndex = room.CurrentQuestionIndex,
                    TotalQuestions = room.TotalQuestions,
                    Question = q.Text,
                    Options = q.Options,
                    TimeLimitSeconds = 30
                });
            }
        }

        private async Task CompleteQuiz(QuizRoomState room)
        {
            room.Status = "Completed";
            var rankings = room.Participants.OrderByDescending(p => p.Score).ToList();

            await Clients.Group(room.RoomCode).SendAsync("QuizCompleted", new
            {
                RoomCode = room.RoomCode,
                QuizTitle = room.QuizTitle,
                FinalRankings = rankings.Select(p => new { p.UserId, p.Username, p.Score, p.IsHost }),
                XpAwarded = 50 
            });

            await BroadcastActiveRooms();
        }

        private async Task BroadcastActiveRooms()
        {
            var active = Rooms.Values
                .Where(r => r.Status == "Waiting")
                .Select(GetRoomDto)
                .ToList();

            await Clients.All.SendAsync("ActiveRooms", active);
        }

        private async Task SendActiveRoomsToClient()
        {
            var active = Rooms.Values
                .Where(r => r.Status == "Waiting")
                .Select(GetRoomDto)
                .ToList();

            await Clients.Caller.SendAsync("ActiveRooms", active);
        }

        private string GetCurrentUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier) ?? Context.User?.FindFirst("sub");
            return claim?.Value ?? "anonymous";
        }

        private string GetCurrentUsername()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.Name) ?? Context.User?.FindFirst("name");
            return claim?.Value ?? "Học viên " + GenerateRoomCode();
        }

        private static string GenerateRoomCode()
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private object GetRoomDto(QuizRoomState room)
        {
            return new
            {
                RoomCode = room.RoomCode,
                QuizTitle = room.QuizTitle,
                QuizId = room.QuizId,
                HostUsername = room.HostUsername,
                Status = room.Status,
                CurrentQuestionIndex = room.CurrentQuestionIndex,
                TotalQuestions = room.TotalQuestions,
                Participants = room.Participants.Select(p => new
                {
                    p.UserId,
                    p.Username,
                    p.Score,
                    p.HasAnswered,
                    p.IsHost
                }).ToList()
            };
        }

        
        private string GetQuizTitle(string quizId)
        {
            return quizId switch
            {
                "sorting-fundamentals" => "Cơ bản về Sắp xếp",
                "graph-traversal" => "Duyệt Đồ thị BFS & DFS",
                "oop-pillars" => "4 Trụ cột OOP",
                "solid-principles" => "Nguyên lý SOLID",
                "design-patterns" => "Mẫu Thiết kế Kinh điển",
                _ => "Trắc nghiệm tổng hợp"
            };
        }

        private int GetQuizQuestionCount(string quizId) => GetQuizQuestions(quizId).Count;

        private List<MockQuestion> GetQuizQuestions(string quizId)
        {
            
            if (quizId == "sorting-fundamentals")
            {
                return new List<MockQuestion>
                {
                    new("Bubble Sort có độ phức tạp thời gian trung bình là gì?", new() { "O(n)", "O(n log n)", "O(n²)", "O(log n)" }, 2, "Bubble Sort so sánh từng cặp liền kề, O(n²)."),
                    new("Thuật toán sắp xếp nào KHÔNG phải là so sánh?", new() { "Merge Sort", "Quick Sort", "Counting Sort", "Heap Sort" }, 2, "Counting sort không so sánh."),
                    new("Quick Sort chọn pivot để làm gì?", new() { "Tìm phần tử lớn nhất", "Chia mảng thành 2 phần", "Sắp xếp mảng con trái", "Đếm" }, 1, "Pivot phân hoạch mảng.")
                };
            }
            return new List<MockQuestion>
            {
                new("Encapsulation có nghĩa là gì?", new() { "Kế thừa", "Ẩn dữ liệu nội bộ", "Đa hình", "Trừu tượng" }, 1, "Encapsulation bảo vệ trạng thái nội bộ.")
            };
        }

        private bool IsAnswerCorrect(string quizId, int questionIdx, int answerIdx)
        {
            var questions = GetQuizQuestions(quizId);
            if (questionIdx >= 0 && questionIdx < questions.Count)
            {
                return questions[questionIdx].CorrectIndex == answerIdx;
            }
            return false;
        }

        private int GetCorrectAnswerIndex(string quizId, int questionIdx)
        {
            var questions = GetQuizQuestions(quizId);
            return (questionIdx >= 0 && questionIdx < questions.Count) ? questions[questionIdx].CorrectIndex : 0;
        }

        private string GetExplanation(string quizId, int questionIdx)
        {
            var questions = GetQuizQuestions(quizId);
            return (questionIdx >= 0 && questionIdx < questions.Count) ? questions[questionIdx].Explanation : "";
        }

        private class MockQuestion
        {
            public string Text { get; }
            public List<string> Options { get; }
            public int CorrectIndex { get; }
            public string Explanation { get; }

            public MockQuestion(string text, List<string> options, int correctIndex, string explanation)
            {
                Text = text;
                Options = options;
                CorrectIndex = correctIndex;
                Explanation = explanation;
            }
        }

        private class QuizRoomState
        {
            public string RoomCode { get; set; } = string.Empty;
            public string QuizTitle { get; set; } = string.Empty;
            public string QuizId { get; set; } = string.Empty;
            public string HostUserId { get; set; } = string.Empty;
            public string HostUsername { get; set; } = string.Empty;
            public string Status { get; set; } = "Waiting";
            public int CurrentQuestionIndex { get; set; } = -1;
            public int TotalQuestions { get; set; }
            public List<ParticipantState> Participants { get; } = new();
        }

        private class ParticipantState
        {
            public string UserId { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public int Score { get; set; }
            public bool HasAnswered { get; set; }
            public bool IsHost { get; set; }
            public string ConnectionId { get; set; } = string.Empty;
        }
    }
}
