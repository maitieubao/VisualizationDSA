namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Snapshot một bước trong mô phỏng System Design.
/// Chứa trạng thái tất cả nodes, links, và packets tại thời điểm hiện tại.
/// </summary>
public class SystemDesignFrameDto
{
    public int StepId { get; set; }
    public string ActionType { get; set; } = string.Empty;  // "INJECT_REQUEST" | "PACKET_ARRIVED" | "PACKET_DROPPED" | "SERVER_FAILED" | "SERVER_RECOVERED" | "DB_REPLICATE"
    public string Explanation { get; set; } = string.Empty;
    public List<SystemNodeDto> Nodes { get; set; } = new();
    public List<NetworkLinkDto> Links { get; set; } = new();
    public List<NetworkPacketDto> ActivePackets { get; set; } = new();
    public List<ReplicationJobDto> PendingReplications { get; set; } = new();
}

/// <summary>
/// Một node trong kiến trúc phân tán: Client, LB, Server, DB.
/// Tương ứng 1:1 với frontend SystemNode interface.
/// </summary>
public class SystemNodeDto
{
    public string NodeId { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty;  // "CLIENT" | "LOAD_BALANCER" | "WEB_SERVER" | "REDIS_CACHE" | "POSTGRES_PRIMARY" | "POSTGRES_REPLICA"
    public string Label { get; set; } = string.Empty;
    public string Status { get; set; } = "HEALTHY";  // "HEALTHY" | "OVERLOADED" | "FAILED"
    public int RequestCount { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
}

/// <summary>
/// Kết nối mạng giữa hai nodes với độ trễ (latency).
/// Tương ứng với frontend NetworkLink interface.
/// </summary>
public class NetworkLinkDto
{
    public string LinkId { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public int LatencyMs { get; set; }
}

/// <summary>
/// Gói tin mạng di chuyển giữa hai nodes với tiến độ và trạng thái.
/// Tương ứng với frontend NetworkPacket interface.
/// </summary>
public class NetworkPacketDto
{
    public string PacketId { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public double Progress { get; set; }
    public string Status { get; set; } = "IN_TRANSIT";  // "IN_TRANSIT" | "ARRIVED" | "DROPPED"
    public string PacketColor { get; set; } = string.Empty;
}

/// <summary>
/// Tác vụ sao chép dữ liệu giữa Primary DB và Replica DB.
/// Tương ứng với frontend ReplicationJob interface.
/// </summary>
public class ReplicationJobDto
{
    public string JobId { get; set; } = string.Empty;
    public string PrimaryId { get; set; } = string.Empty;
    public string ReplicaId { get; set; } = string.Empty;
    public int LagDurationMs { get; set; }
    public string PacketColor { get; set; } = string.Empty;
}
