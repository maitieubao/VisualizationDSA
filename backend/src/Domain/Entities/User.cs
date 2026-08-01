using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class User
    {
        public Guid      Id             { get; private set; }
        public string    Email          { get; private set; } = string.Empty;
        public string    Username       { get; private set; } = string.Empty;
        public string    PasswordHash   { get; private set; } = string.Empty;
        public DateTime  CreatedAt      { get; private set; }
        public DateTime? LastLoginAt    { get; private set; }

        
        public int       TotalXP        { get; private set; }
        public int       CurrentLevel   { get; private set; }
        public int       StreakDays     { get; private set; }
        public bool      IsPremium      { get; private set; }
        public string    Role           { get; private set; } = "Student";

        
        
        
        
        public bool      IsActive       { get; private set; } = true;

        
        
        
        
        
        public DateTime? LastActivityDate { get; private set; }

        
        public virtual ICollection<UserBadge>         UserBadges         { get; private set; }
        public virtual ICollection<QuizAttempt>       QuizAttempts       { get; private set; }
        public virtual ICollection<LearningProgress>  LearningProgresses { get; private set; }
        public virtual ICollection<UserLessonProgress> UserLessonProgresses { get; private set; }

        private User() { } 

        public User(string email, string username, string passwordHash)
        {
            Id           = Guid.NewGuid();
            Email        = email;
            Username     = username;
            PasswordHash = passwordHash;
            CreatedAt    = DateTime.UtcNow;
            TotalXP      = 0;
            CurrentLevel = 1;
            StreakDays   = 0;
            IsPremium    = false;
            Role         = "Student";
            IsActive     = true;

            UserBadges         = new List<UserBadge>();
            QuizAttempts       = new List<QuizAttempt>();
            LearningProgresses = new List<LearningProgress>();
            UserLessonProgresses = new List<UserLessonProgress>();
        }

        public void AwardXP(int amount)
        {
            if (amount <= 0) return;
            TotalXP += amount;
            _checkLevelUp();
        }

        public void CompleteModule(string moduleId)
        {
            var progress = new LearningProgress(Id, moduleId);
            LearningProgresses.Add(progress);
        }

        public void RecordLogin()
        {
            LastLoginAt = DateTime.UtcNow;
        }

        
        
        
        
        public void RecordActivity()
        {
            _updateStreak();
            LastActivityDate = DateTime.UtcNow;
        }

        public void SetPremiumStatus(bool isPremium)
        {
            IsPremium = isPremium;
        }

        public void SetRole(string role)
        {
            if (role == "Student" || role == "Teacher" || role == "Admin")
                Role = role;
        }

        
        
        
        
        
        public void SetActiveStatus(bool isActive)
        {
            IsActive = isActive;
        }

        public void ChangePassword(string newPasswordHash)
        {
            if (!string.IsNullOrWhiteSpace(newPasswordHash))
                PasswordHash = newPasswordHash;
        }

        

        private void _checkLevelUp()
        {
            
            
            
            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };

            
            var newLevel = 1;
            for (var i = levelThresholds.Length - 1; i >= 0; i--)
            {
                if (TotalXP >= levelThresholds[i])
                {
                    newLevel = i + 1; 
                    break;
                }
            }

            if (newLevel > CurrentLevel)
            {
                CurrentLevel = newLevel;
            }
        }

        private void _updateStreak()
        {
            var today = DateTime.UtcNow.Date;

            if (LastActivityDate == null)
            {
                
                StreakDays = 1;
                return;
            }

            var lastDate = LastActivityDate.Value.Date;

            if (lastDate == today)
            {
                
                return;
            }
            else if (lastDate == today.AddDays(-1))
            {
                
                StreakDays++;
            }
            else
            {
                
                StreakDays = 1;
            }
        }
    }
}
