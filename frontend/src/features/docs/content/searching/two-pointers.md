---
title: Kỹ thuật Hai Con Trỏ (Two Pointers)
description: Khám phá sức mạnh của việc duyệt mảng bằng hai con trỏ đồng thời, kỹ thuật kinh điển giúp giảm độ phức tạp từ O(N²) xuống O(N) trong chớp mắt.
---

# Kỹ thuật Hai Con Trỏ (Two Pointers) {#two-pointers}

:::info Mục tiêu bài học
- Nắm vững triết lý đằng sau kỹ thuật Hai Con Trỏ và cách nó cứu rỗi bộ vi xử lý khỏi vòng lặp lồng nhau vô tận.
- Khám phá 2 biến thể cốt lõi: Con trỏ ngược chiều (Opposite) và Con trỏ cùng chiều (Same Direction).
- Phân tích mã nguồn (Line-by-line) và mô phỏng từng bước chạy (Dry run) qua bảng Trace Table.
- Chỉ mặt đặt tên những Cạm bẫy (Edge Cases) thường gặp khiến lập trình viên mất điểm oan uổng trong phỏng vấn.
- Thử sức với bài tập thực hành LeetCode.
:::

## 1. Lời mở đầu: Thoát khỏi vũng lầy O(N²) {#introduction}

Kỹ thuật **Hai Con Trỏ (Two Pointers)** là một trong những mẫu thuật toán (algorithmic patterns) xuất hiện nhiều nhất trong các kỳ phỏng vấn tại FAANG. Nó không phải là một cấu trúc dữ liệu mới mẻ nào cả, mà chỉ đơn giản là một "mẹo" tư duy cực kỳ tinh tế khi duyệt Mảng (Array) hoặc Chuỗi (String).

**Ví dụ thực tế (Real-world analogy):**
Hãy tưởng tượng bạn đang cầm trên tay một cuốn từ điển dày cộp và cần tìm một từ.
- **Cách ngây thơ (Brute Force):** Bạn lật từng trang từ đầu đến cuối. Đôi khi bạn phải lật lại trang cũ để so sánh. Đây chính là cách làm của vòng lặp lồng nhau (Nested Loop) với độ phức tạp `O(N²)`. Vô cùng chậm chạp!
- **Cách Hai con trỏ:** Bạn kẹp ngón tay trỏ trái ở trang đầu, ngón tay trỏ phải ở trang cuối. Tùy thuộc vào từ bạn cần tìm nằm ở nửa nào, bạn lật ngón trái hoặc ngón phải để thu hẹp phạm vi tìm kiếm lại cho đến khi hai ngón tay gặp nhau. Chúc mừng, bạn đã giảm thời gian xuống `O(N)`!

Về mặt kỹ thuật, "Con trỏ" ở đây không phải là Con trỏ bộ nhớ (Memory Pointer trong C/C++), mà chỉ đơn giản là **hai biến số nguyên (Integer Variables) lưu trữ vị trí Index** của mảng.

---

## 2. Biến thể 1: Con trỏ ngược chiều (Opposite Direction) {#opposite-direction}

Đây là biến thể phổ biến nhất. Nó gần như là "kim chỉ nam" mỗi khi đề bài có nhắc đến cụm từ: **"Cho một mảng đã được sắp xếp..."**

- **Con trỏ `left`:** Xuất phát từ đầu mảng (Index = 0).
- **Con trỏ `right`:** Xuất phát từ cuối mảng (Index = N - 1).
- **Quy luật di chuyển:** `left` đi sang phải (tăng giá trị), `right` đi sang trái (giảm giá trị) cho đến khi chúng va vào nhau (`left >= right`).

### Phân tích bài toán kinh điển: Two Sum II
**Đề bài:** Cho một mảng số nguyên `numbers` đã được sắp xếp tăng dần và một số `target`. Hãy tìm vị trí của hai số có tổng bằng đúng `target`.

**Thuật toán:**
1. Tính tổng `sum = numbers[left] + numbers[right]`.
2. Nếu `sum == target`: Bingo! Trả về kết quả.
3. Nếu `sum < target`: Tổng đang quá nhỏ. Vì mảng đã sắp xếp tăng dần, cách duy nhất để tăng tổng lên là vứt bỏ số nhỏ nhất hiện tại $\rightarrow$ Dịch `left` sang phải 1 bước.
4. Nếu `sum > target`: Tổng đang quá lớn. Cách duy nhất để giảm tổng xuống là vứt bỏ số lớn nhất hiện tại $\rightarrow$ Dịch `right` sang trái 1 bước.

### Minh họa từng bước (Step-by-step Visualizer)

Bài toán: `numbers = [11, 23, 29, 37, 41, 58, 62, 70]`, `target = 66`.

**Bước 1: Khởi tạo**
`left = 0` (Giá trị 11), `right = 7` (Giá trị 70). Tổng = 11 + 70 = 81.
Vì 81 > 66 $\rightarrow$ Cần giảm tổng $\rightarrow$ Giảm `right`.

```mermaid
flowchart LR
    L((L)) --> 0[11]
    0 --- 1[23] --- 2[29] --- 3[37] --- 4[41] --- 5[58] --- 6[62] --- 7[70]
    R((R)) --> 7
    
    style L fill:#b85c5c,color:#fff
    style R fill:#c9a227,color:#fff
    style 0 stroke:#b85c5c,stroke-width:2px
    style 7 stroke:#c9a227,stroke-width:2px
```

**Bước 2: Dịch Right**
`left = 0` (11), `right = 6` (62). Tổng = 11 + 62 = 73.
Vì 73 > 66 $\rightarrow$ Vẫn cần giảm tổng $\rightarrow$ Giảm `right`.

```mermaid
flowchart LR
    L((L)) --> 0[11]
    0 --- 1[23] --- 2[29] --- 3[37] --- 4[41] --- 5[58] --- 6[62]
    R((R)) --> 6
    6 ~~~ 7[70]
    
    style L fill:#b85c5c,color:#fff
    style R fill:#c9a227,color:#fff
    style 7 opacity:0.3
```

**Bước 3: Dịch Right lần nữa**
`left = 0` (11), `right = 5` (58). Tổng = 11 + 58 = 69.
Vì 69 > 66 $\rightarrow$ Vẫn cần giảm $\rightarrow$ Giảm `right`.

```mermaid
flowchart LR
    L((L)) --> 0[11]
    0 --- 1[23] --- 2[29] --- 3[37] --- 4[41] --- 5[58]
    R((R)) --> 5
    5 ~~~ 6[62] ~~~ 7[70]
    
    style L fill:#b85c5c,color:#fff
    style R fill:#c9a227,color:#fff
    style 6 opacity:0.3
    style 7 opacity:0.3
```

**Bước 4: Dịch Left**
`left = 0` (11), `right = 4` (41). Tổng = 11 + 41 = 52.
Vì 52 < 66 $\rightarrow$ Cần tăng tổng $\rightarrow$ Tăng `left`.

```mermaid
flowchart LR
    0[11] ~~~ 1[23]
    1 --- 2[29] --- 3[37] --- 4[41]
    L((L)) --> 1
    R((R)) --> 4
    
    style L fill:#b85c5c,color:#fff
    style R fill:#c9a227,color:#fff
    style 0 opacity:0.3
```

**Bước 5: Dịch Left lần nữa**
`left = 1` (23), `right = 4` (41). Tổng = 23 + 41 = 64.
Vì 64 < 66 $\rightarrow$ Cần tăng $\rightarrow$ Tăng `left`.

**Bước 6: Dịch Right**
`left = 2` (29), `right = 4` (41). Tổng = 29 + 41 = 70.
Vì 70 > 66 $\rightarrow$ Cần giảm $\rightarrow$ Giảm `right`.

**Bước 7: Tìm thấy kết quả!**
`left = 2` (29), `right = 3` (37). Tổng = 29 + 37 = 66. Bingo! Trả về `[2, 3]`.

### Phân tích Mã nguồn (Line-by-line Analysis)

Xem thuật toán Two Pointers chạy thực tế trên Playground bên dưới.

```playground:two-pointers
```

```dual:two-pointers
public int[] TwoSum(int[] numbers, int target) 
{
    // Bước 1: Khởi tạo 2 con trỏ ở 2 đầu mảng
    int left = 0;
    int right = numbers.Length - 1;

    // Bước 2: Điều kiện dừng. Tại sao không dùng (left <= right)?
    // Vì đề bài yêu cầu "hai số" khác nhau, nếu left == right tức là ta đang cộng 1 số với chính nó!
    while (left < right) 
    {
        int sum = numbers[left] + numbers[right];

        if (sum == target) 
        {
            // Bài toán trên LeetCode yêu cầu trả về vị trí 1-indexed (đếm từ 1 thay vì 0)
            return new int[] { left + 1, right + 1 }; 
        }
        else if (sum < target) 
        {
            // Tổng quá nhỏ -> Loại bỏ số nhỏ nhất hiện tại
            left++;
        }
        else 
        {
            // Tổng quá lớn -> Loại bỏ số lớn nhất hiện tại
            right--;
        }
    }
    
    // Fallback trong trường hợp không tìm thấy
    return new int[] { -1, -1 };
}
```

---

## 3. Biến thể 2: Con trỏ cùng chiều (Fast & Slow Pointers) {#same-direction}

Ở biến thể này, cả hai con trỏ đều xuất phát từ đầu mảng (hoặc đầu Linked List) và di chuyển về cùng một hướng (sang phải). Kỹ thuật này sinh ra để xử lý các bài toán: Xóa phần tử trùng lặp tại chỗ (In-place), Di chuyển các số 0 về cuối mảng, hoặc Tìm chu kỳ (Cycle).

- **Con trỏ Fast (Đi nhanh):** Có nhiệm vụ dò mìn, chạy trước để tìm kiếm các phần tử thỏa mãn điều kiện mới.
- **Con trỏ Slow (Đi chậm):** Chốt chặn an toàn. Nó chỉ nhích lên khi Con trỏ Fast tìm được một "món hàng tốt", sau đó ghi đè món hàng đó vào vị trí của Slow.

### Phân tích bài toán kinh điển: Remove Duplicates
**Đề bài:** Cho một mảng đã sắp xếp. Hãy xóa tất cả các số trùng lặp sao cho mỗi số chỉ xuất hiện đúng 1 lần. Yêu cầu làm **trực tiếp trên mảng cũ (In-place)**, không tốn thêm RAM tạo mảng mới.

**Thuật toán:**
- `Slow` đứng ở vị trí phần tử hợp lệ cuối cùng (Ban đầu là index 0).
- `Fast` chạy dò từ index 1.
- Hễ `Fast` phát hiện ra một số khác biệt so với số mà `Slow` đang đứng, ta nhích `Slow` lên 1 nấc, rồi copy giá trị của `Fast` vào chỗ của `Slow`.

### Bảng Mô phỏng (Dry Run Trace Table)

Mảng đầu vào: `nums = [1, 1, 2, 3, 3]`

| Vòng lặp | `fast` index | `nums[fast]` | `slow` index | `nums[slow]` | Trạng thái | Hành động & Kết quả Mảng |
| :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| Khởi tạo | - | - | `0` | `1` | - | Mảng: `[1, 1, 2, 3, 3]` |
| Lần 1 | `1` | `1` | `0` | `1` | Trùng nhau (`1 == 1`) | Không làm gì cả. `fast++`. |
| Lần 2 | `2` | `2` | `0` | `1` | Khác nhau (`2 != 1`) | `slow++` (lên 1). Ghi `nums[1] = 2`. Mảng: `[1, 2, 2, 3, 3]` |
| Lần 3 | `3` | `3` | `1` | `2` | Khác nhau (`3 != 2`) | `slow++` (lên 2). Ghi `nums[2] = 3`. Mảng: `[1, 2, 3, 3, 3]` |
| Lần 4 | `4` | `3` | `2` | `3` | Trùng nhau (`3 == 3`) | Không làm gì cả. Kết thúc vòng lặp. |

**Kết quả:** Độ dài mảng hợp lệ là `slow + 1 = 3`. Dữ liệu hợp lệ: `[1, 2, 3]`.

```csharp
public int RemoveDuplicates(int[] nums) 
{
    if (nums.Length == 0) return 0;
    
    int slow = 0; 
    
    for (int fast = 1; fast < nums.Length; fast++) 
    {
        // Chỉ khi phát hiện số mới lạ, ta mới nhích slow lên và ghi đè
        if (nums[fast] != nums[slow]) 
        {
            slow++;
            nums[slow] = nums[fast]; 
        }
    }
    
    // Độ dài thực sự của mảng hợp lệ = index cuối cùng + 1
    return slow + 1; 
}
```

---

## 4. Cạm bẫy & Góc khuất (Pitfalls & Edge Cases) {#edge-cases}

Dù Two Pointers cực kỳ dễ hiểu, nhưng các buổi phỏng vấn luôn gài cắm những cái bẫy "chết người":

1. **Quên Sắp xếp Mảng:** 
   Kỹ thuật Con trỏ ngược chiều (Left/Right) phụ thuộc hoàn toàn vào tính chất Tăng dần/Giảm dần của mảng để quyết định nên dịch Left hay Right. Nếu mảng đầu vào đang lộn xộn, bạn bắt buộc phải gọi hàm `Array.Sort()` trước (sẽ tốn thêm `O(N log N)` thời gian).

2. **Lỗi Index Out of Bounds (Vượt quá giới hạn mảng):**
   Rất nhiều ứng viên khởi tạo `right = nums.Length` thay vì `nums.Length - 1`. Trong C#, mảng chạy từ `0` đến `N-1`. Trỏ vào `N` sẽ lập tức ăn ngay lỗi Runtime!

3. **Vòng lặp Vô hạn (Infinite Loop):**
   Xảy ra khi bạn sử dụng vòng lặp `while (left < right)` nhưng bên trong vòng lặp lại quên không tăng/giảm `left` và `right`. Hệ quả là hai con trỏ đứng yên mãi mãi, làm treo cứng toàn bộ ứng dụng.

4. **Lỗi Tràn số nguyên (Integer Overflow):**
   Khi tính tổng `int sum = numbers[left] + numbers[right];`, nếu hai số này đều là những số cực lớn (gần ngưỡng 2.14 tỷ của Int32), tổng của chúng có thể bị tràn vòng và biến thành số âm, làm phá hỏng toàn bộ logic `sum < target`. Lời khuyên: Hãy ép kiểu an toàn: `long sum = (long)numbers[left] + numbers[right];`.

---

## 5. Tổng kết & Luyện tập {#summary}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Mọi trường hợp)** | **O(N)** - Mỗi phần tử trong mảng chỉ bị con trỏ lướt qua đúng 1 lần (hoặc tối đa 2 lần với Slow/Fast). Thuật toán không bao giờ lùi lại! |
| **Không gian bộ nhớ** | **O(1)** - Chỉ cần khai báo đúng 2 biến kiểu `int` (`left`, `right`), hoàn toàn không phụ thuộc vào kích thước dữ liệu đầu vào. Sắp xếp tại chỗ xuất sắc! |

:::tip Lời khuyên thực chiến
Mỗi khi nhìn thấy bài toán yêu cầu tìm "Cặp số (Pairs)", "Tổng", "Chuỗi đối xứng (Palindrome)", hay "Gộp 2 mảng", phản xạ đầu tiên của bạn phải là: **Có thể dùng Hai Con Trỏ được không?**
:::

### Bài tập LeetCode tham khảo
1. [LeetCode 167 - Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
2. [LeetCode 26 - Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
3. [LeetCode 11 - Container With Most Water](https://leetcode.com/problems/container-with-most-water/) (Bài toán nâng cao, dùng tư duy vứt bỏ cột ngắn hơn).
4. [LeetCode 15 - 3Sum](https://leetcode.com/problems/3sum/) (Siêu phẩm kết hợp 1 vòng lặp For và Two Pointers bên trong).

---

## Next Steps {#next-steps}

Two Pointers chỉ là một mảnh ghép trong gia đình kỹ thuật duyệt mảng thông minh. Khi bài toán yêu cầu quan sát một đoạn con liên tục (subarray/substring) thay vì hai đầu mảng, bạn sẽ cần đến người anh em song sinh của Two Pointers: **Kỹ thuật Cửa sổ trượt (Sliding Window)**. Còn nếu bạn muốn ôn lại cách tư duy chia để trị trên mảng đã sắp xếp, đừng quên **Tìm kiếm Nhị phân (Binary Search)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/binary-search">
    <p class="next-steps-link">Tìm kiếm Nhị phân (Binary Search)</p>
    <p class="next-steps-caption">Thu hẹp phạm vi tìm kiếm một nửa mỗi bước, đạt tốc độ O(log N) trên mảng đã sắp xếp.</p>
  </a>
  <a class="vt-box" href="/docs/searching/sliding-window">
    <p class="next-steps-link">Kỹ thuật Cửa sổ trượt (Sliding Window)</p>
    <p class="next-steps-caption">Quản lý đoạn con liên tục trượt qua mảng, xử lý bài toán Subarray/Substring trong O(N).</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Nguồn lý thuyết chính được dùng để biên soạn bài viết này:

- **Cormen, Leiserson, Rivest, Stein (CLRS) – *Introduction to Algorithms*, 3rd Edition (MIT Press):**
  - Chương 2 *Getting Started* — khái niệm vòng lặp bất biến (Loop Invariant) dùng để chứng minh tính đúng đắn của vòng lặp Two Pointers.
- **Wikipedia – *Two-pointer technique*:** Giải thích tổng quan hai hướng tiếp cận cốt lõi — Con trỏ ngược chiều (Opposite / Meet-in-the-middle) và Con trỏ cùng chiều (Fast & Slow).
- **Wikipedia – *Two sum*:** Mô tả bài toán kinh điển Two Sum II trên mảng đã sắp xếp và lời giải Two Pointers O(N).
- **GeeksforGeeks – *Two Pointers Technique*:** Hướng dẫn chi tiết cách xây dựng vòng lặp Two Pointers kèm các lỗi biên (Edge Cases) thường mắc phải.
- **LeetCode – *167. Two Sum II - Input Array Is Sorted*:** Đề bài và quy ước trả về vị trí 1-indexed được tham chiếu trong ví dụ mã nguồn.
- **LeetCode – *26. Remove Duplicates from Sorted Array*:** Đề bài Remove Duplicates in-place được phân tích trong Biến thể 2 (Fast & Slow Pointers).
