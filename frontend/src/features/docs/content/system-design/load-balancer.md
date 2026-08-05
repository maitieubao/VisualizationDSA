---
title: Load Balancer & Round-Robin
description: Tìm hiểu cách Load Balancer phân phối yêu cầu và cơ chế Round-Robin trong hệ thống phân tán.
---

# Load Balancer & Round-Robin {#load-balancer}

## Load Balancer là gì? {#what-is-load-balancer}

**Load Balancer** (Bộ cân bằng tải) là một thành phần trung gian đứng giữa người dùng và các máy chủ (server). Nhiệm vụ chính của nó là **nhận mọi yêu cầu (request)** và **phân phối** chúng đến các server sau theo một chiến lược đã định.

## Tại sao cần Load Balancer? {#why-load-balancer}

| Vấn đề | Giải pháp với Load Balancer |
| :--- | :--- |
| Server bị quá tải | Tải được phân phối đều → mỗi server xử lý ít hơn |
| Server gặp sự cố | Yêu cầu tự động chuyển sang server khác |
| Cần mở rộng | Thêm server mới vào pool → tải giảm tự động |

## Chiến lược Round-Robin {#round-robin}

**Round-Robin** là chiến lược đơn giản nhất và phổ biến nhất trong Load Balancer. Nguyên tắc hoạt động:

> **Luân phiên phân phối yêu cầu tới các server theo thứ tự tuần tự.**

### Ví dụ thực tế {#example}

Giả sử hệ thống có 2 server: **SRV_A** và **SRV_B**. Khi có 4 yêu cầu liên tiếp:

| Yêu cầu | Server nhận | Ghi chú |
| :--- | :--- | :--- |
| 1 | SRV_A | Lượt 1 |
| 2 | SRV_B | Lượt 2 |
| 3 | SRV_A | Lượt 1 (lặp lại) |
| 4 | SRV_B | Lượt 2 (lặp lại) |

**Kết quả:** Mỗi server nhận đúng 2 yêu cầu — tải được cân bằng hoàn hảo.

### Công thức tính {#formula}

```
Server nhận yêu cầu thứ N = (N - 1) % Số_lượng_server
```

Ví dụ với 2 server:
- Yêu cầu 1: (1-1) % 2 = 0 → SRV_A (index 0)
- Yêu cầu 2: (2-1) % 2 = 1 → SRV_B (index 1)
- Yêu cầu 3: (3-1) % 2 = 0 → SRV_A (index 0)

## Round-Robin với server FAILED {#round-robin-failover}

Khi một server bị FAILED, Load Balancer sẽ **bỏ qua** server đó và chỉ phân phối đến các server còn lại.

### Ví dụ: SRV_A FAILED {#example-failover}

| Yêu cầu | Server nhận | Ghi chú |
| :--- | :--- | :--- |
| 1 | SRV_B | SRV_A bị FAILED → chuyển toàn bộ sang SRV_B |
| 2 | SRV_B | SRV_B xử lý |

**Kết quả:** 100% yêu cầu đều được gửi đến SRV_B. Nếu SRV_B cũng FAILED → trả về lỗi.

## Các chiến lược khác {#other-strategies}

| Chiến lược | Mô tả | Dùng cho |
| :--- | :--- | :--- |
| **Round-Robin** | Luân phiên đều | Hệ thống cân bằng tải đơn giản |
| **Weighted Round-Robin** | Server mạnh nhận nhiều hơn | Server có cấu hình khác nhau |
| **Least Connections** | Gửi đến server ít kết nối nhất | Yêu cầu kéo dài (long-lived) |
| **IP Hash** | Dựa trên IP người dùng | Phiên làm việc cần gán sticky |

## L4 vs L7 Load Balancer {#l4-vs-l7}

Load Balancer hoạt động ở hai tầng phổ biến nhất:

| Tầng | Điều hành dựa trên | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **L4 — Transport (TCP/UDP)** | IP và cổng nguồn/đích | Tốc độ cao, tiêu tốn ít tài nguyên | Không hiểu nội dung yêu cầu (URL, header, cookie) |
| **L7 — Application (HTTP/HTTPS)** | Nội dung yêu cầu (URL path, header, cookie) | Routing theo nội dung, hỗ trợ sticky session bằng cookie | Chậm hơn L4 vì phải đọc payload |

Ví dụ: một L7 Load Balancer có thể gửi toàn bộ yêu cầu tới đường dẫn `/api` về nhóm server A, còn `/image` về nhóm server B.

## Sticky Session {#sticky-session}

**Sticky Session** (phiên bám dính) là kỹ thuật đảm bảo mọi yêu cầu của cùng một người dùng luôn được gửi tới **một server nhất định**. Lý do: trạng thái phiên (giỏ hàng, token đăng nhập) thường được lưu cục bộ trên từng server — nếu yêu cầu rơi vào server khác, phiên sẽ bị mất.

Hai cách triển khai phổ biến:
- **IP Hash:** Băm địa chỉ IP người dùng để chọn server cố định.
- **Cookie do Load Balancer gắn:** Load Balancer ghi mã server vào cookie; các yêu cầu sau mang cookie đó trỏ thẳng về đúng server.

> **Lưu ý:** Sticky session làm giảm khả năng cân bằng tải (một người dùng nặng có thể làm nghẽn một server). Giải pháp hiện đại: lưu phiên vào Redis/shared store và bỏ sticky session.

## Health Check {#health-check}

Load Balancer chỉ nên gửi yêu cầu tới server **khỏe mạnh**. Nó thực hiện **health check** định kỳ (TCP, HTTP hoặc Application check) để phát hiện server FAILED và loại khỏi pool ngay lập tức — đã trình bày chi tiết ở bài [Server Health & Failover](/docs/system-design/server-health).

## Ví dụ code: Round-Robin trong C# {#code-example}

```csharp
using System;
using System.Collections.Generic;

class RoundRobinBalancer
{
    private readonly List<string> _servers;
    private int _next;

    public RoundRobinBalancer(List<string> servers)
    {
        _servers = servers;
    }

    public string Next()
    {
        string server = _servers[_next];
        _next = (_next + 1) % _servers.Count;
        return server;
    }
}

class Program
{
    static void Main()
    {
        var balancer = new RoundRobinBalancer(new List<string> { "SRV_A", "SRV_B" });

        for (int i = 1; i <= 4; i++)
        {
            Console.WriteLine($"Yêu cầu {i} -> {balancer.Next()}");
        }
    }
}
```

**Kết quả chạy chương trình:**

```
Yêu cầu 1 -> SRV_A
Yêu cầu 2 -> SRV_B
Yêu cầu 3 -> SRV_A
Yêu cầu 4 -> SRV_B
```

## Next Steps {#next-steps}

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/system-design/server-health">
    <p class="next-steps-link">Server Health & Failover</p>
    <p class="next-steps-caption">Cơ chế phát hiện lỗi và chuyển đổi tự động khi server gặp sự cố.</p>
  </a>
  <a class="vt-box" href="/docs/system-design/packet-routing">
    <p class="next-steps-link">Network Packet Routing</p>
    <p class="next-steps-caption">Cách gói tin được tạo, truyền và quản lý trong hệ thống.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Nguồn lý thuyết chính được dùng để biên soạn bài viết này:

- **Martin Kleppmann – *Designing Data-Intensive Applications* (O'Reilly, 2017):** Chương về load balancing, phân tán dữ liệu và xử lý failover trong hệ thống phân tán.
- **Alex Xu – *System Design Interview – An Insider's Guide* (Byte-Sized, 2020):** Phân tích các chiến lược Round Robin, Weighted Round Robin, Least Connections, IP Hash và Sticky Session khi thiết kế hệ thống.
- **Brendan Burns – *Designing Distributed Systems* (O'Reilly, 2018):** Nền tảng thiết kế các hệ thống phân tán, vai trò của các thành phần trung gian như Load Balancer.
- **Wikipedia – *Load balancing (computing)*:** Tổng quan về khái niệm và các thuật toán cân bằng tải. (https://en.wikipedia.org/wiki/Load_balancing_(computing))
- **Microsoft Learn – *Load-balancing options*:** Tài liệu chính thức về các tùy chọn cân bằng tải trong Azure, bao gồm cơ chế health probe. (https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview)
- **NGINX – *What Is Load Balancing?*:** Giải thích các phương thức cân bằng tải như round-robin, least-connected, ip-hash và cơ chế health check. (https://www.nginx.com/resources/glossary/load-balancing/)
- **GeeksforGeeks – *Load Balancing*:** Bài viết tổng quan về các thuật toán và ứng dụng của cân bằng tải. (https://www.geeksforgeeks.org/load-balancing/)
