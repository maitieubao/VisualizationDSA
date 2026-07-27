---
title: Duyệt theo chiều sâu (DFS)
description: Khám phá Depth-First Search (DFS) - thuật toán thám hiểm mê cung bằng cách đâm xuyên tận đáy, dựa trên sức mạnh của Ngăn xếp (Stack) hoặc Đệ quy.
---

# Duyệt theo chiều sâu (DFS) {#dfs}

Trái ngược hoàn toàn với người anh em BFS "thận trọng" (quét xong tầng này mới xuống tầng kia), **Depth-First Search (Duyệt theo chiều sâu)** là một kẻ thích phiêu lưu mạo hiểm. 

Phong cách của DFS là: **Cắm đầu đi sâu mãi theo một nhánh duy nhất, cho đến khi chạm đáy (không còn đường đi). Khi đó, nó mới chịu lùi lại một bước (Backtrack) để rẽ sang một nhánh khác.**

Trái tim của DFS chính là **Ngăn xếp (Stack)**. Bạn có thể sử dụng Stack có sẵn trong bộ nhớ của HĐH (thông qua hàm Đệ quy), hoặc tự tạo ra một `Stack` cục bộ để duyệt bằng vòng lặp.

## Nguyên lý hoạt động {#how-it-works}

Hình ảnh sinh động nhất của DFS là việc bạn thám hiểm một cái mê cung. Bạn luôn rẽ trái ở mọi ngã tư, đi mãi cho đến khi đụng tường (ngõ cụt). Khi đụng tường, bạn lấy viên phấn gạch dấu `X`, lùi lại ngã tư gần nhất, và thử rẽ phải. 

Luật chơi của DFS sử dụng Stack:
1. Bắt đầu ở Root. Bỏ Root vào Stack.
2. Lặp lại quá trình sau cho đến khi Stack RỖNG:
   - **Rút (Pop)** Node đang đứng ở đỉnh Stack ra. (Thăm Node này).
   - Đẩy (Push) TẤT CẢ con/hàng xóm của nó vào Stack.
3. Kết thúc!

Vì Stack hoạt động theo nguyên lý LIFO (vào sau ra trước), nên những Node con *vừa mới được đẩy vào* sẽ nằm ngay trên Đỉnh. Ở vòng lặp tiếp theo, chúng sẽ lập tức bị Rút ra. Kết quả là thuật toán cứ đi tuột xuống một dây duy nhất mà không quan tâm đến các Node cắm rễ trước đó ở đáy Stack.

## Ứng dụng thực tế: Tại sao lại là DFS? {#use-cases}

Khác với BFS (tìm đường đi ngắn nhất), DFS tỏa sáng trong các bài toán yêu cầu **vét cạn (Exhaustive Search)** hoặc tìm kiếm các thành phần liên thông.

**Các bài toán kinh điển:**
- **Giải quyết Mê cung (Maze Solver) / Backtracking:** Chơi cờ vua (minimax), giải Sudoku, bài toán 8 quân hậu. DFS cho phép bạn lùi lại (backtrack) khi đi sai nước.
- **Phát hiện chu trình (Cycle Detection):** Tìm xem đồ thị có bị "tuần hoàn" không (rất quan trọng trong xử lý Dependency hay Deadlock).
- **Sắp xếp Topo (Topological Sort):** Lên lịch trình môn học, công việc (việc A phải làm trước việc B).
- **Đếm số hòn đảo (Number of Islands):** Quét qua mảng 2D để gom nhóm các phần tử liên thông với nhau.

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Cây (Tree) | Đồ thị (Graph) |
| :--- | :--- | :--- |
| **Thời gian** | **O(N)** - N là tổng số Node. | **O(V + E)** - V là số Đỉnh, E là số Cạnh. |
| **Không gian (Space)** | **O(H)** - H là chiều cao (chiều sâu lớn nhất) của cây. Tốt hơn bộ nhớ O(W) của BFS nếu cây quá mập mạp. | **O(V)** - Kích thước Stack tối đa lưu vết các đỉnh. |

## Cài đặt DFS cho Đồ thị (Code Example) {#code-example}

Ở bài [Duyệt Cây](/docs/tree-graph/tree-traversal), chúng ta đã dùng Đệ quy để thực hiện DFS. Lần này, ta sẽ dùng **vòng lặp (Iterative)** kết hợp với `Stack<T>` thủ công. Ta cũng sẽ xử lý bài toán khó hơn là **Đồ thị (Graph)** bằng cách thêm mảng `visited` để chống lặp vô hạn.

```csharp
using System.Collections.Generic;

// Đỉnh đồ thị có chứa danh sách kề (Neighbors)
public class GraphNode 
{
    public int Value;
    public List<GraphNode> Neighbors;
    public GraphNode(int val) { Value = val; Neighbors = new List<GraphNode>(); }
}

public void DepthFirstSearch(GraphNode startNode)
{
    if (startNode == null) return;

    // 1. Dùng HashSet để đánh dấu các Node đã thăm
    HashSet<GraphNode> visited = new HashSet<GraphNode>();
    
    // 2. Trái tim của DFS: Stack
    Stack<GraphNode> stack = new Stack<GraphNode>();
    
    stack.Push(startNode);
    visited.Add(startNode);

    while (stack.Count > 0)
    {
        // 3. Rút phần tử trên đỉnh Stack
        GraphNode current = stack.Pop();
        Console.Write(current.Value + " ");

        // 4. Quét qua hàng xóm. Chú ý: Ta duyệt ngược danh sách hàng xóm
        // để khi đẩy vào Stack, hàng xóm đầu tiên sẽ nằm ở Đỉnh Stack (chạy trước).
        for (int i = current.Neighbors.Count - 1; i >= 0; i--)
        {
            GraphNode neighbor = current.Neighbors[i];
            
            // Nếu hàng xóm chưa từng xếp hàng, cho vào Stack
            if (!visited.Contains(neighbor))
            {
                visited.Add(neighbor);
                stack.Push(neighbor);
            }
        }
    }
}
```

:::info DFS bằng Đệ quy vs Vòng lặp
DFS dùng hàm đệ quy (Recursive) viết cực kỳ ngắn và thanh lịch. Tuy nhiên, nếu đồ thị hoặc cây của bạn sâu tới 100,000 tầng, đệ quy sẽ bắn ra lỗi `StackOverflowException` làm sập Server ngay lập tức!
Ngược lại, DFS dùng Stack thủ công (Vòng lặp `while`) sẽ lưu trữ dữ liệu trên vùng nhớ **Heap**. Bộ nhớ Heap rộng lớn tới hàng GigaBytes, vì thế code của bạn sẽ không bao giờ bị Crash dù cây có sâu tới hàng triệu tầng.
:::

## Next Steps {#next-steps}

Đến lúc này, bạn đã trang bị đủ thanh gươm (DFS) và khiên chắn (BFS) để đương đầu với những bài toán cấu trúc Phi tuyến tính.

Để giúp bạn không bị "tẩu hỏa nhập ma" khi nhận đề bài, hãy cùng đến với bài tổng hợp cuối cùng của phần Cấu trúc dữ liệu và Giải thuật: **Tổng hợp: Bảng so sánh và kinh nghiệm làm bài Đồ thị & Cây**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/tree-graph/summary">
    <p class="next-steps-link">Tổng hợp Ứng dụng Cây & Đồ thị</p>
    <p class="next-steps-caption">Bí quyết nhận dạng BFS/DFS và vượt qua bài kiểm tra thuật toán Graph.</p>
  </a>
</div>
