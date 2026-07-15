namespace VisualizationDSA.Domain.Engine
{
    /// <summary>
    /// Stateless quiz data — seeded quiz bank for DSA/OOP/Architecture topics.
    /// No database required — serves pre-built quizzes directly from memory.
    /// </summary>
    public class StatelessQuizDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "medium";
        public int XpReward { get; set; }
        public List<StatelessQuestionDto> Questions { get; set; } = new();
    }

    public class StatelessQuestionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    public class StatelessQuizAttemptRequest
    {
        public string QuizId { get; set; } = string.Empty;
        public List<int> Answers { get; set; } = new();
    }

    public class StatelessQuizAttemptResult
    {
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool Passed { get; set; }
        public int XpAwarded { get; set; }
        public List<StatelessQuestionResult> QuestionResults { get; set; } = new();
    }

    public class StatelessQuestionResult
    {
        public string QuestionId { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    /// <summary>
    /// Stateless gamification profile — mock user progress for demo.
    /// </summary>
    public class StatelessUserProfile
    {
        public string UserId { get; set; } = "demo-user";
        public string Username { get; set; } = "VisualizationDSA Student";
        public int TotalXp { get; set; }
        public int CurrentLevel { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public int StreakDays { get; set; }
        public List<StatelessBadgeDto> EarnedBadges { get; set; } = new();
        public List<StatelessXpEvent> RecentActivity { get; set; } = new();
    }

    public class StatelessBadgeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string EarnedAt { get; set; } = string.Empty;
    }

    public class StatelessXpEvent
    {
        public string Type { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }

    public class StatelessLeaderboardEntry
    {
        public int Rank { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalXp { get; set; }
        public int Level { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public int BadgeCount { get; set; }
        public int StreakDays { get; set; }
    }
}
