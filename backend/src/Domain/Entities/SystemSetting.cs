using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F7 (FR-6.2) — Cấu hình hệ thống:
    /// Key là khóa duy nhất (PK) — lưu dạng key-value để admin chỉnh sửa không cần restart.
    /// </summary>
    public class SystemSetting
    {
        public string Key { get; private set; } = string.Empty;
        public string Value { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        private SystemSetting() { }

        public SystemSetting(string key, string value, string? description = null, Guid? updatedBy = null)
        {
            Key = string.IsNullOrWhiteSpace(key)
                ? throw new ArgumentException("Key cannot be empty.", nameof(key))
                : key;
            Value = value ?? string.Empty;
            Description = description;
            UpdatedBy = updatedBy;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Update(string value, string? description, Guid? updatedBy)
        {
            Value = value ?? string.Empty;
            if (description != null)
            {
                Description = description;
            }
            UpdatedBy = updatedBy;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
