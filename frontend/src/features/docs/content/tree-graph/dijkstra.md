---
title: Thuật toán Dijkstra
description: Tìm đường đi ngắn nhất trên đồ thị có trọng số với thuật toán Dijkstra và cấu trúc dữ liệu Priority Queue cực kỳ tối ưu.
---

# Thuật toán Dijkstra {#dijkstra}

Nếu thuật toán [Tìm kiếm theo chiều rộng (BFS)](/docs/tree-graph/bfs) giúp bạn tìm đường đi ngắn nhất (ít bước nhất) trên một mê cung không có khái niệm khoảng cách, thì **Thuật toán Dijkstra** chính là phiên bản tiến hóa của BFS dành cho thế giới thực.

Trong thế giới thực, các con đường không dài bằng nhau. Từ Hà Nội đi Hải Phòng có thể mất 100km (trọng số 100), trong khi đi Đà Nẵng mất 800km (trọng số 800). Dijkstra giúp chúng ta tìm ra lộ trình tiêu tốn **ít chi phí nhất** (thời gian, khoảng cách, tiền bạc) để đi từ điểm A đến điểm B.

> Thuật toán này được đặt theo tên nhà khoa học máy tính người Hà Lan, Edsger W. Dijkstra, người đã nghĩ ra nó trong vỏn vẹn 20 phút khi đang uống cà phê vào năm 1956.

## Nguyên lý hoạt động {#how-it-works}

Dijkstra hoạt động theo tư tưởng **Tham lam (Greedy)**: Ở mỗi bước, nó luôn chọn đi đến đỉnh (Node) có khoảng cách gần nhất mà nó đã biết, sau đó cập nhật khoảng cách tới các đỉnh lân cận của đỉnh đó.

**Các bước cơ bản:**
1. Khởi tạo khoảng cách từ đỉnh gốc (Start) đến chính nó bằng `0`. Các đỉnh khác bằng Vô cực `∞`.
2. Sử dụng một **Hàng đợi Ưu tiên (Priority Queue / Min Heap)** để lưu trữ các đỉnh đang xét, ưu tiên đỉnh có khoảng cách nhỏ nhất lấy ra trước.
3. Rút đỉnh có khoảng cách nhỏ nhất ra khỏi hàng đợi. Gọi đó là đỉnh `U`.
4. Duyệt qua các đỉnh kề `V` của `U`. Nếu (Khoảng cách đến `U` + Chi phí từ `U` đến `V`) < (Khoảng cách hiện tại của `V`), ta cập nhật lại khoảng cách cho `V` và ném `V` vào Hàng đợi Ưu tiên.
5. Lặp lại bước 3 và 4 cho đến khi Hàng đợi Ưu tiên rỗng (Đã xét hết các đỉnh).

## Dijkstra vs BFS {#dijkstra-vs-bfs}

| Tiêu chí | BFS | Dijkstra |
| :--- | :--- | :--- |
| **Loại đồ thị** | Không trọng số (Đồng nhất) | Có trọng số (Không âm) |
| **Cấu trúc lưu trữ** | `Queue<T>` (FIFO) | `PriorityQueue<T, TPriority>` (Min Heap) |
| **Bản chất** | Tìm số cạnh (bước) ít nhất | Tìm tổng chi phí (trọng số) ít nhất |

*Lưu ý: Dijkstra sẽ **thất bại** nếu đồ thị có trọng số âm (Negative weights). Với trường hợp đó, bạn phải dùng thuật toán Bellman-Ford.*

## Cài đặt bằng C# (Priority Queue) {#code-example}

Kể từ .NET 6, Microsoft đã cung cấp cấu trúc dữ liệu `PriorityQueue<TElement, TPriority>`, giúp việc cài đặt thuật toán Dijkstra trở nên dễ dàng và chuẩn xác hơn bao giờ hết.

```csharp
public class Graph
{
    // Adjacency List: Đỉnh -> Danh sách các (Đỉnh kề, Trọng số)
    private Dictionary<int, List<(int node, int weight)>> adjList = new();

    public void AddEdge(int u, int v, int weight)
    {
        if (!adjList.ContainsKey(u)) adjList[u] = new List<(int, int)>();
        adjList[u].Add((v, weight));
    }

    public int[] Dijkstra(int startNode, int totalNodes)
    {
        // Khởi tạo mảng khoảng cách bằng Vô cực (int.MaxValue)
        int[] distances = new int[totalNodes];
        Array.Fill(distances, int.MaxValue);
        distances[startNode] = 0;

        // Khởi tạo PriorityQueue (Phần tử là đỉnh, Độ ưu tiên là khoảng cách)
        var pq = new PriorityQueue<int, int>();
        pq.Enqueue(startNode, 0);

        while (pq.Count > 0)
        {
            // Lấy ra đỉnh có khoảng cách NHỎ NHẤT hiện tại
            pq.TryDequeue(out int u, out int currentDist);

            // Tối ưu: Nếu tìm thấy đường đi dài hơn khoảng cách đã ghi nhận, bỏ qua
            if (currentDist > distances[u]) continue;

            if (!adjList.ContainsKey(u)) continue;

            // Xét các đỉnh kề của u
            foreach (var edge in adjList[u])
            {
                int v = edge.node;
                int weight = edge.weight;

                // Nếu tìm thấy đường đi NGẮN HƠN tới v
                if (distances[u] + weight < distances[v])
                {
                    distances[v] = distances[u] + weight;
                    // Đẩy v vào hàng đợi với độ ưu tiên mới
                    pq.Enqueue(v, distances[v]);
                }
            }
        }

        return distances;
    }
}
```

## Độ phức tạp (Complexity) {#complexity}

Với việc sử dụng `PriorityQueue` (dựa trên Heap), độ phức tạp thuật toán cực kỳ tối ưu:

- **Thời gian:** $O((V + E) \log V)$ trong đó $V$ là số lượng Đỉnh (Vertices) và $E$ là số lượng Cạnh (Edges). Khâu rút đỉnh từ Heap mất $O(\log V)$.
- **Không gian:** $O(V + E)$ để lưu trữ đồ thị (Adjacency List) và $O(V)$ cho mảng khoảng cách và Priority Queue. Tổng là $O(V + E)$.

<details class="vt-quiz">
<summary>📝 Kiểm tra nhanh: Tại sao không dùng thuật toán Dijkstra cho bản đồ có "đường tắt thời gian" (trọng số âm)?</summary>

**Đáp án:** Dijkstra giả định rằng "đi càng nhiều bước thì tổng quãng đường chỉ có thể TĂNG LÊN hoặc không đổi (vì trọng số >= 0)". Nhờ giả định này, khi một đỉnh được rút ra khỏi hàng đợi ưu tiên, nó chốt luôn kết quả ngắn nhất cho đỉnh đó. Nếu có trọng số âm, việc đi thêm một bước có thể làm tổng chi phí GIẢM XUỐNG, phá vỡ hoàn toàn nguyên lý Tham lam (Greedy) của Dijkstra, dẫn đến việc bỏ sót đường đi ngắn hơn.
</details>

## Next Steps {#next-steps}

Thuật toán đồ thị là xương sống của mọi hệ thống bản đồ (Google Maps), định tuyến mạng (Routing), và logic AI. Hãy bật Sandbox bên phải để quan sát Dijkstra lan tỏa tìm đường đi ngắn nhất. Tiếp theo, chúng ta sẽ bước sang một chương mới, khám phá các khái niệm nâng cao trong lập trình Kiến trúc.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/oop/summary">
    <p class="next-steps-link">Trở về OOP</p>
    <p class="next-steps-caption">Bắt đầu học nguyên lý thiết kế Kiến trúc phần mềm.</p>
  </a>
</div>
