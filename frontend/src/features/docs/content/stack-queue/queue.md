---
title: Hàng đợi (Queue)
description: Cấu trúc dữ liệu FIFO định hình sự công bằng của vạn vật. Giải mã lý do tại sao Queue trên Mảng lại là thảm họa O(N) và cách khắc phục bằng Hàng đợi vòng (Circular Queue).
---

# Hàng đợi (Queue) {#queue}

:::info Mục tiêu bài học
- Thấu hiểu cơ chế **FIFO (Vào trước - Ra trước)** kiến tạo nên sự công bằng trong mọi hệ thống máy tính.
- Mổ xẻ bi kịch của việc cài đặt Queue bằng Mảng (Array) và chứng minh tại sao thao tác Lấy ra (Dequeue) lại tốn tới $O(N)$.
- Đề xuất giải pháp **Hàng đợi Vòng (Circular Queue)** để cứu vớt hiệu năng trên Mảng.
- Tầm nhìn hệ thống: Hiểu cách Queue làm trái tim cho các Message Broker như RabbitMQ, Kafka hay luồng xử lý Node.js.
:::

## 1. Lời mở đầu: Triết lý "Ai đến trước, Phục vụ trước" {#introduction}

Trái ngược hoàn toàn với sự "thiên vị" kẻ đến sau của [Ngăn xếp (Stack)](/docs/stack-queue/stack), Hàng đợi (Queue) là hiện thân của sự công bằng tuyệt đối: **Vào Trước - Ra Trước (First-In, First-Out - FIFO).**

**Ví dụ thực tế (Real-world analogy):**
- **Xếp hàng mua vé xem phim:** Ai đến mua vé trước thì được rạp phim phục vụ trước. Kẻ đến sau phải ngậm ngùi đứng chót hàng. Rất công bằng!
- **Máy in (Print Queue):** Trong văn phòng, nếu 3 người cùng nhấn In tài liệu, lệnh của ai bấm trước sẽ được đẩy vào Queue và in ra đầu tiên. Lệnh thứ 3 phải đợi 2 lệnh kia in xong.
- **Microservices (RabbitMQ / Kafka):** Hàng triệu tin nhắn từ người dùng được ném vào một Message Queue khổng lồ. Server sẽ rảnh rỗi lôi từng tin nhắn ở đầu Queue ra xử lý dần dần để tránh quá tải (Crash).

---

## 2. Các thao tác cơ bản và Hai đầu cầu {#operations}

Một Queue tiêu chuẩn có 2 con trỏ chỉ huy: **Front (Đầu hàng)** và **Rear (Cuối hàng)**. Giao diện của Queue cung cấp 3 thao tác chính, mong đợi tốc độ chớp nhoáng $O(1)$.

| Thao tác | Ý nghĩa (FIFO) |
| :--- | :--- |
| **`Enqueue(x)`** | Thêm người `x` vào cuối hàng đợi (Gắn vào **Rear**). |
| **`Dequeue()`** | Xóa và lấy người đang đứng đầu hàng đợi ra (Lấy từ **Front**). |
| **`Peek()`** | Nhìn mặt người đang đứng đầu hàng (Không xóa). |

### Minh họa Enqueue và Dequeue bằng 2 con trỏ

```mermaid
flowchart LR
    subgraph S1 [1. Khởi tạo rỗng]
        direction LR
        Empty[Trống]
        Front1((Front)) -.- Empty
        Rear1((Rear)) -.- Empty
        style Empty fill:transparent,stroke:none
    end
    
    subgraph S2 [2. Enqueue 10, rồi Enqueue 20]
        direction LR
        A2[10] --- B2[20]
        Front2((Front)) --> A2
        Rear2((Rear)) --> B2
        style A2 fill:#10b981,color:#fff
        style B2 fill:#3b82f6,color:#fff
    end
    
    subgraph S3 [3. Dequeue (Lấy 10 ra)]
        direction LR
        Pop((Lấy 10)) -.-> A3[20]
        Front3((Front)) --> A3
        Rear3((Rear)) --> A3
        style Pop fill:#ef4444,color:#fff
        style A3 fill:#3b82f6,color:#fff
    end
    
    S1 ==> S2 ==> S3
```

*(Mỗi khi có người mới vào, Rear dịch chuyển. Mỗi khi có người được phục vụ, Front dịch chuyển).*

---

## 3. Bi kịch của Cấu trúc Mảng (Array) {#array-tragedy}

Nếu bạn tự mình cài đặt Stack bằng Mảng, mọi thứ rất dễ vì thao tác Push/Pop chỉ diễn ra ở "đuôi" mảng ($O(1)$). Nhưng nếu bạn cài đặt Queue bằng Mảng, một thảm họa hiệu năng sẽ xảy ra!

Hãy tưởng tượng mảng `[10, 20, 30]`. `Front` chỉ vào 10 (Index 0). `Rear` chỉ vào 30 (Index 2).
Khi bạn gọi `Dequeue()` để lấy `10` ra, vị trí Index 0 sẽ bị trống. Để giữ đúng bản chất của Mảng (Dữ liệu liên tiếp), bạn BẮT BUỘC phải ra lệnh cho tất cả những người còn lại tiến lên 1 bước: `20` chuyển sang Index 0, `30` sang Index 1.

> **Hậu quả:** Chỉ 1 lệnh `Dequeue`, nhưng nếu hàng đợi có 1 Triệu người, bạn phải ép cả 999.999 người tiến lên 1 bước. Độ phức tạp bị đội lên thành **O(N)** thay vì **O(1)**. Đây là một sự lãng phí sức mạnh CPU khủng khiếp!

*(Chú ý: Nếu bạn cài đặt Queue bằng Danh sách liên kết - Linked List, việc lấy Node đầu tiên ra chỉ tốn $O(1)$ vì bạn chỉ cần đổi mối nối (Pointer) mà không bắt ai phải di chuyển cả).*

---

## 4. Giải pháp cứu vãn: Hàng đợi Vòng (Circular Queue) {#circular-queue}

Để giải cứu Array khỏi thảm họa O(N), các kỹ sư hệ thống sáng tạo ra một kỹ thuật cực hay: **KHÔNG cần ai tiến lên cả!** 
Khi Index 0 trống rỗng, ta cứ để nó trống. Con trỏ `Front` sẽ tự động dịch chuyển từ Index 0 sang Index 1 để chỉ vào `20`.

Nhưng nếu cứ thế, `Rear` vươn tới cuối mảng (Hết sức chứa) thì sao? Rất đơn giản: Ta dùng phép toán Modulo `%` để bẻ cong Mảng thành một "Vòng tròn". Nếu `Rear` chạm đáy, nó sẽ vòng ngược lại lên Index 0 (nơi nãy giờ đã bị bỏ trống do `Front` đi qua).

```mermaid
flowchart TD
    subgraph Bước 1: Mảng bình thường đã đầy đuôi
        direction LR
        F1((Front)) --> A[Index 0: Trống]
        A --> B[Index 1: 20]
        B --> C[Index 2: 30]
        R1((Rear)) --> C
    end
    
    subgraph Bước 2: Hàng đợi Vòng chèn phần tử mới vào đầu
        direction LR
        F2((Front)) --> B2[Index 1: 20]
        B2 --> C2[Index 2: 30]
        C2 -.Vòng ngược.-> A2[Index 0: 40]
        R2((Rear)) --> A2
        style A2 fill:#10b981,color:#fff
    end
    
    Bước 1 ==> Bước 2
```

### Mã nguồn C# cài đặt Circular Queue

```csharp
public class CircularQueue 
{
    private int[] arr;
    private int front, rear, size, capacity;

    public CircularQueue(int cap) 
    {
        capacity = cap;
        arr = new int[capacity];
        front = 0;
        rear = capacity - 1; 
        size = 0; // Số lượng người đang đứng trong hàng
    }

    public void Enqueue(int item) 
    {
        if (size == capacity) return; // Hàng đã đầy kín
        
        // Cú lừa Vòng tròn: Nếu rear ở cuối, nó sẽ quay về 0
        rear = (rear + 1) % capacity; 
        arr[rear] = item;
        size++;
    }

    public int Dequeue() 
    {
        if (size == 0) return -1; // Trống rỗng
        
        int item = arr[front];
        
        // Front tiến lên, nếu chạm đáy thì quay về 0
        front = (front + 1) % capacity; 
        size--;
        
        return item;
    }
}
```
Nhờ thuật toán này, toàn bộ Enqueue và Dequeue trên Array đều lấy lại được sức mạnh **O(1)** hoàn hảo. Thư viện `Queue<T>` trong C# thực chất chính là được cài đặt ngầm bằng mảng vòng (Circular Array) kết hợp với kỹ thuật Tự động x2 kích thước (Dynamic Resizing)!

---

## 5. Ứng dụng đỉnh cao: Duyệt theo chiều rộng (BFS) {#bfs-intro}

Nếu Stack là người bạn thân của Đệ quy (DFS), thì Queue chính là vũ khí độc quyền của Thuật toán **Duyệt theo chiều rộng (BFS)**.
Trong BFS, từ một Đỉnh gốc, bạn sẽ phải tham quan toàn bộ bạn bè của nó (Tầng 1). Rồi sau đó mới đi tham quan bạn bè của bạn bè (Tầng 2). Việc này đòi hỏi tính công bằng tuyệt đối: Đỉnh nào được tìm thấy trước sẽ phải được duyệt trước. Queue chính là sinh ra để làm việc này.

*(Chúng ta sẽ đi sâu vào kỹ thuật này trong bài viết Duyệt theo chiều rộng (BFS) tiếp theo).*

:::tip Tóm tắt nhanh (Key Takeaways)
- Hàng đợi (Queue) tuân thủ luật FIFO (First-In, First-Out). Duy trì 2 con trỏ Front và Rear.
- Nếu muốn tự code Queue, hãy dùng Linked List để tránh thảm họa O(N) khi Dequeue.
- Nếu bắt buộc dùng Mảng để tối ưu CPU Cache, hãy dùng kỹ thuật Mảng vòng (Circular Array) với công thức `(index + 1) % capacity`.
- Trong C#, bạn chỉ cần dùng thư viện chuẩn `Queue<T>` (được tối ưu hóa hoàn hảo) là đủ để chinh chiến mọi bài toán BFS.
:::
