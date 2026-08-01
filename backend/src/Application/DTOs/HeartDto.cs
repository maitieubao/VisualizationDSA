using System;

namespace VisualizationDSA.Application.DTOs
{
    public class HeartStatusDto
    {
        public int       Hearts               { get; set; }
        public int       MaxHearts            { get; set; }
        public int?      NextHeartInSeconds   { get; set; }
        public DateTime? LastHeartUsedAt      { get; set; }
        public bool      IsRecovering         { get; set; }
        public int       AdsWatchedToday      { get; set; }
        public int       AdsMaxPerDay         { get; set; } = 5;
    }

    public class WatchAdResponseDto
    {
        public int  Hearts                   { get; set; }
        public int  MaxHearts                { get; set; }
        public int  AdsWatchedToday          { get; set; }
        public int  AdsRemainingToday        { get; set; }
        public int? NextAdAvailableInSeconds { get; set; }
    }

    public class OutOfHeartsErrorDto
    {
        public string                   Error        { get; set; } = "OUT_OF_HEARTS";
        public HeartRecoveryInfoDto     RecoveryInfo { get; set; } = new();
    }

    public class HeartRecoveryInfoDto
    {
        public int       HeartRecoverySeconds { get; set; }
        public DateTime? NextHeartAt          { get; set; }
        public int       AdsWatchedToday      { get; set; }
        public int       AdsMaxPerDay         { get; set; } = 5;
    }
}
