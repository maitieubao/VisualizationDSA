# Duyệt Đồ Thị Theo Chiều Sâu (DFS)

Đồ thị (Graph) là cấu trúc dữ liệu mạnh mẽ nhất để biểu diễn các mạng lưới trong thực tế: Mạng xã hội, Hệ thống đường đi (Bản đồ), Sơ đồ mạng Internet, v.v.

Hai thuật toán cơ bản để khám phá (duyệt) đồ thị là **DFS (Depth-First Search)** và **BFS (Breadth-First Search)**. Bài học này sẽ tập trung vào DFS.

---

## 1. DFS là gì?
Tưởng tượng bạn đang ở trong một mê cung. DFS hoạt động giống hệt cách một người đi lạc tìm lối ra: **"Cứ đi thẳng mãi, đụng tường thì mới quay lại ngã rẽ gần nhất để thử đường khác"**.

* Chữ **Depth (Chiều sâu)** có nghĩa là thuật toán sẽ đi sâu nhất có thể dọc theo một nhánh trước khi quay lui (backtrack).
* Thường được cài đặt cực kỳ thanh lịch bằng **Đệ quy (Recursion)** (sử dụng Call Stack ngầm của máy tính).

---

## 2. Các Bước Hoạt Động (Mã Giả)
Thuật toán luôn bắt đầu tại một đỉnh (node) nguồn `u`. Do đồ thị có thể có chu trình (đi vòng tròn), ta BẮT BUỘC phải dùng một mảng đánh dấu `Visited` để nhớ xem mình đã từng đến đỉnh đó chưa.

```csharp
void DFS(int u) {
    // 1. Đánh dấu u đã thăm
    visited[u] = true;
    InRaManHinh(u);
    
    // 2. Xét tất cả các đỉnh v kề với u
    foreach (int v in AdjacencyList[u]) {
        if (visited[v] == false) { // Nếu v chưa bị thăm
            DFS(v); // Đi tiếp vào v
        }
    }
}
```

### Độ Phức Tạp:
* **Thời gian:** $O(V + E)$ với $V$ là số lượng Đỉnh (Vertices) và $E$ là số lượng Cạnh (Edges). DFS sẽ thăm mỗi đỉnh đúng 1 lần và xét mỗi cạnh 1 (hoặc 2) lần.
* **Không gian:** $O(V)$ cho mảng `Visited` và Call Stack đệ quy (tồi tệ nhất là đồ thị là 1 đường thẳng dài $V$ đỉnh).

---

## 3. Ứng dụng Thực Tế
* **Tìm Connected Components (Thành phần liên thông):** Xác định xem mạng xã hội có bao nhiêu nhóm bạn chơi riêng với nhau.
* **Kiểm tra Chu trình (Cycle Detection):** Ứng dụng trong việc phát hiện Deadlock của hệ điều hành.
* **Topological Sort:** Sắp xếp thứ tự ưu tiên công việc (Việc A phải làm trước Việc B).
* **Giải mê cung (Maze Solver).**

---

## 🎮 Trực Quan Hóa DFS
Ở phần kế tiếp, đồ thị sẽ chạy từng bước. Chú ý các nút đổi màu khi được gọi vào `DFS()` và khi chúng "quay lui" (trở về màu nhạt hơn khi đã duyệt xong mọi ngã rẽ).
