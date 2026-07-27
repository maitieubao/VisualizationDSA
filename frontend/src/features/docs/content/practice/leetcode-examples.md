---
title: Giải mẫu 6 bài toán LeetCode
description: Áp dụng kiến thức thuật toán và cấu trúc dữ liệu để "đè bẹp" 6 bài toán kinh điển nhất trên nền tảng LeetCode bằng C#.
---

# Giải mẫu 6 bài toán LeetCode Kinh điển {#leetcode-examples}

Bạn đã học xong lý thuyết (Big O, Sorting, Searching, Stack, Queue, Tree, Graph). Giờ là lúc mang vũ khí ra chiến trường! **LeetCode** là nền tảng luyện tập thuật toán phổ biến nhất thế giới, được hầu hết các tập đoàn công nghệ lớn (FAANG) sử dụng để phỏng vấn ứng viên.

Dưới đây là 6 bài toán "Kinh điển của Kinh điển", bao phủ các dạng kỹ thuật quan trọng nhất mà bạn bắt buộc phải biết giải.

---

## 1. Two Sum (Bài số 1) {#two-sum}
**Dạng bài:** Mảng (Array), Bảng băm (Hash Table)
**Độ khó:** Dễ

**Đề bài:** Cho một mảng các số nguyên `nums` và một số nguyên `target`. Hãy trả về *chỉ số (index)* của 2 số trong mảng có tổng bằng `target`. Chắc chắn luôn có 1 đáp án duy nhất.

**Phân tích:** 
- Cách trâu bò (Brute Force): Dùng 2 vòng lặp lồng nhau $O(N^2)$. Quá chậm!
- Cách tối ưu: Dùng `Dictionary` (Hash Table) để lưu trữ giá trị đã duyệt. Với mỗi số `x`, ta tìm xem `target - x` đã có trong Dictionary chưa.

**Code C#:**
```csharp
public int[] TwoSum(int[] nums, int target) 
{
    // Dictionary lưu { Giá trị số : Vị trí (Index) }
    Dictionary<int, int> dict = new Dictionary<int, int>();
    
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i]; // Số còn thiếu
        
        // Tìm thấy mảnh ghép!
        if (dict.ContainsKey(complement))
        {
            return new int[] { dict[complement], i };
        }
        
        // Nếu chưa thấy, lưu số này vào từ điển để các số sau tìm kiếm
        // Dùng TryAdd để tránh lỗi nếu mảng có phần tử trùng lặp
        dict.TryAdd(nums[i], i);
    }
    
    return new int[0];
}
```
**Độ phức tạp:** Thời gian $O(N)$, Không gian $O(N)$.

---

## 2. Valid Parentheses (Bài số 20) {#valid-parentheses}
**Dạng bài:** Ngăn xếp (Stack)
**Độ khó:** Dễ

**Đề bài:** Cho một chuỗi `s` chỉ chứa các ký tự `'('`, `')'`, `'{'`, `'}'`, `'['` và `']'`. Kiểm tra xem chuỗi có hợp lệ hay không (Mở ngoặc nào phải đóng đúng ngoặc đó).

**Phân tích:**
Bất cứ khi nào bài toán yêu cầu kiểm tra tính đối xứng, ghép cặp đóng/mở theo thứ tự đảo ngược, hãy nghĩ ngay đến **Stack (LIFO)**.

**Code C#:**
```csharp
public bool IsValid(string s) 
{
    Stack<char> stack = new Stack<char>();
    
    foreach (char c in s)
    {
        // Gặp ngoặc mở -> Đẩy ngoặc ĐÓNG TƯƠNG ỨNG vào Stack
        if (c == '(') stack.Push(')');
        else if (c == '{') stack.Push('}');
        else if (c == '[') stack.Push(']');
        // Gặp ngoặc đóng -> Kiểm tra xem có khớp với đỉnh Stack không
        else
        {
            if (stack.Count == 0 || stack.Pop() != c)
            {
                return false;
            }
        }
    }
    
    // Nếu Stack rỗng nghĩa là mọi ngoặc đã được ghép cặp hoàn hảo
    return stack.Count == 0;
}
```
**Độ phức tạp:** Thời gian $O(N)$, Không gian $O(N)$.

---

## 3. Maximum Subarray (Bài số 53) {#max-subarray}
**Dạng bài:** Mảng (Array), Quy hoạch động (Dynamic Programming), Kadane's Algorithm
**Độ khó:** Trung bình

**Đề bài:** Cho mảng số nguyên `nums`. Tìm một mảng con liên tiếp (chứa ít nhất 1 số) có tổng lớn nhất và trả về tổng đó.

**Phân tích:**
Đây là nơi thuật toán **Kadane** tỏa sáng rực rỡ. Ý tưởng của Kadane: Tại mỗi bước `i`, bạn phải đưa ra lựa chọn: "Kéo dài mảng con hiện tại bằng cách cộng thêm `nums[i]`" HAY "Vứt bỏ quá khứ đau thương, bắt đầu một mảng con hoàn toàn mới từ chính `nums[i]`". Bạn sẽ chọn phương án nào cho tổng lớn hơn!

**Code C#:**
```csharp
public int MaxSubArray(int[] nums) 
{
    int currentSum = nums[0];
    int maxSum = nums[0];
    
    for (int i = 1; i < nums.Length; i++)
    {
        // So sánh: Cộng dồn vs Làm lại từ đầu
        currentSum = Math.Max(nums[i], currentSum + nums[i]);
        
        // Cập nhật kỷ lục
        maxSum = Math.Max(maxSum, currentSum);
    }
    
    return maxSum;
}
```
**Độ phức tạp:** Thời gian $O(N)$, Không gian $O(1)$.

---

## 4. Number of Islands (Bài số 200) {#number-of-islands}
**Dạng bài:** Ma trận (Matrix), Đồ thị (Graph), DFS / BFS
**Độ khó:** Trung bình

**Đề bài:** Cho một ma trận 2D chứa ký tự `'1'` (Đất liền) và `'0'` (Nước). Một hòn đảo là các vùng đất liền kết nối với nhau theo chiều ngang hoặc dọc. Đếm số lượng hòn đảo.

**Phân tích:**
Đây là bài toán tìm Số thành phần liên thông (Connected Components). Thuật toán: Duyệt qua từng ô. Nếu gặp `'1'`, tăng biến đếm Đảo lên 1. Sau đó gọi hàm **DFS (Duyệt theo chiều sâu)** để loang ra xung quanh, biến tất cả `'1'` kề nó thành `'0'` (Đánh chìm hòn đảo để tránh đếm trùng ở vòng lặp sau).

**Code C#:**
```csharp
public int NumIslands(char[][] grid) 
{
    if (grid == null || grid.Length == 0) return 0;
    
    int numIslands = 0;
    int rows = grid.Length;
    int cols = grid[0].Length;
    
    for (int r = 0; r < rows; r++)
    {
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] == '1')
            {
                numIslands++;
                DFS(grid, r, c); // Đánh chìm toàn bộ hòn đảo này
            }
        }
    }
    
    return numIslands;
}

private void DFS(char[][] grid, int r, int c)
{
    int rows = grid.Length;
    int cols = grid[0].Length;
    
    // Kiểm tra ranh giới và kiểm tra xem có phải Đất liền không
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0')
        return;
        
    // Đánh chìm (Sửa '1' thành '0')
    grid[r][c] = '0';
    
    // Loang ra 4 hướng: Lên, Xuống, Trái, Phải
    DFS(grid, r - 1, c);
    DFS(grid, r + 1, c);
    DFS(grid, r, c - 1);
    DFS(grid, r, c + 1);
}
```
**Độ phức tạp:** Thời gian $O(M \times N)$, Không gian $O(M \times N)$ cho Call Stack (Đệ quy).

---

## 5. Merge Intervals (Bài số 56) {#merge-intervals}
**Dạng bài:** Sắp xếp (Sorting), Tham lam (Greedy)
**Độ khó:** Trung bình

**Đề bài:** Cho một mảng các khoảng thời gian (intervals), gộp tất cả các khoảng thời gian bị chồng chéo lên nhau.
Ví dụ: `[[1,3], [2,6], [8,10]]` => Gộp thành `[[1,6], [8,10]]`.

**Phân tích:**
Bạn không thể gộp một mảng lộn xộn. Nguyên tắc vàng của bài toán dạng khoảng (Interval) là: **Phải SẮP XẾP chúng theo thứ tự điểm bắt đầu trước!** Sau khi sắp xếp, bạn chỉ cần so sánh điểm kết thúc của khoảng trước với điểm bắt đầu của khoảng sau để xem chúng có giao nhau không.

**Code C#:**
```csharp
public int[][] Merge(int[][] intervals) 
{
    if (intervals.Length <= 1) return intervals;
    
    // Sắp xếp các đoạn dựa trên phần tử đầu tiên (Start point)
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    
    List<int[]> merged = new List<int[]>();
    int[] currentInterval = intervals[0];
    merged.Add(currentInterval);
    
    foreach (var interval in intervals)
    {
        int currentEnd = currentInterval[1];
        int nextBegin = interval[0];
        int nextEnd = interval[1];
        
        // Nếu chồng chéo (End của đoạn này >= Begin của đoạn kia)
        if (currentEnd >= nextBegin)
        {
            // Gộp lại bằng cách lấy End lớn nhất
            currentInterval[1] = Math.Max(currentEnd, nextEnd);
        }
        else
        {
            // Không chồng chéo, thêm đoạn mới vào kết quả
            currentInterval = interval;
            merged.Add(currentInterval);
        }
    }
    
    return merged.ToArray();
}
```
**Độ phức tạp:** Thời gian $O(N \log N)$ (vì phải Sorting), Không gian $O(N)$ (Lưu kết quả).

---

## 6. Course Schedule (Bài số 207) {#course-schedule}
**Dạng bài:** Đồ thị (Graph), DFS, Sắp xếp Topo (Topological Sort)
**Độ khó:** Trung bình

**Đề bài:** Bạn phải hoàn thành `numCourses` khóa học. Một số khóa học có yêu cầu tiên quyết, ví dụ muốn học khóa 0 phải học khóa 1 trước, biểu diễn là `[0, 1]`. Cho danh sách các yêu cầu tiên quyết, kiểm tra xem bạn có thể hoàn thành tất cả các khóa học không?

**Phân tích:**
Đây là bài toán tìm **Chu trình (Cycle)** trong đồ thị có hướng. Nếu khóa A yêu cầu khóa B, khóa B yêu cầu khóa C, và khóa C lại yêu cầu khóa A -> Bạn bị kẹt trong một vòng luẩn quẩn (Deadlock) và không bao giờ tốt nghiệp được!
Thuật toán: Xây dựng đồ thị (Adjacency List). Dùng DFS để duyệt. Dùng một mảng trạng thái để đánh dấu: `0` (Chưa thăm), `1` (Đang thăm - nằm trong nhánh đệ quy hiện tại), `2` (Đã thăm xong an toàn). Nếu DFS chạm vào một node đang có trạng thái `1`, tức là đã phát hiện Chu trình!

**Code C#:**
```csharp
public bool CanFinish(int numCourses, int[][] prerequisites) 
{
    // Xây dựng đồ thị (Danh sách kề)
    List<int>[] graph = new List<int>[numCourses];
    for (int i = 0; i < numCourses; i++) graph[i] = new List<int>();
    
    foreach (var pre in prerequisites)
    {
        graph[pre[1]].Add(pre[0]); // pre[1] phải học trước pre[0]
    }
    
    // Mảng trạng thái: 0 = Chưa thăm, 1 = Đang thăm, 2 = Đã thăm an toàn
    int[] state = new int[numCourses];
    
    for (int i = 0; i < numCourses; i++)
    {
        if (state[i] == 0)
        {
            if (HasCycleDFS(graph, state, i))
                return false; // Nếu có chu trình -> Không thể hoàn thành
        }
    }
    
    return true; // Không có chu trình nào
}

private bool HasCycleDFS(List<int>[] graph, int[] state, int node)
{
    if (state[node] == 1) return true;  // Đụng trúng node ĐANG thăm -> Có chu trình!
    if (state[node] == 2) return false; // Đã thăm an toàn từ trước -> Bỏ qua
    
    state[node] = 1; // Đánh dấu ĐANG thăm
    
    foreach (int neighbor in graph[node])
    {
        if (HasCycleDFS(graph, state, neighbor))
            return true;
    }
    
    state[node] = 2; // Đánh dấu ĐÃ thăm xong an toàn
    return false;
}
```
**Độ phức tạp:** Thời gian $O(V + E)$ (Duyệt toàn bộ đỉnh và cạnh), Không gian $O(V + E)$ để lưu đồ thị.

## Next Steps {#next-steps}

Chúc mừng bạn đã chinh phục 6 bài toán cốt lõi. Hãy mang hành trang này lên nền tảng LeetCode và tự rèn luyện thêm. Ở bài viết cuối cùng tiếp theo, chúng ta sẽ nhìn lại toàn bộ hành trình và thiết lập mục tiêu cho tương lai.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/practice/final-roadmap">
    <p class="next-steps-link">Tổng kết Lộ trình</p>
    <p class="next-steps-caption">Bức tranh toàn cảnh và con đường trở thành Senior.</p>
  </a>
</div>
