# ⚙️ Technical Specification - System Design & Failover Smoke (Sprint 11)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình mô phỏng kiến trúc hệ thống **SystemDesignEngine** phân phối tải, đồng bộ trễ và máy phun hạt bụi khói sập nguồn Canvas **FailureSmokeEmitterEngine** trong Sprint 11.

---

## 1. Trình Điều Phối Phân Phối Tải & Trễ Đồng Bộ (SystemDesignEngine TS)

Lớp hạt nhân chịu trách nhiệm điều phối mạng lưới Load Balancer định tuyến hạt HTTP Neon và phân bổ hàng đợi trễ đồng bộ DB Replication:

```typescript
export interface NetworkNode {
  id: string;
  type: 'CLIENT' | 'LOAD_BALANCER' | 'WEB_SERVER' | 'DATABASE_PRIMARY' | 'DATABASE_REPLICA';
  status: 'HEALTHY' | 'DOWN';
}

export class SystemDesignEngine {
  private nodes: Map<string, NetworkNode> = new Map();
  private webServerRoundRobinIndex = 0;

  public registerNode(node: NetworkNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Định tuyến phân phối tải vòng tròn (Round-Robin Load Balancer Router)
   */
  public routeRequest(): string {
    const servers = Array.from(this.nodes.values()).filter(
      n => n.type === 'WEB_SERVER' && n.status === 'HEALTHY'
    );

    if (servers.length === 0) {
      throw new Error('503 Service Unavailable: Toàn bộ cụm Web Servers đã sập nguồn!');
    }

    // Lấy Server tiếp theo theo vòng tròn (Round-Robin index)
    const targetServer = servers[this.webServerRoundRobinIndex % servers.length];
    this.webServerRoundRobinIndex++;

    return targetServer.id;
  }

  /**
   * Tính toán hàng đợi trễ đồng bộ cơ sở dữ liệu (DB Replication delay math)
   * @param baseDelayMs Độ trễ cấu hình mặc định (100ms - 5000ms slider)
   * @param dataSizeKb Kích thước gói dữ liệu đồng bộ
   */
  public static calculateReplicationLag(baseDelayMs: number, dataSizeKb: number): number {
    // Độ trễ tỉ lệ thuận với dung lượng dữ liệu: delay = baseDelay + (size * 1.5)
    return baseDelayMs + dataSizeKb * 1.5;
  }
}
```

---

## 2. Máy Phun Hạt Bụi Khói Khi Sập Máy Chủ (FailureSmokeEmitterEngine TS)

Động cơ vật lý Canvas 2D phun hạt bụi khói xám tự phát sáng 60 FPS khi sập máy chủ, tích hợp tháo dỡ tháo thu hồi hạt tan biến khỏi RAM tránh rò rỉ GC Client-side:

```typescript
export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number; // Tuổi thọ hạt còn lại [ms]
}

export class FailureSmokeEmitterEngine {
  private particles: SmokeParticle[] = [];
  private maxParticles = 60;

  /**
   * Kích nổ phát thải luồng khói xám khi Server sập nguồn (Emit Smoke Shockwave)
   */
  public emitFailureSmoke(centerX: number, centerY: number): void {
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 2, // Vân tốc ngang ngẫu nhiên
        vy: -Math.random() * 2 - 1,    // Vân tốc hướng bay lên
        alpha: 0.8,
        size: Math.random() * 15 + 8,
        life: 1000 // Sống trong 1 giây (1000ms)
      });
    }
  }

  /**
   * Cập nhật tọa độ hạt khói bay và triệt tiêu thu hồi hạt cũ (Update & GC cycle)
   * Vận hành 60 FPS rAF
   */
  public updateParticles(deltaTime: number): void {
    this.particles.forEach(p => {
      p.x += p.vx * (deltaTime / 16.67);
      p.y += p.vy * (deltaTime / 16.67);
      p.alpha -= 0.012 * (deltaTime / 16.67); // Giảm dần độ mờ ảo alpha
      p.life -= deltaTime;
    });

    // Thu hồi rác GC Client-side: Tháo dỡ lọc sạch sẽ các hạt đã chết hoặc tan biến
    this.particles = this.particles.filter(p => p.life > 0 && p.alpha > 0);
  }

  public getParticles(): SmokeParticle[] {
    return this.particles;
  }

  public clear(): void {
    this.particles = [];
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Kiến Trúc Hệ Thống (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SystemDesignEngine, NetworkNode, FailureSmokeEmitterEngine } from './SystemDesignEngine';

describe('Sprint 11 System Design Simulator Unit Tests', () => {
  let engine: SystemDesignEngine;

  beforeEach(() => {
    engine = new SystemDesignEngine();
  });

  it('Should route HTTP requests sequentially using Round-Robin load balancing rules', () => {
    engine.registerNode({ id: 'SRV_A', type: 'WEB_SERVER', status: 'HEALTHY' });
    engine.registerNode({ id: 'SRV_B', type: 'WEB_SERVER', status: 'HEALTHY' });

    // Request 1 -> Định tuyến máy chủ A
    expect(engine.routeRequest()).toBe('SRV_A');
    // Request 2 -> Định tuyến máy chủ B (Round-Robin xoay vòng)
    expect(engine.routeRequest()).toBe('SRV_B');
    // Request 3 -> Quay lại máy chủ A
    expect(engine.routeRequest()).toBe('SRV_A');
  });

  it('Should recalculate database replication latency based on slider input values and payload sizes', () => {
    const lag = SystemDesignEngine.calculateReplicationLag(500, 100); // 500ms cơ bản, 100kb data

    expect(lag).toBe(650); // 500 + 100 * 1.5 = 650ms
  });

  it('Should successfully emit failure smoke particles and filter out dead particles during GC cycles', () => {
    const emitter = new FailureSmokeEmitterEngine();

    // Sập server tại tọa độ (200, 200) -> Phun 25 hạt khói
    emitter.emitFailureSmoke(200, 200);
    expect(emitter.getParticles().length).toBe(25);

    // Giả lập trôi đi thời gian 2 giây (2000ms) -> Toàn bộ hạt khói đều chết
    emitter.updateParticles(2000);

    // Bộ lọc GC hoạt động -> Xóa sạch sẽ hạt chết khỏi mảng RAM
    expect(emitter.getParticles().length).toBe(0);
  });
});
```
 Thiết kế bộ mô phỏng phân phối tải cân bằng Load Balancer tròn đều kết hợp động cơ bụi khói sập nguồn Canvas 60 FPS tối ưu giải phóng rác RAM GC mang lại một cái nhìn trực quan sinh động sâu sắc nhất về cấu trúc mạng kiến trúc phân tán cho học viên.
