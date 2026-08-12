using System;
using System.Collections.Concurrent;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// GM-001/GM-004/GM-005: lớp chống XP farm + double-award dùng CHUNG cho /users/me/xp
    /// và /concepts/gamification/award-xp (copy cơ chế LM-006 từ StatelessAuthController:
    /// hạn mức XP/ngày/user + Idempotency-Key replay).
    /// </summary>
    public static class XpAwardGuard
    {
        /// <summary>Hạn mức XP/ngày/user — đồng bộ với XpAwardDailyCap của StatelessAuthController.</summary>
        public const int XpAwardDailyCap = 500;

        private sealed class XpDailyCounter
        {
            public string Day = string.Empty;
            public int Total;
        }

        private static readonly ConcurrentDictionary<string, XpDailyCounter> XpDailyCounters = new();

        /// <summary>
        /// Trừ hạn mức XP/ngày cho 1 owner (userId). Trả false nếu cấp thêm sẽ vượt cap → gọi 429.
        /// </summary>
        public static bool TryConsumeDailyQuota(string ownerKey, int amount)
        {
            if (amount <= 0) return true;

            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var counter = XpDailyCounters.GetOrAdd(ownerKey, _ => new XpDailyCounter());
            lock (counter)
            {
                if (counter.Day != today)
                {
                    counter.Day = today;
                    counter.Total = 0;
                }

                if (counter.Total + amount > XpAwardDailyCap)
                    return false;

                counter.Total += amount;
                return true;
            }
        }

        private sealed class IdempotentGrant
        {
            public string Day = string.Empty;
            public string Payload = string.Empty;
        }

        // GM-005: ledger idempotency cho stateless award-xp — (owner|ngày|Idempotency-Key) → payload phản hồi.
        private static readonly ConcurrentDictionary<string, IdempotentGrant> IdempotencyLedger = new();
        private const int IdempotencyLedgerMax = 50_000;

        /// <summary>Tra cứu replay của 1 Idempotency-Key. Trả false nếu chưa từng xử lý.</summary>
        public static bool TryGetReplay(string ledgerKey, out string? payload)
        {
            payload = null;
            if (string.IsNullOrWhiteSpace(ledgerKey))
                return false;

            if (!IdempotencyLedger.TryGetValue(ledgerKey, out var grant))
                return false;

            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            if (grant.Day != today)
                return false;

            payload = grant.Payload;
            return true;
        }

        public static void RecordGrant(string ledgerKey, string payload)
        {
            if (string.IsNullOrWhiteSpace(ledgerKey))
                return;

            PruneLedger();
            IdempotencyLedger[ledgerKey] = new IdempotentGrant
            {
                Day = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Payload = payload
            };
        }

        private static void PruneLedger()
        {
            if (IdempotencyLedger.Count < IdempotencyLedgerMax)
                return;

            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            foreach (var kvp in IdempotencyLedger)
            {
                if (kvp.Value.Day != today)
                    IdempotencyLedger.TryRemove(kvp.Key, out _);
            }
        }
    }
}
