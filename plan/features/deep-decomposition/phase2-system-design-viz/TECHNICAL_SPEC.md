# 🛠 Technical Specification - System Design Engine & Dynamic Packet Router

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ mô phỏng mạng phân tán **SystemDesignEngine**, thuật toán định tuyến Load Balancer tròn (Round-Robin), giải thuật quản lý hàng đợi Replication Lag DB và hệ vật lý khói sương sập nguồn Canvas 2D.

---

## 1. Trình Điều Phối Định Tuyến Mạng (SystemDesignEngine TS Core)

Lõi mô phỏng mạng được thiết lập bằng TypeScript chặt chẽ, sử dụng mô hình sự kiện phi tập trung:

```typescript
export interface SystemNode {
  nodeId: string;
  nodeType: 'CLIENT' | 'LOAD_BALANCER' | 'WEB_SERVER' | 'REDIS_CACHE' | 'POSTGRES_PRIMARY' | 'POSTGRES_REPLICA';
  label: string;
  status: 'HEALTHY' | 'OVERLOADED' | 'FAILED';
  requestCount: number;
}

export interface NetworkLink {
  linkId: string;
  sourceId: string;
  targetId: string;
  latencyMs: number;
}

export interface NetworkPacket {
  packetId: string;
  sourceId: string;
  targetId: string;
  progress: number; // 0.0 -> 1.0
  status: 'IN_TRANSIT' | 'ARRIVED' | 'DROPPED';
  packetColor: string; // hsl Neon color palette
}

export class SystemDesignEngine {
  private nodes: Map<string, SystemNode> = new Map();
  private links: NetworkLink[] = [];
  private packets: NetworkPacket[] = [];
  private lbActiveIndex = 0;

  public registerNode(node: SystemNode): void {
    this.nodes.set(node.nodeId, node);
  }

  public registerLink(link: NetworkLink): void {
    this.links.push(link);
  }

  /**
   * Phóng hạt Neon gói tin từ Load Balancer sang các server khỏe mạnh (Round-Robin + Failover)
   */
  public routeRequestFromLB(lbId: string, packetColor: string): NetworkPacket | null {
    const lbNode = this.nodes.get(lbId);
    if (!lbNode) return null;

    // Lọc danh sách các Web Server kết nối trực tiếp với Load Balancer và khỏe mạnh
    const connectedHealthyServers = this.links
      .filter(l => l.sourceId === lbId)
      .map(l => this.nodes.get(l.targetId)!)
      .filter(n => n && n.nodeType === 'WEB_SERVER' && n.status !== 'FAILED');

    if (connectedHealthyServers.length === 0) {
      // 100% sập sập hệ thống -> Gói tin bị drop rơi tự do
      return null;
    }

    // Thuật toán chia luồng Round-Robin xoay vòng
    const targetServer = connectedHealthyServers[this.lbActiveIndex % connectedHealthyServers.length];
    this.lbActiveIndex = (this.lbActiveIndex + 1) % connectedHealthyServers.length;

    const newPacket: NetworkPacket = {
      packetId: `packet-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: lbId,
      targetId: targetServer.nodeId,
      progress: 0,
      status: 'IN_TRANSIT',
      packetColor
    };

    this.packets.push(newPacket);
    targetServer.requestCount++;
    return newPacket;
  }

  public updatePacketsProgress(deltaTime: number): void {
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      if (p.status === 'IN_TRANSIT') {
        p.progress += deltaTime * 0.05; // Tốc độ di chuyển
        if (p.progress >= 1.0) {
          p.progress = 1.0;
          p.status = 'ARRIVED';
          this.packets.splice(i, 1); // Về đích tháo dỡ RAM GC
        }
      }
    }
  }

  public getPackets(): NetworkPacket[] {
    return this.packets;
  }
}
```

---

## 2. Giải thuật Đồng bộ Database Replication Lag (Replication Queue)

Khi Primary DB nhận được lệnh ghi (Write Command):
*   **Bước 1: Bừng sáng Primary Node:** Nhận hạt vàng Neon rực rỡ ghi xuống ổ đĩa ảo.
*   **Bước 2: Nạp vào Hàng đợi Replication Queue:**
    ```typescript
    public triggerReplication(
      primaryId: string,
      replicaId: string,
      lagDurationMs: number,
      onSyncComplete: () => void
    ) {
      // Giả lập trễ trễ sync truyền hạt
      setTimeout(() => {
        // Sau đúng lagDurationMs mới phóng hạt Neon đồng bộ bừng sáng bên Replica
        onSyncComplete();
      }, lagDurationMs);
    }
    ```

---

## 3. Hệ thống hạt Sương mù khói bụi sập nguồn Canvas 2D (Failure Smoke Math)

Khi một Node máy chủ sập nguồn (`status === 'FAILED'`):
*   **Canvas khói bụi:** Canvas lồng phía sau card phun luồng khói xám cuồn cuộn 60 FPS.
*   **Vật lý khói:** Hạt khói sinh ra lan tỏa tròn đều $\theta = \text{random}(0, 2\pi)$ co giãn nở rộng rồi nhạt màu dần:
    $$s = s_0 + \text{rate} \times t$$
    $$\text{alpha} = 1 - \frac{t}{\text{life}}$$
    *   *Màu khói:* `rgba(100, 100, 110, alpha)` xám đen mờ mờ.
