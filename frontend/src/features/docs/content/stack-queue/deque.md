---
title: Hàng đợi hai đầu (Deque)
description: Khám phá Deque (Double-ended Queue) - cấu trúc dữ liệu lai giữa Stack và Queue, chìa khóa để giải quyết bài toán Sliding Window cực kỳ tối ưu.
---

# Hàng đợi hai đầu (Deque) {#deque}

Nếu **Stack** chỉ cho phép thêm/xóa ở một đầu (LIFO), và **Queue** chỉ cho phép thêm một đầu xóa một đầu (FIFO), thì **Deque** (đọc là "deck" - viết tắt của *Double-ended Queue*) là sự kết hợp hoàn hảo của cả hai.

Deque cho phép bạn **Thêm và Xóa phần tử ở CẢ HAI ĐẦU** (đầu và cuối) với độ phức tạp $O(1)$.

## Đặc điểm của Deque {#characteristics}

Bạn có thể tưởng tượng Deque giống như một hàng rạp chiếu phim mà bảo vệ cho phép khách VIP chen ngang vào đầu hàng, đồng thời những người ở cuối hàng thấy đợi lâu quá có thể bỏ cuộc và đi về.

- **Thêm vào đầu (AddFirst):** $O(1)$
- **Thêm vào cuối (AddLast):** $O(1)$
- **Xóa ở đầu (RemoveFirst):** $O(1)$
- **Xóa ở cuối (RemoveLast):** $O(1)$

Trong C#, từ .NET 6 trở lên, chúng ta đã có sẵn class tĩnh nhưng vô cùng mạnh mẽ: `LinkedList<T>` thường được dùng làm Deque trong các phiên bản cũ, nhưng .NET đã cung cấp cấu trúc tối ưu hơn để làm việc này. Mặc dù vậy, trong các bài toán thuật toán (LeetCode), người ta thường dùng `LinkedList<T>` hoặc một mảng tự chế để biểu diễn Deque.

## Cài đặt cơ bản bằng C# {#code-example}

Cách phổ biến nhất để dùng Deque trong C# là sử dụng `LinkedList<T>`:

```csharp
LinkedList<int> deque = new LinkedList<int>();

// Thêm vào cuối (Giống Queue)
deque.AddLast(1);
deque.AddLast(2); 
// deque: [1, 2]

// Thêm vào đầu (Giống Stack)
deque.AddFirst(0); 
// deque: [0, 1, 2]

// Xóa ở đầu
deque.RemoveFirst(); 
// deque: [1, 2]

// Xóa ở cuối
deque.RemoveLast(); 
// deque: [1]
```

## Ứng dụng thực tế: Cửa sổ trượt (Sliding Window Maximum) {#sliding-window}

Sức mạnh thực sự của Deque được thể hiện qua bài toán kinh điển: **"Sliding Window Maximum"** (Tìm giá trị lớn nhất trong cửa sổ trượt).

**Bài toán:** Cho một mảng `nums = [1,3,-1,-3,5,3,6,7]`, và một cửa sổ có kích thước `k = 3`. Cửa sổ này trượt từ trái sang phải. Hãy tìm giá trị lớn nhất trong cửa sổ ở mỗi bước.
Kết quả mong muốn: `[3, 3, 5, 5, 6, 7]`.

Nếu dùng cách duyệt trâu (Brute Force), với mỗi bước trượt bạn phải tìm lại max trong `k` phần tử. Độ phức tạp là $O(N \times k)$.
Nhưng với **Deque**, chúng ta có thể tối ưu thuật toán xuống $O(N)$!

**Bí quyết:** 
Chúng ta lưu trữ *vị trí (index)* của các phần tử trong Deque. Deque luôn duy trì các phần tử theo thứ tự **giảm dần**. Nếu phần tử mới đưa vào lớn hơn các phần tử ở đuôi Deque, ta đá chúng ra (vì chúng vĩnh viễn không thể làm Max được nữa).

```csharp
public int[] MaxSlidingWindow(int[] nums, int k) 
{
    if (nums == null || nums.Length == 0) return new int[0];
    
    int[] result = new int[nums.Length - k + 1];
    LinkedList<int> deque = new LinkedList<int>();
    
    for (int i = 0; i < nums.Length; i++)
    {
        // 1. Loại bỏ các phần tử đã trượt ra khỏi cửa sổ (ở đầu Deque)
        if (deque.Count > 0 && deque.First.Value < i - k + 1)
        {
            deque.RemoveFirst();
        }
        
        // 2. Duy trì tính giảm dần: 
        // Đá các phần tử nhỏ hơn phần tử mới ra khỏi đuôi Deque
        while (deque.Count > 0 && nums[deque.Last.Value] < nums[i])
        {
            deque.RemoveLast();
        }
        
        // 3. Thêm phần tử mới vào đuôi
        deque.AddLast(i);
        
        // 4. Ghi nhận kết quả khi cửa sổ đã đủ kích thước k
        if (i >= k - 1)
        {
            result[i - k + 1] = nums[deque.First.Value]; // Max luôn nằm ở đầu Deque
        }
    }
    
    return result;
}
```

:::tip Mẹo phỏng vấn
Khi người phỏng vấn hỏi bài toán liên quan đến "Cửa sổ trượt" (Sliding Window) và yêu cầu tìm Max/Min, 99% câu trả lời được mong đợi là **Deque**. Hãy nhớ kỹ câu thần chú: *"Deque lưu trữ index, duy trì tính đơn điệu, Max nằm ở đầu, loại bỏ đuôi nếu nhỏ hơn"*.
:::

## Next Steps {#next-steps}

Đừng quên thực hành lại bài toán Sliding Window trên [LeetCode (Bài 239)](https://leetcode.com/problems/sliding-window-maximum/). Cấu trúc dữ liệu tuyến tính đã kết thúc, hãy bước sang thế giới rẽ nhánh phức tạp hơn: **Cây và Đồ thị (Trees & Graphs)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/tree-graph/summary">
    <p class="next-steps-link">Tổng quan về Tree và Graph</p>
    <p class="next-steps-caption">Thế giới của dữ liệu phi tuyến tính.</p>
  </a>
</div>
