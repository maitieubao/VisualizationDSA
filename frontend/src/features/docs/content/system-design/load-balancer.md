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
