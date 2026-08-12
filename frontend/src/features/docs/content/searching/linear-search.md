---
title: Tìm kiếm Tuần tự (Linear Search)
description: Khám phá phương pháp tìm kiếm cơ bản và tự nhiên nhất của con người - duyệt qua từng phần tử một cho đến khi tìm thấy kết quả. Bao gồm Sentinel Search, tìm tất cả vị trí, so sánh thực tế với Binary Search.
---

# Tìm kiếm Tuần tự (Linear Search) {#linear-search}

Tìm kiếm Tuần tự (Linear Search) là thuật toán tìm kiếm cơ bản, trực quan và dễ hiểu nhất trong khoa học máy tính. Cách thức hoạt động của nó giống hệt như cách bạn tìm một cuốn sách cụ thể trên một kệ sách không được sắp xếp: Bạn nhìn vào cuốn đầu tiên, nếu không phải, bạn nhìn sang cuốn thứ hai, rồi cuốn thứ ba... cho đến khi tìm thấy, hoặc đi đến cuối kệ sách.

## Nguyên lý hoạt động {#how-it-works}

Cho một mảng có $N$ phần tử và một giá trị cần tìm (gọi là `target`).

1. Bắt đầu từ phần tử đầu tiên (vị trí `0`).
2. So sánh phần tử hiện tại với `target`.
3. Nếu khớp, trả về vị trí hiện tại (Tìm kiếm thành công).
4. Nếu không khớp, tiến sang phần tử tiếp theo.
5. Lặp lại bước 2. Nếu đã duyệt hết mảng mà vẫn không khớp, trả về `-1` (Tìm kiếm thất bại).

**Ví dụ:** Tìm `target = 8` trong mảng `[5, 2, 8, 4, 1]`.
- Vị trí 0 (Số `5`): Khác `8` ❌
- Vị trí 1 (Số `2`): Khác `8` ❌
- Vị trí 2 (Số `8`): Bằng `8` ✅. Trả về vị trí `2`.

---

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O | Giải thích |
| :--- | :--- | :--- |
| **Thời gian (Tốt nhất)** | **O(1)** | Phần tử cần tìm nằm ngay ở vị trí đầu tiên của mảng. |
| **Thời gian (Xấu nhất)** | **O(N)** | Phần tử cần tìm nằm ở cuối mảng, hoặc không tồn tại trong mảng. Phải duyệt qua toàn bộ $N$ phần tử. |
| **Thời gian (Trung bình)** | **O(N)** | Trung bình phải duyệt $N/2$ phần tử. Hằng số 1/2 bị bỏ qua trong Big O. |
| **Không gian bộ nhớ** | **O(1)** | Chỉ cần một biến đếm vòng lặp, không tiêu tốn thêm RAM. |

---

## Các biến thể quan trọng (Variants) {#variants}

### 1. Sentinel Linear Search (Tìm kiếm với Canh gác) - **Tối ưu hiệu năng CPU**

Kỹ thuật này đặt `target` vào cuối mảng như một "canh gác" (sentinel) để **loại bỏ hoàn toàn kiểm tra ranh giới mảng (`i < array.Length`)** trong vòng lặp. Điều này giúp CPU Branch Predictor hoạt động hiệu quả hơn do giảm nhánh nhảy (branch).

```csharp
public int LinearSearchSentinel(int[] array, int target)
{
    int n = array.Length;
    if (n == 0) return -1;

    int last = array[n - 1];      // 1. Lưu giá trị cuối cùng
    array[n - 1] = target;        // 2. Đặt Sentinel (Canh gác)

    int i = 0;
    // 3. Vòng lặp CHỈ CÓ 1 ĐIỀU KIỆN SO SÁNH
    // Vòng lặp CHẮC CHẮN dừng vì Sentinel ở cuối mảng
    while (array[i] != target)
    {
        i++;
    }

    array[n - 1] = last;          // 4. Khôi phục giá trị gốc

    // 5. Kiểm tra kết quả
    // Nếu i < n-1: Tìm thấy ở giữa mảng
    // Nếu i == n-1 VÀ last == target: Phần tử cuối mảng gốc chính là target -> Tìm thấy
    // Nếu i == n-1 VÀ last != target: Chỉ tìm thấy Sentinel -> Không có trong mảng gốc
    return (i < n - 1 || last == target) ? i : -1;
}
```

> **Tại sao nhanh hơn?** Vòng lặp `while` chỉ có 1 phép so sánh (`array[i] != target`) thay vì 2 (`i < n && array[i] != target`). Trên CPU hiện đại (pipeline, branch prediction), việc loại bỏ một nhánh `if` trong vòng lặp chặt (tight loop) có thể nhanh hơn 10-20% với mảng lớn.

### 2. Tìm tất cả vị trí (Multiple Occurrences)

Thường dùng khi cần lọc dữ liệu: tìm tất cả email chứa "spam", tìm tất cả giao dịch > 1 triệu...

```csharp
public List<int> LinearSearchAll(int[] array, int target)
{
    var indices = new List<int>();
    for (int i = 0; i < array.Length; i++)
    {
        if (array[i] == target)
        {
            indices.Add(i);
        }
    }
    return indices; // Rỗng nếu không tìm thấy
}
```

### 3. Tìm kiếm Generic trên đối tượng (Generic Object Search)

```csharp
public int LinearSearchObjects<T>(T[] array, T target, Func<T, T, bool> comparer = null)
{
    comparer ??= EqualityComparer<T>.Default.Equals;
    
    for (int i = 0; i < array.Length; i++)
    {
        if (comparer(array[i], target))
            return i;
    }
    return -1;
}

// Usage: Tìm person theo tên
var people = new[] { new Person("An"), new Person("Binh") };
int idx = LinearSearchObjects(people, new Person("Binh"), (a, b) => a.Name == b.Name);
```

### 4. Tìm kiếm bằng LINQ (Thực tế Production)

Trong code C# thực tế, hãy dùng LINQ - nó được tối ưu hóa và đọc dễ hơn:

```csharp
// Tìm index đầu tiên
int index = array.ToList().FindIndex(x => x == target); // O(N)
// Hoặc dùng Array.FindIndex (tránh alloc List)
int index2 = Array.FindIndex(array, x => x == target); 

// Tìm giá trị đầu tiên (không cần index)
var item = array.FirstOrDefault(x => x > 10); 

// Tìm tất cả
var allItems = array.Where(x => x > 10).ToList();
```

---

## Cài đặt bằng C# (Code Example) {#code-example}

### Phiên bản cơ bản (Textbook)
```csharp
public int LinearSearch(int[] array, int target)
{
    for (int i = 0; i < array.Length; i++)
    {
        if (array[i] == target)
        {
            return i;
        }
    }
    return -1;
}
```

### Phiên bản tối ưu cho mảng lớn (Span + Vectorization Hint)
.NET Runtime (CoreCLR) tự động vector hóa (SIMD) các vòng lặp đơn giản này nếu compile với `TieredCompilation` và `ReadyToRun`.

```csharp
// Span cho phép dùng stackalloc hoặc memory stack, tránh bounds check
public int LinearSearchSpan(ReadOnlySpan<int> array, int target)
{
    for (int i = 0; i < array.Length; i++)
    {
        if (array[i] == target) return i;
    }
    return -1;
}
```

---

## So sánh Thực tế: Linear Search vs Binary Search {#real-world-comparison}

Nhiều sinh viên nghĩ: *"O(log N) nhanh hơn O(N) thì lúc nào cũng dùng Binary Search"*. **SAI!**

| Kịch bản | Khuyên dùng | Lý do |
| :--- | :--- | :--- |
| **Mảng nhỏ (N < 50-100)** | **Linear Search** | Overhead của Binary Search (chia đôi, tính mid, nhảy nhánh) lớn hơn việc duyệt tuyến tính. CPU Cache line load 64 bytes (~16 int) một lần -> Linear scan cực nhanh. |
| **Mảng KHÔNG SẮP XẾP** | **Linear Search** | Binary Search **BẮT BUỘC** mảng đã sắp xếp. Sort tốn O(N log N) > O(N) search. |
| **Dữ liệu thay đổi liên tục** | **Linear Search** | Maintain sorted array (Insert O(N)) đắt hơn Search O(N). |
| **Mảng lớn (N > 10,000), tĩnh, đã sort** | **Binary Search** | O(log N) thắng O(N). 1,000,000 phần tử: Linear ~500k ops, Binary ~20 ops. |
| **Cần tìm TẤT CẢ vị trí** | **Linear Search** | Binary Search chỉ tìm 1 vị trí (Lower/Upper bound cần 2 lần log N). |

### Benchmark DotNet (Mẫu tham khảo)
```ini
// N = 100, Sorted Array
LinearSearch:     ~45 ns
BinarySearch:     ~35 ns  (Binary nhanh hơn nhờ branch prediction tốt trên sorted data)

// N = 100, Unsorted Array
LinearSearch:     ~45 ns
BinarySearch:     KHÔNG DÙNG ĐƯỢC (Sai kết quả)

// N = 10,000, Sorted Array
LinearSearch:   ~4,500 ns (4.5 µs)
BinarySearch:      ~80 ns  (Binary thắng áp đảo 50x)
```

---

## Ứng dụng thực tế {#practical-applications}

1.  **`List<T>.Contains()`, `Array.Exists()`, `List.FindIndex()`** - Nội bộ .NET dùng Linear Search.
2.  **Unsorted Small Collections** - Cache lookup, configuration settings, permission checks (danh sách role ~10-50 item).
3.  **Streaming Data** - Xử lý log real-time, network packets: không thể sort, chỉ duyệt 1 lần (Online Algorithm).
4.  **Brute Force Baseline** - Làm baseline để verify kết quả thuật toán phức tạp hơn (Hash, Tree, Binary Search).
5.  **Hardware/Embedded** - Vi điều khiển RAM ít, không có cache, branch prediction yếu -> Linear Search đơn giản, dự đoán được timing (WCET).

---

## Tóm tắt nhanh (Key Takeaways)

- **Đơn giản, mạnh mẽ:** Không cần setup, không cần dữ liệu sort, code không bao giờ sai (hard to bug).
- **O(N) là giới hạn cứng:** Không thể tối ưu hơn về độ phức tạp tiệm cận (asymptotic), chỉ tối ưu hằng số (constant factors: SIMD, Sentinel, Prefetch).
- **Quy tắc vàng:** **N < 50~100 -> Linear Search. N > 10,000 & Sorted -> Binary Search.** Giữa đó: Benchmark thực tế trên data của bạn.
- **Luôn dùng LINQ/Built-in** (`Array.FindIndex`, `List.Find`) trong production code C#.

---

## Quiz kiểm tra {#quiz}

<details class="vt-quiz">
<summary>❓ Quiz 1: Linear Search có thể dùng SIMD (AVX/SSE) để tăng tốc không?</summary>

**Đáp án:** **CÓ.** Các trình biên dịch hiện đại (RyuJIT trong .NET, GCC, Clang) có thể tự động vector hóa (Auto-vectorization) vòng lặp `for` đơn giản so sánh `array[i] == target`. Nó load 256-bit (8 int32) hoặc 512-bit (16 int32) cùng lúc, so sánh song song, giảm số lần lặp xuống 8x/16x. Yêu cầu: Vòng lặp đơn giản, không side-effect, mảng aligned.
</details>

<details class="vt-quiz">
<summary>❓ Quiz 2: Khi nào Linear Search Nhanh HƠN Binary Search trên mảng ĐÃ SẮP XẾP?</summary>

**Đáp án:** Khi **N rất nhỏ (thường < 50-100 phần tử)**. Do overhead của Binary Search (tính mid, nhảy nhánh không tuần tự -> cache miss, branch misprediction) lớn hơn chi phí duyệt tuyến tính (sequential access -> CPU prefetcher hoạt động tối đa, branch prediction luôn đúng).
</details>

<details class="vt-quiz">
<summary>❓ Quiz 3: Tại sao `Array.FindIndex` nhanh hơn `array.ToList().FindIndex`?</summary>

**Đáp án:** `ToList()` cấp phát (allocate) một `List<int>` mới trên Heap, copy toàn bộ dữ liệu (O(N) time + O(N) memory + GC pressure). `Array.FindIndex` làm việc trực tiếp trên mảng gốc, zero allocation.
</details>

---

## Next Steps {#next-steps}

Mặc dù Linear Search tốt cho các mảng nhỏ và chưa được sắp xếp, nhưng hãy tưởng tượng bạn phải tìm một cái tên trong danh bạ điện thoại có 1 triệu số. Bạn không thể lật từng trang một từ đầu đến cuối được!

Đó là lúc chúng ta cần đến một thuật toán tìm kiếm "chia để trị", có khả năng loại bỏ một nửa số phần tử chỉ trong 1 lần thử nghiệm. Chào mừng bạn đến với **Tìm kiếm Nhị phân (Binary Search)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/binary-search">
    <p class="next-steps-link">Tìm kiếm Nhị phân (Binary Search)</p>
    <p class="next-steps-caption">Kỹ năng tìm kiếm xé dọc mảng dữ liệu với tốc độ O(log N).</p>
  </a>
</div>

---

## 📚 Tham khảo lý thuyết {#references}

Dưới đây là các nguồn tài liệu kinh điển và chính thống được dùng để biên soạn bài viết này, giúp bạn tự nghiên cứu sâu hơn nếu muốn:

- **Nền tảng phân tích độ phức tạp Big O và thuật toán tìm kiếm tuần tự:** Cormen, Leiserson, Rivest & Stein, *Introduction to Algorithms* (CLRS), 4th Edition, MIT Press — Chương 2 (Getting Started) phân tích chi tiết Linear Search cùng ví dụ chạy tay và ký hiệu O lớn.
- **Khái niệm Linear Search, sentinel và minh họa từng bước:** [Linear search - Wikipedia](https://en.wikipedia.org/wiki/Linear_search). Nguồn chính về mô tả thuật toán, phân tích độ phức tạp và ứng dụng của Linear Search.
- **Biến thể Sentinel Search và các bài tập nâng cao:** GeeksforGeeks - [Linear Search](https://www.geeksforgeeks.org/linear-search/). Bài viết phân tích chi tiết các biến thể bao gồm kỹ thuật sentinel và so sánh thực nghiệm.
- **Học liệu giảng dạy thuật toán cấp đại học:** MIT OpenCourseWare - *Introduction to Algorithms (6.006)*, [MIT OCW](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/). Cung cấp bài giảng về đệ quy, chia để trị và phân tích tiệm cận làm nền tảng so sánh với Binary Search.
- **API LINQ/Built-in được nhắc trong bài:** Microsoft Learn - [Array.FindIndex Method](https://learn.microsoft.com/en-us/dotnet/api/system.array.findindex) và [List<T>.FindIndex Method](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.findindex). Tài liệu chính thức về cách .NET triển khai tìm kiếm tuyến tính nội bộ.