# 🎯 DP Patterns (Interval, Bitmask, Tree DP)

## 1. Động cơ học
Một bài toán DP khó thường không chỉ là tìm đúng công thức truy hồi, mà còn là chọn đúng **hình dạng trạng thái**: mảng 1 chiều, bảng 2 chiều, khoảng trên dãy, hay tập con các phần tử. Khi gặp bài toán chia chuỗi bóng bay, tối ưu hành trình qua tập thành phố, hay đếm đường đi trên cây, các pattern Interval DP, Bitmask DP và Tree DP xuất hiện lặp đi lặp lại trong phỏng vấn nâng cao và các kỳ thi lập trình thi đấu. Bài này trang bị cho bạn bộ khuôn mẫu nhận diện và khung giải cho cả ba họ bài toán đó.

## 2. Lý thuyết cốt lõi
- **Interval DP**: trạng thái là `dp[i][j]` — kết quả tối ưu của đoạn liên tiếp từ i đến j. Recurrence thường chọn một điểm chia k giữa i và j, cộng hai bài toán con rồi gộp chi phí.
- **Bitmask DP**: trạng thái là `dp[mask]` trong đó mask là số nguyên biểu diễn tập hợp các phần tử đã dùng (bit thứ bật nghĩa là phần tử đó đã được chọn). Chỉ khả thi khi số phần tử n ≤ 20 vì có 2^n trạng thái.
- **Tree DP**: trạng thái gắn với node trên cây — `dp[node]` phụ thuộc vào kết quả của các node con; duyệt postorder để tính con trước rồi mới gộp lên cha.
- Điểm chung của cả ba: vẫn cần overlapping subproblems và optimal substructure — nếu không có hai tính chất đó thì không phải DP.

Interval DP mô hình hóa các bài toán mà thao tác xảy ra trên một khoảng và thứ tự xử lý giữa trong ra ngoài: burst balloons chọn quả bóng bị nổ cuối cùng trong đoạn, matrix chain chọn vị trí cắt phép nhân. Bitmask DP xử lý các bài toán hoán vị hoặc chia nhóm mà thứ tự xử lý ảnh hưởng kết quả: shortest Hamiltonian path, chia tập thành các nhóm cân bằng. Tree DP khai thác cấu trúc phân cấp tự nhiên: đường đi lớn nhất trong cây, chọn node sao cho tổng giá trị lớn nhất mà không chọn hai node kề nhau (house robber III).

## 3. Ý tưởng chính từng bước
1. Xác định hình dạng trạng thái: khoảng (i, j) / tập con (mask) / node (u).
2. Viết recurrence:
   - Interval: `dp[i][j] = max(dp[i][k] + dp[k+1][j] + cost)` với k chạy từ i đến j-1.
   - Bitmask: `dp[mask] = min(dp[mask without bit b] + cost(last, b))` — thêm phần tử b vào cuối hành trình.
   - Tree: `dp[u] = f(dp[child1], dp[child2], ...)` gộp từ con lên cha.
3. Xác định base case: đoạn dài 1, mask chỉ 1 bit, node lá.
4. Duyệt theo thứ tự đảm bảo bài toán con tính trước: khoảng tăng dần độ dài; mask tăng dần giá trị; cây duyệt postorder.

Ví dụ Interval — burst balloons với mảng [3, 1, 5]: mỗi lần nổ một quả thu điểm bằng tích giá trị quả đó với hai hàng xóm hiện tại. Thay vì mô phỏng thứ tự nổ, ta đảo ngược tư duy: chọn quả bóng **nổ cuối cùng** trong đoạn — khi đó hai bên đã bị nổ hết nên chi phí chỉ còn tích với biên ngoài đoạn. Chọn quả 1 nổ cuối: chi phí 3×1×5 = 15 cộng hai đoạn con rỗng, tổng 15; chọn quả 3 nổ cuối: đoạn trái [1,5] tối ưu là 5 rồi nổ 3 với biên 1×3×1... cách quy hoạch khoảng cho phép thử mọi phương án trong O(n³).

Ví dụ Bitmask — bài toán người bán hàng nhỏ (travelling salesman): với 4 thành phố, `dp[mask][last]` lưu chi phí thấp nhất đi qua đúng tập mask và kết thúc tại last. Từ mask 0001 (chỉ ở thành phố 0), mở rộng dần từng bit, mỗi bước thử mọi thành phố chưa đi. Độ phức tạp O(2^n × n²) — chấp nhận với n ≤ 20.

Ví dụ Tree DP — house robber III: mỗi node chọn đánh cắp (không được cướp con) hoặc không đánh cắp (có thể cướp con). Với mỗi node lưu cặp (không-cướp, cướp): không-cướp = tổng max của cặp con; cướp = giá trị node + tổng không-cướp của con. Kết quả là max của cặp tại gốc.

### Ví dụ
```javascript
// Interval DP: tối đa điểm nổ bóng (burst balloons) — chọn quả nổ cuối
function maxCoins(nums) {
  const n = nums.length;
  const val = [1, ...nums, 1];       // thêm biên 1 hai đầu
  const dp = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0));
  for (let len = 1; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      for (let k = i; k <= j; k++) {
        dp[i][j] = Math.max(
          dp[i][j],
          dp[i][k - 1] + val[i - 1] * val[k] * val[j + 1] + dp[k + 1][j]
        );
      }
    }
  }
  return dp[1][n];
}

// Bitmask DP: đường đi ngắn nhất qua mọi thành phố (TSP nhỏ, n <= 20)
function tspMin(dist) {
  const n = dist.length;
  const size = 1 << n;
  const dp = Array.from({ length: size }, () => Array(n).fill(Infinity));
  dp[1][0] = 0; // bắt đầu từ thành phố 0
  for (let mask = 1; mask < size; mask++) {
    for (let last = 0; last < n; last++) {
      if (!(mask & (1 << last))) continue;
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;
        dp[mask | (1 << next)][next] = Math.min(
          dp[mask | (1 << next)][next],
          dp[mask][last] + dist[last][next]
        );
      }
    }
  }
  return Math.min(...dp[size - 1]);
}

// Tree DP: house robber III — dp[u] = [khong-cuop, cuop]
function robTree(root) {
  function dfs(node) {
    if (!node) return [0, 0];
    const l = dfs(node.left);
    const r = dfs(node.right);
    const notRob = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    const rob = node.val + l[0] + r[0];
    return [notRob, rob];
  }
  const res = dfs(root);
  return Math.max(res[0], res[1]);
}
```

## 4. Độ phức tạp & so sánh
| Pattern | Trạng thái | Độ phức tạp | Dùng khi |
| :--- | :--- | :--- | :--- |
| Interval DP | dp[i][j] | O(n³) điển hình | Thao tác trên đoạn, chia trong ra ngoài |
| Bitmask DP | dp[mask] | O(2^n × n²) | Tập con, n ≤ 20, thứ tự ảnh hưởng |
| Tree DP | dp[node] | O(n) | Kết quả gộp từ node con |

- Bộ nhớ: O(n²) cho Interval, O(2^n × n) cho Bitmask, O(n) cho Tree.
- Chọn đúng pattern giảm thời gian suy nghĩ và tránh recurrence sai hình dạng.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Interval DP dùng dp[i][j] cho đoạn liên tục, chia điểm k ở giữa — nhớ tư duy đảo ngược (chọn thao tác cuối cùng).
- Bitmask DP dùng số nguyên làm tập hợp, giới hạn n ≤ 20, mở rộng từng bit.
- Tree DP gộp kết quả từ con lên cha theo postorder.
- Bẫy thường gặp: dùng Interval DP cho bài không có tính khoảng, dùng Bitmask khi n quá lớn (2^n bùng nổ), quên base case hoặc duyệt sai thứ tự khiến bài toán con chưa tính xong.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
