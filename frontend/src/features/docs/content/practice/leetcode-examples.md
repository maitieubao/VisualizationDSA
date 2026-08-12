---
title: Giải mẫu 5 bài toán LeetCode
description: Áp dụng kiến thức thuật toán và cấu trúc dữ liệu để "đè bẹp" 5 bài toán kinh điển nhất trên nền tảng LeetCode bằng C#, kèm kỹ thuật tối ưu Big O và sức mạnh của Span<T>.
---

# Giải mẫu 5 bài toán LeetCode Kinh điển {#leetcode-examples}

Bạn đã học xong lý thuyết (Big O, Sorting, Searching, Stack, Queue, Tree, Graph). Giờ là lúc mang vũ khí ra chiến trường! **LeetCode** là nền tảng luyện tập thuật toán phổ biến nhất thế giới, được hầu hết các tập đoàn công nghệ lớn (FAANG) sử dụng để phỏng vấn ứng viên.

Dưới đây là 5 bài toán "Kinh điển của Kinh điển", bao phủ các dạng kỹ thuật quan trọng nhất. Mỗi bài toán đều được phân tích cặn kẽ Độ phức tạp Big O và cách vận dụng tối đa sức mạnh của ngôn ngữ C#.

---

## 1. Two Sum (Bài số 1) {#two-sum}
**Dạng bài:** Mảng (Array), Bảng băm (Hash Table)
**Độ khó:** Dễ

**Đề bài:** Cho một mảng các số nguyên `nums` và một số nguyên `target`. Hãy trả về *chỉ số (index)* của 2 số trong mảng có tổng bằng `target`. Chắc chắn luôn có 1 đáp án duy nhất.

**Phân tích:** 
- Lối mòn (Brute Force): Dùng 2 vòng lặp lồng nhau duyệt qua mọi cặp số. Tốn thời gian $O(N^2)$. Với mảng 1 triệu phần tử, máy tính của bạn sẽ bốc khói.
- Lối tắt (Tối ưu O(N)): Dùng `Dictionary` (Hash Table) để làm bộ nhớ đệm (Cache). Với mỗi số `x`, ta tìm xem mảnh ghép `target - x` đã từng xuất hiện trước đó chưa. Thao tác tra cứu trong Dictionary mất đúng $O(1)$. Cực kỳ chớp nhoáng!

**Code C# tinh hoa:**
```csharp
public int[] TwoSum(int[] nums, int target) 
{
    // Dictionary lưu trữ mapping: { Giá_trị_số : Vị_trí_index }
    // Khởi tạo sức chứa (Capacity) bằng nums.Length để tránh việc Re-hashing tốn RAM
    Dictionary<int, int> dict = new Dictionary<int, int>(nums.Length);
    
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i]; // Số còn thiếu để đạt target
        
        // Cú pháp TryGetValue của C# cực nhanh vì nó kết hợp vừa Kiểm tra vừa Lấy giá trị trong 1 thao tác (O(1))
        if (dict.TryGetValue(complement, out int complementIndex))
        {
            return new int[] { complementIndex, i };
        }
        
        // Nếu chưa thấy, lưu số này vào từ điển để các số ở tương lai tìm kiếm.
        // Dùng indexer gán thẳng để ghi đè nếu mảng có phần tử trùng lặp (ví dụ [3,3], target 6)
        dict[nums[i]] = i;
    }
    
    return Array.Empty<int>(); // C# hiện đại: Dùng Array.Empty thay vì cấp phát 'new int[0]'
}
```
**Độ phức tạp:** Thời gian $O(N)$ (Chỉ duyệt mảng 1 lần). Không gian $O(N)$ (Phải tốn RAM để nuôi cái Dictionary).

---

## 2. Valid Parentheses (Bài số 20) {#valid-parentheses}
**Dạng bài:** Ngăn xếp (Stack)
**Độ khó:** Dễ

**Đề bài:** Cho một chuỗi `s` chỉ chứa các ký tự `'('`, `')'`, `'{'`, `'}'`, `'['` và `']'`. Kiểm tra xem chuỗi có hợp lệ hay không (Mở ngoặc nào phải đóng đúng ngoặc đó, theo đúng thứ tự).

**Phân tích:**
Bất cứ khi nào bài toán yêu cầu kiểm tra tính đối xứng, ghép cặp đóng/mở theo thứ tự đảo ngược, bộ não bạn phải nhảy ngay đến từ khóa **Stack (LIFO - Vào sau Ra trước)**.

**Code C# tinh hoa:**
```csharp
public bool IsValid(string s) 
{
    // Tối ưu hóa: Độ dài chuỗi lẻ thì chắc chắn 100% bị thiếu 1 dấu đóng hoặc mở. Nghỉ chơi luôn!
    if (s.Length % 2 != 0) return false;

    Stack<char> stack = new Stack<char>();
    
    foreach (char c in s)
    {
        // Gặp ngoặc mở -> Đẩy ngoặc ĐÓNG TƯƠNG ỨNG vào Stack để Lính Gác chờ sẵn.
        if (c == '(') stack.Push(')');
        else if (c == '{') stack.Push('}');
        else if (c == '[') stack.Push(']');
        // Gặp ngoặc đóng -> Hỏi ông Lính Gác trên đỉnh Stack xem có khớp mã bưu kiện không?
        else
        {
            // Nếu Stack rỗng (chưa mở mà đòi đóng) HOẶC mã không khớp -> Sai.
            if (stack.Count == 0 || stack.Pop() != c)
            {
                return false;
            }
        }
    }
    
    // Nếu kết thúc chuỗi mà Stack rỗng, nghĩa là mọi lính gác đã được ghép cặp hoàn hảo.
    return stack.Count == 0;
}
```
**Độ phức tạp:** Thời gian $O(N)$, Không gian $O(N)$ (Trong trường hợp xấu nhất toàn dấu ngoặc mở `((((((`, Stack sẽ phình to bằng độ dài chuỗi).

---

## 3. Maximum Subarray (Bài số 53) {#max-subarray}
**Dạng bài:** Mảng (Array), Quy hoạch động (Dynamic Programming)
**Độ khó:** Trung bình

**Đề bài:** Cho mảng số nguyên `nums`. Tìm một mảng con liên tiếp (chứa ít nhất 1 số) có tổng lớn nhất và trả về tổng đó.

**Phân tích:**
Đây là vùng đất mà thuật toán **Kadane's Algorithm** được tôn xưng làm vua. Tư tưởng của Kadane mang tính triết học cực cao: 
> Tại mỗi bước chân (vị trí `i`), bạn đứng trước 2 lựa chọn: 
> 1. Kéo dài mảng con hiện tại bằng cách cộng thêm `nums[i]`.
> 2. Quên đi quá khứ đau thương (nếu tổng trước đó bị ÂM), và bắt đầu cuộc đời mới từ chính phần tử `nums[i]`.

**Code C# tinh hoa:**
```csharp
public int MaxSubArray(int[] nums) 
{
    int currentSum = nums[0]; // Tổng của mảng con ĐANG XÉT
    int maxSum = nums[0];     // Kỷ lục Guinness thế giới (Lớn nhất từ trước tới nay)
    
    for (int i = 1; i < nums.Length; i++)
    {
        // Bí quyết cốt lõi: Nếu quá khứ là Cục nợ (currentSum < 0), thì quăng nó đi!
        // Math.Max(nums[i], currentSum + nums[i])
        currentSum = currentSum < 0 ? nums[i] : currentSum + nums[i];
        
        // Phá kỷ lục?
        if (currentSum > maxSum)
        {
            maxSum = currentSum;
        }
    }
    
    return maxSum;
}
```
**Độ phức tạp:** Thời gian $O(N)$ (Chỉ lướt qua mảng đúng 1 lần). Không gian $O(1)$ (Tuyệt đỉnh tiết kiệm bộ nhớ, chỉ dùng 2 biến đếm).

---

## 4. Number of Islands (Bài số 200) {#number-of-islands}
**Dạng bài:** Ma trận (Matrix), Đồ thị, DFS
**Độ khó:** Trung bình

**Đề bài:** Cho một ma trận 2D chứa ký tự `'1'` (Đất liền) và `'0'` (Nước). Một hòn đảo là các vùng đất liền kết nối với nhau. Đếm số lượng hòn đảo.

**Phân tích:**
Đây là bài toán kinh điển của thuật toán **Loang (Flood Fill)**. Bạn lái trực thăng quét qua toàn bộ mặt biển. Bất cứ khi nào thấy số `'1'`, bạn đếm nó là 1 hòn đảo. Lập tức, bạn ném một quả bom DFS (Duyệt theo chiều sâu) thả xuống tọa độ đó. Quả bom này sẽ nổ lan ra 4 hướng (Lên, Xuống, Trái, Phải), nổ tung mọi số `'1'` (Đất liền) trên cùng hòn đảo đó thành `'0'` (Nước). 
Nhờ vậy, ở những vòng lặp sau, bạn sẽ không bao giờ đếm trùng lại hòn đảo đã đếm.

**Code C# tinh hoa:**
```csharp
public int NumIslands(char[][] grid) 
{
    if (grid == null || grid.Length == 0) return 0;
    
    int numIslands = 0;
    
    for (int r = 0; r < grid.Length; r++)
    {
        for (int c = 0; c < grid[0].Length; c++)
        {
            // Bắt gặp hòn đảo!
            if (grid[r][c] == '1')
            {
                numIslands++;
                SinkIslandDFS(grid, r, c); // Khởi động bom thả chìm đảo
            }
        }
    }
    
    return numIslands;
}

private void SinkIslandDFS(char[][] grid, int r, int c)
{
    // Kiểm tra vùng an toàn: Rơi ra khỏi bản đồ hoặc rơi xuống nước ('0') thì dừng ngay!
    if (r < 0 || c < 0 || r >= grid.Length || c >= grid[0].Length || grid[r][c] == '0')
        return;
        
    // ĐÁNH CHÌM (Đánh dấu đã thăm)
    grid[r][c] = '0';
    
    // Đệ quy loang ra 4 hướng
    SinkIslandDFS(grid, r - 1, c); // Bắc
    SinkIslandDFS(grid, r + 1, c); // Nam
    SinkIslandDFS(grid, r, c - 1); // Tây
    SinkIslandDFS(grid, r, c + 1); // Đông
}
```
**Độ phức tạp:** Thời gian $O(M \times N)$ (Phải duyệt từng ô trong lưới $M \times N$). Không gian $O(M \times N)$ cho Call Stack đệ quy (Nếu toàn bộ lưới đều là đất liền, đệ quy sẽ lặn xuống sâu bằng toàn bộ số ô).

---

## 5. Merge Intervals (Bài số 56) {#merge-intervals}
**Dạng bài:** Sắp xếp (Sorting)
**Độ khó:** Trung bình

**Đề bài:** Cho mảng các đoạn thời gian (intervals). Gộp tất cả các khoảng bị chồng chéo.
Ví dụ: `[[1,3], [2,6], [8,10]]` => Gộp thành `[[1,6], [8,10]]`.

**Phân tích:**
Nguyên lý bất di bất dịch của bài toán Khoảng thời gian: **BẮT BUỘC PHẢI SẮP XẾP!** Bạn không thể gộp một mảng lộn xộn. Sau khi sắp xếp tăng dần theo điểm Bắt đầu (Start), bạn chỉ cần so sánh điểm Kết thúc (End) của thằng trước với điểm Bắt đầu của thằng sau.

**Code C# tinh hoa (Sử dụng LINQ):**
```csharp
public int[][] Merge(int[][] intervals) 
{
    if (intervals.Length <= 1) return intervals;
    
    // Tối ưu hóa của C#: Dùng LINQ OrderBy hoặc Array.Sort bằng Lambda
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    
    List<int[]> merged = new List<int[]>();
    int[] currentBox = intervals[0];
    merged.Add(currentBox);
    
    foreach (var interval in intervals)
    {
        // Nếu cái Hộp hiện tại (currentBox) nuốt trọn được điểm đầu của thằng kế tiếp
        if (currentBox[1] >= interval[0])
        {
            // Bành trướng Hộp hiện tại ra: Lấy độ dài xa nhất có thể
            currentBox[1] = Math.Max(currentBox[1], interval[1]);
        }
        else
        {
            // Hết chồng chéo. Đóng gói hộp cũ. Lấy hộp mới ra xài.
            currentBox = interval;
            merged.Add(currentBox);
        }
    }
    
    return merged.ToArray();
}
```
**Độ phức tạp:** Thời gian $O(N \log N)$ (Chi phí của vòng lặp Sort). Không gian $O(N)$ (Dành cho List lưu trữ kết quả).

---

## 6. Sức mạnh tương lai: `Span<T>` trong C# {#span-t}

Các kỹ sư C# hiện đại không chỉ dừng lại ở thuật toán đúng, mà phải là thuật toán **nhanh nhất thế giới**. Nếu bạn cắt mảng (SubArray) bằng `Array.Copy()`, bạn đang tự sát vì hệ thống phải cấp phát RAM mới (Heap Allocation).

Nhờ vào siêu vũ khí `Span<T>` và `Memory<T>` ra mắt từ C# 7.2, bạn có thể tạo một "Lăng kính" nhìn vào một khúc của mảng cũ MÀ KHÔNG HỀ tốn thêm một byte RAM nào để sao chép.

```csharp
int[] bigArray = new int[1000000];

// Cách cũ (Tốn RAM tạo mảng mới):
int[] subArray = new int[500];
Array.Copy(bigArray, 0, subArray, 0, 500); 

// Kỷ nguyên Span (Tốc độ ánh sáng, Không tốn RAM cấp phát bộ nhớ):
Span<int> fastWindow = bigArray.AsSpan().Slice(start: 0, length: 500);
```

Khi làm bài trên LeetCode, hãy luôn tự hỏi: *"Liệu mình có thể thay thế List hay mảng phụ bằng `Span<T>` để đua Top 1% Runtime của C# hay không?"*

## Next Steps {#next-steps}

Kỹ năng giải mã thuật toán của bạn đã chạm đỉnh. Giờ là lúc ghép bức tranh lại. Ở bài viết cuối cùng tiếp theo, chúng ta sẽ nhìn lại toàn bộ hành trình 12 chặng đường và thiết lập mục tiêu vươn tới cấp độ Kỹ sư trưởng (System Architect).

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/practice/final-roadmap">
    <p class="next-steps-link">Tổng kết Lộ trình</p>
    <p class="next-steps-caption">Bức tranh toàn cảnh và con đường trở thành Senior.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Dưới đây là các nguồn tài liệu kinh điển và chính thống được dùng để biên soạn bài viết này, giúp bạn tự nghiên cứu sâu hơn nếu muốn:

- **Đề bài và lời giải chuẩn của 5 bài toán LeetCode:** [Two Sum #1](https://leetcode.com/problems/two-sum/), [Valid Parentheses #20](https://leetcode.com/problems/valid-parentheses/), [Maximum Subarray #53](https://leetcode.com/problems/maximum-subarray/), [Number of Islands #200](https://leetcode.com/problems/number-of-islands/), [Merge Intervals #56](https://leetcode.com/problems/merge-intervals/).
- **Two Sum dùng Bảng băm (Hash Table) để đạt thời gian O(N):** Cormen, Leiserson, Rivest & Stein, *Introduction to Algorithms* (CLRS), 3rd Edition (MIT Press) - Chương 11 (Hash Tables) và [Wikipedia - Hash table](https://en.wikipedia.org/wiki/Hash_table).
- **Ngăn xếp (Stack) LIFO cho bài Valid Parentheses:** [Wikipedia - Stack (abstract data type)](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)).
- **Kadane's Algorithm cho bài Maximum Subarray:** [Wikipedia - Maximum subarray problem](https://en.wikipedia.org/wiki/Maximum_subarray_problem) và [GeeksforGeeks - Largest Sum Contiguous Subarray](https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/).
- **Thuật toán Loang (Flood Fill) kết hợp DFS cho bài Number of Islands:** [Wikipedia - Flood fill](https://en.wikipedia.org/wiki/Flood_fill).
- **Merge Intervals và kỹ thuật sắp xếp nền tảng:** Cormen, Leiserson, Rivest & Stein, *Introduction to Algorithms* (CLRS), 3rd Edition (MIT Press) - Chương 2 (Getting Started).
- **Tối ưu hiệu năng với Span&lt;T&gt;/Memory&lt;T&gt; trong C#:** tài liệu chính thức *Microsoft Learn* (mục Memory &amp; Spans) và Jon Skeet, *C# in Depth*.
- **Rèn luyện tư duy giải đề phỏng vấn thuật toán:** Gayle Laakmann McDowell, *Cracking the Coding Interview* và Aditya Bhargava, *Grokking Algorithms*.
