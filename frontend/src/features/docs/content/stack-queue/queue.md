---
title: Hàng đợi (Queue) – Nguyên lý FIFO
description: Khám phá Queue, cấu trúc dữ liệu mô phỏng lại cách thế giới thực vận hành sự công bằng: Người đến trước luôn được phục vụ trước.
---

# Hàng đợi (Queue) {#queue}

Nếu Ngăn xếp (Stack) là sự bất công "Kẻ đến sau, được ăn trước", thì **Hàng đợi (Queue)** đại diện cho sự công bằng tuyệt đối. Nó phản ánh chính xác hình ảnh một hàng người đứng chờ mua vé xem phim, hay đoàn xe xếp hàng chờ qua trạm thu phí.

Queue hoạt động theo nguyên lý **FIFO (First-In, First-Out)** - Cái gì đưa vào đầu tiên thì sẽ được lấy ra đầu tiên.

## Nguyên lý hoạt động {#how-it-works}

Một Queue luôn có hai đầu: một đầu chuyên dùng để nạp dữ liệu vào (Rear/Back), và một đầu chuyên dùng để rút dữ liệu ra (Front/Head).

Các thao tác cơ bản trên một Queue bao gồm:
1. **Enqueue (Xếp hàng):** Thêm một phần tử vào đuôi (Rear) của Queue.
2. **Dequeue (Phục vụ):** Lấy (và xóa) phần tử ở đầu (Front) của Queue ra khỏi hàng.
3. **Peek / Front:** Xem giá trị của phần tử ở đầu hàng (người chuẩn bị được phục vụ) mà không xóa nó.
4. **IsEmpty:** Kiểm tra xem Queue có đang rỗng hay không.

Tương tự như Stack, tất cả các thao tác cơ bản này đều có độ phức tạp thời gian là **O(1)**.

## Cài đặt bằng C# (Code Example) {#code-example}

Trong C#, .NET cung cấp sẵn class `Queue<T>` được cài đặt cực kỳ tinh vi dưới dạng một mảng vòng (Circular Array) để đảm bảo cả thao tác `Enqueue` và `Dequeue` đều đạt tốc độ O(1) mà không bị lãng phí bộ nhớ.

```csharp
using System.Collections.Generic;

public void QueueExample()
{
    // Khởi tạo một Hàng đợi chứa các chuỗi
    Queue<string> supportTickets = new Queue<string>();

    // Enqueue: Khách hàng gửi yêu cầu hỗ trợ (Ai gửi trước, xếp trước)
    supportTickets.Enqueue("Khách A: Lỗi nạp tiền");
    supportTickets.Enqueue("Khách B: Quên mật khẩu");
    supportTickets.Enqueue("Khách C: Tài khoản bị khóa");

    // Peek: Xem yêu cầu của khách hàng đang đứng đầu hàng
    Console.WriteLine($"Đang chuẩn bị xử lý: {supportTickets.Peek()}"); 
    // In ra: "Khách A: Lỗi nạp tiền"

    // Dequeue: Nhân viên hỗ trợ lấy yêu cầu đầu tiên ra để xử lý
    string currentTicket = supportTickets.Dequeue();
    Console.WriteLine($"Đã giải quyết xong: {currentTicket}"); 

    // Kiểm tra hàng đợi còn lại ai đứng đầu?
    Console.WriteLine($"Tiếp theo là: {supportTickets.Peek()}"); 
    // In ra: "Khách B: Quên mật khẩu"
}
```

:::tip Queue vs List
Nhiều bạn mới học thường dùng `List<T>` để giả lập Queue bằng cách gọi `list.Add()` và `list.RemoveAt(0)`. **Đừng bao giờ làm thế!** 
Khi bạn gọi `RemoveAt(0)` trên một List, toàn bộ các phần tử phía sau sẽ phải dịch chuyển lên 1 ô để lấp chỗ trống, khiến thao tác đó tốn **O(N)** thời gian. Nếu danh sách có hàng triệu phần tử, server của bạn sẽ bị "treo". Hãy luôn dùng `Queue<T>` chuẩn của C#.
:::

## Ứng dụng thực tế {#real-world}

Bất cứ nơi nào có sự "xếp hàng chờ đợi", nơi đó có Queue:

1. **Hàng chờ in ấn (Print Spooler):** Khi bạn gửi 10 tài liệu ra máy in, hệ điều hành đưa chúng vào một Queue. Máy in sẽ in lần lượt từng tài liệu theo đúng thứ tự bạn đã bấm in.
2. **Xử lý bất đồng bộ (Message Queues):** Các hệ thống backend khổng lồ sử dụng RabbitMQ, Kafka hay AWS SQS để tạo ra các Queue. User gửi hàng nghìn request, server đưa hết vào Queue và thong thả "Dequeue" ra xử lý dần mà không bị quá tải.
3. **Duyệt Cây & Đồ thị:** Thuật toán duyệt theo chiều rộng (BFS - Breadth First Search) sử dụng Queue làm trái tim điều phối để đảm bảo các đỉnh gần nhau sẽ được thăm trước.
4. **Quản lý Event Loop (Vòng lặp sự kiện):** Trong JavaScript hay các UI Framework, các sự kiện click chuột, gõ phím được đưa vào một Queue (Event Queue) để xử lý tuần tự không bị xung đột.

## Next Steps {#next-steps}

Stack và Queue ở dạng nguyên thủy nhất thì rất dễ dùng. Nhưng chuyện gì sẽ xảy ra nếu ta nâng cấp Stack lên một tầm cao mới: Yêu cầu Stack không chỉ lưu dữ liệu, mà còn phải **tự động sắp xếp hoặc giữ lại một trật tự nhất định** mỗi khi Push phần tử mới vào?

Kỹ thuật nâng cao này xuất hiện cực kỳ nhiều trong các bài toán tối ưu hóa, và nó được gọi là **Ngăn xếp đơn điệu (Monotonic Stack)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/stack-queue/monotonic-stack">
    <p class="next-steps-link">Ngăn xếp đơn điệu (Monotonic Stack)</p>
    <p class="next-steps-caption">Sự kết hợp hoàn hảo giữa Stack và trật tự giá trị để giải bài toán trong O(N).</p>
  </a>
</div>
