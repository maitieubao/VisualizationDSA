using System;

namespace VisualizationDSA.Domain.Entities
{
    
    
    
    
    
    public class RefreshToken
    {
        public Guid     Id        { get; private set; }
        public string   Token     { get; private set; }  
        public Guid     UserId    { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public bool     IsRevoked { get; private set; }

        
        public virtual User User { get; private set; } = null!;

        private RefreshToken() { } 

        public RefreshToken(Guid userId, string token, DateTime expiresAt)
        {
            Id        = Guid.NewGuid();
            UserId    = userId;
            Token     = token;
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = expiresAt;
            IsRevoked = false;
        }

        
        public void Revoke() => IsRevoked = true;

        
        public bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow;
    }
}
