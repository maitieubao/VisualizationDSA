using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Strategy sinh chuỗi frame mô phỏng kiến trúc hệ thống phân tán:
/// Round-Robin Load Balancer, Server Failover, DB Replication Lag.
/// Mỗi kịch bản sinh ra một chuỗi SystemDesignFrameDto tương ứng
/// với trạng thái nodes/packets/replications tại từng thời điểm.
/// </summary>
public class SystemDesignStrategy : IConceptStrategy
{
    public string ConceptId => "system-design";
    public string Name => "System Design & Distributed Architecture";
    public string Category => "SystemDesign";

    public List<string> SupportedScenarios => new()
    {
        "round-robin-lb",
        "server-failover",
        "db-replication",
        "full-demo"
    };

    // ── Topology mặc định ──

    private static List<SystemNodeDto> CreateDefaultTopology() => new()
    {
        new() { NodeId = "client-1", NodeType = "CLIENT", Label = "Client", Status = "HEALTHY", RequestCount = 0, PosX = 100, PosY = 200 },
        new() { NodeId = "lb-1", NodeType = "LOAD_BALANCER", Label = "Load Balancer", Status = "HEALTHY", RequestCount = 0, PosX = 300, PosY = 200 },
        new() { NodeId = "server-a", NodeType = "WEB_SERVER", Label = "Server A", Status = "HEALTHY", RequestCount = 0, PosX = 500, PosY = 100 },
        new() { NodeId = "server-b", NodeType = "WEB_SERVER", Label = "Server B", Status = "HEALTHY", RequestCount = 0, PosX = 500, PosY = 300 },
        new() { NodeId = "db-primary", NodeType = "POSTGRES_PRIMARY", Label = "Primary DB", Status = "HEALTHY", RequestCount = 0, PosX = 700, PosY = 150 },
        new() { NodeId = "db-replica", NodeType = "POSTGRES_REPLICA", Label = "Replica DB", Status = "HEALTHY", RequestCount = 0, PosX = 700, PosY = 300 }
    };

    private static List<NetworkLinkDto> CreateDefaultLinks() => new()
    {
        new() { LinkId = "link-client-lb", SourceId = "client-1", TargetId = "lb-1", LatencyMs = 10 },
        new() { LinkId = "link-lb-a", SourceId = "lb-1", TargetId = "server-a", LatencyMs = 20 },
        new() { LinkId = "link-lb-b", SourceId = "lb-1", TargetId = "server-b", LatencyMs = 20 },
        new() { LinkId = "link-a-db", SourceId = "server-a", TargetId = "db-primary", LatencyMs = 5 },
        new() { LinkId = "link-b-db", SourceId = "server-b", TargetId = "db-primary", LatencyMs = 5 },
        new() { LinkId = "link-db-replica", SourceId = "db-primary", TargetId = "db-replica", LatencyMs = 50 }
    };

    /// <summary>
    /// Sinh chuỗi frame mô phỏng cho kịch bản System Design được chỉ định.
    /// </summary>
    public List<SystemDesignFrameDto> ExecuteScenario(string scenarioId, CancellationToken cancellationToken = default)
    {
        return scenarioId.ToLowerInvariant() switch
        {
            "round-robin-lb" => GenerateRoundRobinFrames(cancellationToken),
            "server-failover" => GenerateFailoverFrames(cancellationToken),
            "db-replication" => GenerateReplicationFrames(cancellationToken),
            "full-demo" => GenerateFullDemoFrames(cancellationToken),
            _ => throw new ArgumentException($"Kịch bản System Design '{scenarioId}' không được hỗ trợ.")
        };
    }

    /// <summary>
    /// Sinh topology khởi tạo (khung kịch bản) cho frontend dựng cảnh ban đầu.
    /// </summary>
    public SystemDesignFrameDto GenerateInitialTopology()
    {
        return new SystemDesignFrameDto
        {
            StepId = 0,
            ActionType = "INITIALIZE",
            Explanation = "Khởi tạo topology phân tán: Client → LB → 2 Web Servers → Primary DB → Replica DB.",
            Nodes = CreateDefaultTopology(),
            Links = CreateDefaultLinks(),
            ActivePackets = new List<NetworkPacketDto>(),
            PendingReplications = new List<ReplicationJobDto>()
        };
    }

    // ══════════════════════════════════════════════
    // Round-Robin LB: Phân phối tải tuần tự
    // ══════════════════════════════════════════════

    private List<SystemDesignFrameDto> GenerateRoundRobinFrames(CancellationToken ct)
    {
        var frames = new List<SystemDesignFrameDto>();
        var nodes = CreateDefaultTopology();
        var links = CreateDefaultLinks();
        var packets = new List<NetworkPacketDto>();
        int step = 0;
        int packetCounter = 0;

        // Frame 1: Topology khởi tạo
        ct.ThrowIfCancellationRequested();
        frames.Add(SnapshotFrame(++step, "INITIALIZE", "Topology sẵn sàng. LB sẽ phân phối request luân phiên Server A → B → A → B.", nodes, links, packets));

        // Frame 2-5: Gửi 4 request luân phiên
        string[] targets = { "server-a", "server-b", "server-a", "server-b" };
        for (int i = 0; i < targets.Length; i++)
        {
            ct.ThrowIfCancellationRequested();
            string targetId = targets[i];
            var targetNode = nodes.First(n => n.NodeId == targetId);
            targetNode.RequestCount++;

            packets.Add(new NetworkPacketDto
            {
                PacketId = $"pkt-{++packetCounter}",
                SourceId = "lb-1",
                TargetId = targetId,
                Progress = 0.0,
                Status = "IN_TRANSIT",
                PacketColor = "#10B981"
            });

            frames.Add(SnapshotFrame(++step, "INJECT_REQUEST",
                $"LB route request #{i + 1} tới {targetNode.Label} (Round-Robin). {targetNode.Label} requestCount = {targetNode.RequestCount}.",
                nodes, links, packets));
        }

        // Frame 6-9: Packets arrive
        for (int i = packets.Count - 1; i >= 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            var pkt = packets[i];
            pkt.Progress = 1.0;
            pkt.Status = "ARRIVED";
            var targetNode = nodes.First(n => n.NodeId == pkt.TargetId);
            targetNode.RequestCount = Math.Max(0, targetNode.RequestCount - 1);

            frames.Add(SnapshotFrame(++step, "PACKET_ARRIVED",
                $"Packet {pkt.PacketId} đến {targetNode.Label}. requestCount giảm → {targetNode.RequestCount}.",
                nodes, links, packets));

            packets.RemoveAt(i);
        }

        return frames;
    }

    // ══════════════════════════════════════════════
    // Server Failover: Chuyển hướng khi server sập
    // ══════════════════════════════════════════════

    private List<SystemDesignFrameDto> GenerateFailoverFrames(CancellationToken ct)
    {
        var frames = new List<SystemDesignFrameDto>();
        var nodes = CreateDefaultTopology();
        var links = CreateDefaultLinks();
        var packets = new List<NetworkPacketDto>();
        int step = 0;
        int packetCounter = 0;

        // Frame 1: Topology
        ct.ThrowIfCancellationRequested();
        frames.Add(SnapshotFrame(++step, "INITIALIZE", "Topology sẵn sàng. Server A sẽ sập trong bước tiếp theo.", nodes, links, packets));

        // Frame 2: Gửi 2 request tới Server A
        var serverA = nodes.First(n => n.NodeId == "server-a");
        for (int i = 0; i < 2; i++)
        {
            serverA.RequestCount++;
            packets.Add(new NetworkPacketDto
            {
                PacketId = $"pkt-{++packetCounter}",
                SourceId = "lb-1",
                TargetId = "server-a",
                Progress = 0.3,
                Status = "IN_TRANSIT",
                PacketColor = "#10B981"
            });
        }
        ct.ThrowIfCancellationRequested();
        frames.Add(SnapshotFrame(++step, "INJECT_REQUEST", $"2 request đang được gửi tới Server A. requestCount = {serverA.RequestCount}.", nodes, links, packets));

        // Frame 3: Server A sập — packets bị DROPPED
        ct.ThrowIfCancellationRequested();
        serverA.Status = "FAILED";
        foreach (var pkt in packets.Where(p => p.TargetId == "server-a").ToList())
        {
            pkt.Status = "DROPPED";
            serverA.RequestCount = Math.Max(0, serverA.RequestCount - 1);
            packets.Remove(pkt);
        }
        frames.Add(SnapshotFrame(++step, "SERVER_FAILED",
            "Server A sập! Tất cả packet IN_TRANSIT bị DROPPED. requestCount reset về 0. Failover active — LB chuyển hướng tới Server B.",
            nodes, links, packets));

        // Frame 4-5: Request mới được route sang Server B
        var serverB = nodes.First(n => n.NodeId == "server-b");
        for (int i = 0; i < 2; i++)
        {
            ct.ThrowIfCancellationRequested();
            serverB.RequestCount++;
            packets.Add(new NetworkPacketDto
            {
                PacketId = $"pkt-{++packetCounter}",
                SourceId = "lb-1",
                TargetId = "server-b",
                Progress = 0.0,
                Status = "IN_TRANSIT",
                PacketColor = "#10B981"
            });
            frames.Add(SnapshotFrame(++step, "INJECT_REQUEST",
                $"LB route request mới tới Server B (failover). requestCount = {serverB.RequestCount}.",
                nodes, links, packets));
        }

        // Frame 6: Server A khôi phục
        ct.ThrowIfCancellationRequested();
        serverA.Status = "HEALTHY";
        frames.Add(SnapshotFrame(++step, "SERVER_RECOVERED",
            "Server A khôi phục! LB sẽ bắt đầu route request trở lại Server A trong chu kỳ round-robin tiếp theo.",
            nodes, links, packets));

        return frames;
    }

    // ══════════════════════════════════════════════
    // DB Replication: Sao chép dữ liệu Primary → Replica
    // ══════════════════════════════════════════════

    private List<SystemDesignFrameDto> GenerateReplicationFrames(CancellationToken ct)
    {
        var frames = new List<SystemDesignFrameDto>();
        var nodes = CreateDefaultTopology();
        var links = CreateDefaultLinks();
        var packets = new List<NetworkPacketDto>();
        var replications = new List<ReplicationJobDto>();
        int step = 0;

        // Frame 1: Topology
        ct.ThrowIfCancellationRequested();
        frames.Add(SnapshotFrame(++step, "INITIALIZE", "Topology sẵn sàng. DB Write sẽ ghi vào Primary DB rồi trigger replication.", nodes, links, packets, replications));

        // Frame 2: DB Write packet
        ct.ThrowIfCancellationRequested();
        packets.Add(new NetworkPacketDto
        {
            PacketId = "pkt-dbwrite-1",
            SourceId = "server-a",
            TargetId = "db-primary",
            Progress = 0.0,
            Status = "IN_TRANSIT",
            PacketColor = "#FBBF24"
        });
        frames.Add(SnapshotFrame(++step, "INJECT_REQUEST", "Server A gửi DB Write tới Primary DB.", nodes, links, packets, replications));

        // Frame 3: Write arrived → trigger replication
        ct.ThrowIfCancellationRequested();
        packets.Clear();
        replications.Add(new ReplicationJobDto
        {
            JobId = "repl-1",
            PrimaryId = "db-primary",
            ReplicaId = "db-replica",
            LagDurationMs = 1000,
            PacketColor = "#F59E0B"
        });
        frames.Add(SnapshotFrame(++step, "PACKET_ARRIVED",
            "DB Write đến Primary DB. Trigger replication job (lag = 1000ms) tới Replica DB.",
            nodes, links, packets, replications));

        // Frame 4: Replication packet sent
        ct.ThrowIfCancellationRequested();
        packets.Add(new NetworkPacketDto
        {
            PacketId = "pkt-repl-1",
            SourceId = "db-primary",
            TargetId = "db-replica",
            Progress = 0.0,
            Status = "IN_TRANSIT",
            PacketColor = "#F59E0B"
        });
        replications.Clear();
        frames.Add(SnapshotFrame(++step, "DB_REPLICATE",
            "Replication lag kết thúc. Gửi packet sao chép từ Primary DB → Replica DB.",
            nodes, links, packets));

        // Frame 5: Replication arrived
        ct.ThrowIfCancellationRequested();
        packets.Clear();
        frames.Add(SnapshotFrame(++step, "PACKET_ARRIVED",
            "Dữ liệu sao chép thành công tới Replica DB. Hai DB đã đồng bộ.",
            nodes, links, packets));

        return frames;
    }

    // ══════════════════════════════════════════════
    // Full Demo: Kết hợp tất cả kịch bản
    // ══════════════════════════════════════════════

    private List<SystemDesignFrameDto> GenerateFullDemoFrames(CancellationToken ct)
    {
        var allFrames = new List<SystemDesignFrameDto>();

        allFrames.AddRange(GenerateRoundRobinFrames(ct));
        allFrames.AddRange(GenerateFailoverFrames(ct));
        allFrames.AddRange(GenerateReplicationFrames(ct));

        // Re-index stepIds
        for (int i = 0; i < allFrames.Count; i++)
        {
            allFrames[i].StepId = i + 1;
        }

        return allFrames;
    }

    // ── Helpers ──

    private static SystemDesignFrameDto SnapshotFrame(
        int stepId,
        string actionType,
        string explanation,
        List<SystemNodeDto> nodes,
        List<NetworkLinkDto> links,
        List<NetworkPacketDto> packets,
        List<ReplicationJobDto>? replications = null)
    {
        return new SystemDesignFrameDto
        {
            StepId = stepId,
            ActionType = actionType,
            Explanation = explanation,
            Nodes = nodes.Select(n => new SystemNodeDto
            {
                NodeId = n.NodeId,
                NodeType = n.NodeType,
                Label = n.Label,
                Status = n.Status,
                RequestCount = n.RequestCount,
                PosX = n.PosX,
                PosY = n.PosY
            }).ToList(),
            Links = links.Select(l => new NetworkLinkDto
            {
                LinkId = l.LinkId,
                SourceId = l.SourceId,
                TargetId = l.TargetId,
                LatencyMs = l.LatencyMs
            }).ToList(),
            ActivePackets = packets.Select(p => new NetworkPacketDto
            {
                PacketId = p.PacketId,
                SourceId = p.SourceId,
                TargetId = p.TargetId,
                Progress = p.Progress,
                Status = p.Status,
                PacketColor = p.PacketColor
            }).ToList(),
            PendingReplications = replications?.Select(r => new ReplicationJobDto
            {
                JobId = r.JobId,
                PrimaryId = r.PrimaryId,
                ReplicaId = r.ReplicaId,
                LagDurationMs = r.LagDurationMs,
                PacketColor = r.PacketColor
            }).ToList() ?? new List<ReplicationJobDto>()
        };
    }
}
