namespace VisualizationDSA.Domain.Engine;





public class SystemDesignFrameDto
{
    public int StepId { get; set; }
    public string ActionType { get; set; } = string.Empty;  
    public string Explanation { get; set; } = string.Empty;
    public List<SystemNodeDto> Nodes { get; set; } = new();
    public List<NetworkLinkDto> Links { get; set; } = new();
    public List<NetworkPacketDto> ActivePackets { get; set; } = new();
    public List<ReplicationJobDto> PendingReplications { get; set; } = new();
}





public class SystemNodeDto
{
    public string NodeId { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty;  
    public string Label { get; set; } = string.Empty;
    public string Status { get; set; } = "HEALTHY";  
    public int RequestCount { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
}





public class NetworkLinkDto
{
    public string LinkId { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public int LatencyMs { get; set; }
}





public class NetworkPacketDto
{
    public string PacketId { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public double Progress { get; set; }
    public string Status { get; set; } = "IN_TRANSIT";  
    public string PacketColor { get; set; } = string.Empty;
}





public class ReplicationJobDto
{
    public string JobId { get; set; } = string.Empty;
    public string PrimaryId { get; set; } = string.Empty;
    public string ReplicaId { get; set; } = string.Empty;
    public int LagDurationMs { get; set; }
    public string PacketColor { get; set; } = string.Empty;
}
