# 🎯 Topological Sort (Sắp xếp tô-pô)

## 1. Động cơ học (Why this matters)
Sắp xếp tô-pô (topological sort) là thuật toán sắp thứ tự các công việc phụ thuộc lẫn nhau — từ lịch học môn trước môn sau, đến thứ tự biên dịch gói trong mọi hệ thống build như make, npm, Maven.

## 2. Lý thuyết cốt lõi
- **DAG (Directed Acyclic Graph):** đồ thị có hướng không chứa chu trình — điều kiện tiên quyết để có thứ tự tô-pô.
- **Sắp xếp tô-pô:** thứ tự tuyến tính của mọi đỉnh sao cho với mỗi cạnh (u, v), đỉnh u luôn đứng trước đỉnh v.
- Mọi DAG có ít nhất một thứ tự tô-pô; đồ thị có chu trình thì không có thứ tự nào.
- Thứ tự tô-pô KHÔNG duy nhất: cùng một DAG thường có nhiều cách sắp xếp hợp lệ.
- Đỉnh có indegree bằng 0 (không cạnh nào đi vào) không có tiền đề nên luôn nằm ở đầu thứ tự.

Quan sát quan trọng: mỗi cạnh chỉ ràng buộc thứ tự tương đối, u phải trước v nhưng khoảng cách giữa chúng tùy ý — vì vậy thứ tự tô-pô thường không duy nhất. Ngược lại, một chu trình tạo quan hệ trước sau mâu thuẫn nên đồ thị có chu trình không có thứ tự tô-pô, và hệ thống build phải báo lỗi dependency.

## 3. Thuật toán từng bước
**Cách 1 — Kahn (indegree + hàng đợi):**
1. Tính indegree của từng đỉnh.
2. Đưa mọi đỉnh có indegree 0 vào hàng đợi.
3. Dequeue đỉnh u, thêm vào kết quả, giảm indegree của mọi đỉnh kề v.
4. Đỉnh nào indegree về 0 thì enqueue.
5. Lặp đến khi hàng đợi rỗng; nếu xử lý được ít hơn V đỉnh thì đồ thị có chu trình.

**Ví dụ:** môn 0 trước môn 1, 2; môn 1, 2 trước môn 3 (cạnh 0→1, 0→2, 1→3, 2→3). Indegree: 0:0, 1:1, 2:1, 3:2. Hàng đợi khởi đầu [0]; xử lý 0 làm indegree của 1, 2 về 0 → [1, 2]; xử lý 1, rồi 2 làm indegree của 3 về 0 → [3]. Kết quả: 0, 1, 2, 3 — 0, 2, 1, 3 cũng hợp lệ.

**Cách 2 — DFS postorder:**
1. Duyệt DFS từ mọi đỉnh chưa thăm, dùng ba trạng thái: 0 chưa thăm, 1 đang trong nhánh, 2 hoàn thành.
2. Sau khi duyệt xong toàn bộ đỉnh kề, thêm đỉnh hiện tại vào mảng kết quả.
3. Đảo ngược mảng để có thứ tự tô-pô.
4. Gặp lại đỉnh trạng thái 1 (back edge) nghĩa là có chu trình.

### Ví dụ
```javascript
function topologicalSort(numCourses, prerequisites) {
  const indegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [u, v] of prerequisites) { // cạnh u truoc v
    adj[u].push(v);
    indegree[v]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i); // khong con tien de
  }
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) {
      indegree[v]--;
      if (indegree[v] === 0) queue.push(v); // du dieu kien vao hang doi
    }
  }
  // neu khong xu ly du V dinh, do thi co chu trinh
  return order.length === numCourses ? order : [];
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Kahn | O(V + E) | Mỗi đỉnh vào hàng đợi 1 lần, mỗi cạnh giảm indegree 1 lần |
| DFS postorder | O(V + E) | Mỗi đỉnh và mỗi cạnh được duyệt đúng 1 lần |

- Bộ nhớ: O(V + E) cho danh sách kề, thêm O(V) cho hàng đợi và indegree (Kahn) hoặc call stack (DFS).
- Đồ thị có chu trình không có thứ tự tô-pô; hãy kiểm tra cycle trước khi dùng kết quả.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Sắp xếp tô-pô chỉ áp dụng cho DAG; chu trình khiến thuật toán không thể xếp hết đỉnh.
- Kahn dùng hàng đợi và indegree; DFS dùng postorder rồi đảo ngược mảng kết quả.
- Cả hai cách đều chạy trong O(V + E) thời gian và bộ nhớ.
- Bẫy thường gặp: quên kiểm tra cycle; nhầm chiều cạnh; ngộ nhận thứ tự là duy nhất.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
