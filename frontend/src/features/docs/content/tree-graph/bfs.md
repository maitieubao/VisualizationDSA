---
title: Duyệt theo chiều rộng (BFS)
description: Khám phá thuật toán Breadth-First Search (BFS) - kỹ thuật quét ngang dữ liệu theo từng tầng, từng lớp, chuyên trị bài toán tìm đường đi ngắn nhất.
---

# Duyệt theo chiều rộng (BFS) {#bfs}

Như đã đề cập ở bài trước, Đệ quy (Recursion) mang bản chất của Stack (vào sâu và lùi lại), nên nó luôn cắm đầu đi sâu xuống nhánh cây tạo ra kiểu quét **Theo chiều sâu (DFS)**. 

Nhưng nếu bài toán yêu cầu: *"Hãy tìm bạn bè của tôi (Lớp thứ 1), sau đó tìm bạn của bạn tôi (Lớp thứ 2)"* trên mạng xã hội Facebook? Việc đi đâm xuyên một mạch từ một người bạn xuống thẳng một người lạ hoắc ở Châu Phi (theo kiểu DFS) là vô nghĩa.

Chúng ta cần một thuật toán mở rộng vùng tìm kiếm dần dần, quét sạch tầng hiện tại rồi mới xuống tầng tiếp theo. Đó là **Breadth-First Search (Duyệt theo chiều rộng)**. 

Trái tim của BFS không phải là Đệ quy (Stack), mà là **Hàng đợi (Queue)**!

## Nguyên lý hoạt động {#how-it-works}

Luật chơi của BFS cực kỳ đơn giản: **Dùng một Queue để chứa những đỉnh/node sắp được thăm.**

1. Bắt đầu ở Root. Bỏ Root vào Queue.
2. Lặp lại quá trình sau cho đến khi Queue RỖNG:
   - **Rút (Dequeue)** Node đang đứng ở đầu Hàng đợi ra. (Thăm Node này).
   - Hỏi xem Node này có Node con/hàng xóm nào không?
   - Nếu có, đẩy (Enqueue) TẤT CẢ con/hàng xóm của nó vào cuối Hàng đợi, bắt chúng xếp hàng chờ đến lượt.
3. Kết thúc!

Nhờ nguyên lý công bằng (FIFO) của Queue, những Node ở Tầng 1 được bỏ vào Queue trước, nên chúng sẽ được Rút ra thăm trước. Những Node ở Tầng 2 do được nạp vào sau, phải xếp hàng đợi Tầng 1 quét xong mới đến lượt!

## Ứng dụng thực tế: Tại sao lại là BFS? {#use-cases}

Đặc sản lớn nhất của BFS là: **Nó luôn tìm ra đường đi NGẮN NHẤT trên đồ thị không có trọng số (Unweighted Graph).**

Giả sử bạn chơi game giải đố mê cung. BFS giống như việc bạn đổ một xô nước vào điểm bắt đầu. Nước sẽ loang ra xung quanh (tỏa ra mọi hướng cùng lúc). Giọt nước nào chạm đích đầu tiên, đó CỨNG ĐẢM là con đường ngắn nhất!

**Các bài toán kinh điển:**
- Tìm đường đi ngắn nhất từ A đến B trên lưới 2D (Bài toán ma trận).
- Tính số bước tối thiểu để biến đổi chuỗi (Word Ladder).
- Crawl (Cào) dữ liệu Web: Quét các link ở trang chủ (Tầng 1), rồi quét các trang con (Tầng 2).

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Cây (Tree) | Đồ thị (Graph) |
| :--- | :--- | :--- |
| **Thời gian** | **O(N)** - N là tổng số Node. | **O(V + E)** - Phải duyệt qua số Đỉnh (V) và số Cạnh (E). |
| **Không gian (Space)** | **O(W)** - W là chiều rộng tối đa của cây (Số lượng phần tử nhiều nhất trên một tầng). | **O(V)** - Queue có thể chứa tối đa V đỉnh cùng lúc. |

## Cài đặt BFS cho Cây (Code Example) {#code-example}

Dưới đây là cách cài đặt vòng lặp `while` kinh điển của BFS (còn gọi là Level-Order Traversal):

```csharp
using System.Collections.Generic;

public void BreadthFirstSearch(TreeNode root)
{
    if (root == null) return;

    // Trái tim của BFS: Queue
    Queue<TreeNode> queue = new Queue<TreeNode>();
    
    // Bỏ gốc vào hàng đợi
    queue.Enqueue(root);

    while (queue.Count > 0)
    {
        // 1. Rút người đầu tiên ra khỏi hàng đợi
        TreeNode current = queue.Dequeue();
        
        // 2. "Thăm" người đó (Ví dụ: In ra)
        Console.Write(current.Value + " ");

        // 3. Cho các con của người đó xếp hàng
        if (current.Left != null)
        {
            queue.Enqueue(current.Left);
        }
        
        if (current.Right != null)
        {
            queue.Enqueue(current.Right);
        }
    }
}
```

:::warning Lưu ý khi áp dụng BFS cho Đồ thị (Graph)
Cây (Tree) luôn đi từ trên xuống dưới, không có đường quay ngược lại. Nhưng Đồ thị (Graph) thì có vòng lặp (Cycle)! Nếu A nối B, B nối A. Nếu bạn dùng code ở trên, A sẽ cho B vào hàng đợi, B lại cho A vào, tạo thành vòng lặp vô hạn.
**Với Đồ thị:** Bạn BẮT BUỘC phải cấp thêm một mảng `bool[] visited` hoặc `HashSet` để đánh dấu những Đỉnh đã từng vào Queue, tránh việc 1 đỉnh xếp hàng 2 lần.
:::

## Next Steps {#next-steps}

Đến đây, bạn đã thấy sự kỳ diệu của việc thay thế "LIFO (Đệ quy/Stack)" bằng "FIFO (Queue)" để thay đổi hoàn toàn cục diện tìm kiếm.

Vậy rốt cuộc **DFS (Duyệt theo chiều sâu)** trông như thế nào nếu ta không dùng Đệ quy mà viết bằng vòng lặp? Ưu nhược điểm của nó so với BFS là gì? Hãy sang bài tiếp theo: **Duyệt theo chiều sâu (DFS)** để làm rõ.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/tree-graph/dfs">
    <p class="next-steps-link">Duyệt theo chiều sâu (DFS)</p>
    <p class="next-steps-caption">Sức mạnh của thuật toán cắm đầu đi sâu tìm lối thoát.</p>
  </a>
</div>
