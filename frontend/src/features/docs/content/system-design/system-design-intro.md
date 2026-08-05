---
title: Giới thiệu Thiết kế Hệ thống
description: Tìm hiểu các khái niệm cốt lõi trong thiết kế hệ thống: Load Balancer, Server Health, Packet Routing, Database Replication và Failure Handling.
---

# Thiết kế Hệ thống (System Design) {#system-design-intro}

## System Design là gì? {#what-is-system-design}

**System Design** (Thiết kế Hệ thống) là quá trình lên kế hoạch và cấu trúc các thành phần phần mềm để xây dựng một hệ thống đáp ứng được các yêu cầu về **Khả năng mở rộng (Scalability)**, **Độ tin cậy (Reliability)**, **Tính sẵn sàng (Availability)** và **Hiệu năng (Performance)**.

Một hệ thống tốt không chỉ "chạy được" — nó phải:
- **Chịu tải (Handle Traffic):** Phục vụ hàng ngàn hoặc hàng triệu người dùng đồng thời.
- **Tự phục hồi (Self-healing):** Tự động phục hồi khi một thành phần gặp sự cố.
- **Mở rộng ngang (Scale Horizontally):** Thêm server dễ dàng khi nhu cầu tăng.

## Các thành phần cốt lõi {#core-components}

Một hệ thống phân tán (Distributed System) điển hình bao gồm các thành phần sau:

### 1. Load Balancer (Bộ cân bằng tải) {#load-balancer}

Load Balancer là "người gác cổng" đón nhận mọi yêu cầu (request) từ người dùng và phân phối chúng đến các máy chủ (server) sau theo một **chiến lược** nào đó.

**Chiến lược Round-Robin:**
- Yêu cầu đầu tiên → Server A
- Yêu cầu thứ hai → Server B
- Yêu cầu thứ ba → Server A
- Yêu cầu thứ bốn → Server B

Chiến lược này đảm bảo tải được phân phối **đều đặn** giữa các server, tránh tình trạng một server bị quá tải trong khi server khác "đói việc" (nhàn rỗi, không nhận yêu cầu nào).

:::tip
Round-Robin là chiến lược đơn giản nhất nhưng rất hiệu quả cho hầu hết các trường hợp. Đối với hệ thống lớn, các chiến lược phức tạp hơn như **Weighted Round-Robin**, **Least Connections** hoặc **IP Hash** có thể được sử dụng.
:::

### 2. Server Health & Failover (Sức khỏe Server & Chuyển đổi) {#server-health}

Mỗi server trong hệ thống có một trạng thái:

| Trạng thái | Mô tả | Hành động |
| :--- | :--- | :--- |
| **HEALTHY** | Server hoạt động bình thường | Nhận và xử lý yêu cầu |
| **FAILED** | Server gặp sự cố (crash, quá tải, lỗi phần cứng) | Không nhận yêu cầu mới, Load Balancer chuyển hướng sang server khác |

Khi một server chuyển từ HEALTHY → FAILED:
1. Load Balancer **ngừng gửi** yêu cầu mới đến server đó.
2. Tất cả yêu cầu mới được **chuyển hướng hoàn toàn** đến các server còn lại.
3. Nếu **tất cả** server đều FAILED → hệ thống trả về lỗi (ví dụ: HTTP 503 Service Unavailable).

### 3. Network Packet Routing (Định tuyến Gói tin) {#packet-routing}

Mỗi yêu cầu từ người dùng được đóng gói thành một **gói tin (packet)** với các thuộc tính:

- **Source (Nguồn):** Server gửi đi.
- **Target (Đích):** Server nhận.
- **Progress:** Tiến trình truyền (0% → 100%).
- **Status:** Trạng thái (IN_TRANSIT, ARRIVED, DROPPED).

Khi một gói tin đến được đích, nó được đánh dấu **ARRIVED** và dọn đi để giải phóng bộ nhớ.

## Ví dụ: Mô phỏng Load Balancer Round-Robin {#example-code}

Để hiểu rõ cơ chế phân phối yêu cầu, hãy xem một mô phỏng Round-Robin đơn giản bằng C#. Bộ cân bằng tải lưu danh sách server và luân phiên trả về server kế tiếp theo công thức `(index + 1) % số_server`:

```csharp
using System;
using System.Collections.Generic;

class RoundRobinLoadBalancer
{
    private readonly List<string> _servers;
    private int _nextIndex;

    public RoundRobinLoadBalancer(List<string> servers)
    {
        _servers = servers;
        _nextIndex = 0;
    }

    public string Dispatch()
    {
        string server = _servers[_nextIndex];
        _nextIndex = (_nextIndex + 1) % _servers.Count;
        return server;
    }
}

// Ví dụ sử dụng
var servers = new List<string> { "SRV_A", "SRV_B" };
var balancer = new RoundRobinLoadBalancer(servers);

for (int i = 1; i <= 6; i++)
{
    Console.WriteLine($"Yêu cầu {i} → {balancer.Dispatch()}");
}

// Kết quả in ra:
// Yêu cầu 1 → SRV_A
// Yêu cầu 2 → SRV_B
// Yêu cầu 3 → SRV_A
// Yêu cầu 4 → SRV_B
// Yêu cầu 5 → SRV_A
// Yêu cầu 6 → SRV_B
```

Trong thực tế, một Load Balancer còn kết hợp thêm cơ chế **kiểm tra sức khỏe (health check)** để loại bỏ server FAILED khỏi danh sách luân phiên — bạn sẽ tìm hiểu chi tiết ở mục Next Steps bên dưới.

## Next Steps {#next-steps}

Hãy cùng tìm hiểu sâu hơn về từng thành phần:

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/system-design/load-balancer">
    <p class="next-steps-link">Load Balancer & Round-Robin</p>
    <p class="next-steps-caption">Cách bộ cân bằng tải phân phối yêu cầu và cơ chế Round-Robin.</p>
  </a>
  <a class="vt-box" href="/docs/system-design/server-health">
    <p class="next-steps-link">Server Health & Failover</p>
    <p class="next-steps-caption">Cơ chế phát hiện lỗi và chuyển đổi tự động khi server gặp sự cố.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Nguồn lý thuyết chính được dùng để biên soạn bài viết này:

- **Martin Kleppmann – *Designing Data-Intensive Applications* (O'Reilly, 2017):** Cuốn sách nền tảng về hệ thống phân tán, độ tin cậy (Reliability), khả năng mở rộng (Scalability) và khả năng duy trì (Maintainability).
- **Alex Xu – *System Design Interview – An Insider's Guide* (Vol. 1 & 2):** Bộ sách hướng dẫn thiết kế hệ thống quy mô lớn, bao gồm các bài toán Load Balancer, Caching, Message Queue và Database Replication.
- **Brendan Burns – *Designing Distributed Systems* (O'Reilly, 2018):** Các mẫu thiết kế vận hành cho hệ thống phân tán như Sidecar, Choreography và Replicated Load-Balanced Services.
- **Wikipedia – *Load balancing (computing)*:** Tổng quan về các thuật toán cân bằng tải như Round-Robin, Least Connections, Weighted Round-Robin. (https://en.wikipedia.org/wiki/Load_balancing_(computing))
- **Microsoft Learn – *Azure Architecture Center – Load-balancing options*:** Hướng dẫn chính thức của Microsoft về các lựa chọn cân bằng tải và mô hình kích hoạt (active-active / active-passive). (https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview)
- **GeeksforGeeks – *What is Load Balancer & Load Balancing?*:** Bài viết tổng quan về vai trò, lợi ích và các chiến lược cân bằng tải phổ biến.
