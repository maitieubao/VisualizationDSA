---
title: Bảng Băm và Hàm Băm (Hash Table Theory)
description: Khám phá kiến trúc dữ liệu mạnh mẽ nhất thế giới với khả năng tra cứu thần tốc O(1) bất chấp hàng tỷ bản ghi. Bao gồm Chaining, Open Addressing, Load Factor, Rehashing, và C# Dictionary internals.
---

# Bảng Băm và Hàm Băm {#hash-table-theory}

:::info Mục tiêu bài học
- Hiểu được sự lợi hại của Bảng băm: Lấy ưu điểm truy cập nhanh của mảng `O(1)` gán cho các Key (Khóa) không phải là số tự nhiên.
- Hiểu khái niệm Hàm băm (Hash Function) và Vai trò của nó.
- Phân tích nguyên nhân xảy ra Va chạm (Collision) và các phương pháp giải quyết kinh điển: **Chaining** vs **Open Addressing** (Linear/Quadratic/Double Hashing).
- Nắm vững **Load Factor** và **Rehashing** - cơ chế tự mở rộng của Dictionary.
- Hiểu cách C# `Dictionary<TKey, TValue>` triển khai bên dưới (Open Addressing + Randomized Hashing).
:::

## 1. Giới thiệu Bảng Băm (Hash Table) {#introduction}

Nếu bạn có một mảng lưu danh sách sinh viên theo Mã số sinh viên (từ 0 đến 1000). Việc tìm sinh viên số 500 cực kỳ nhanh `O(1)` vì Mảng hỗ trợ truy cập bằng index: `students[500]`.

Tuy nhiên, trong thực tế, chúng ta muốn tra cứu bằng những thông tin có ý nghĩa hơn, ví dụ: tra cứu điểm thi bằng **"Họ và tên"** hoặc **"Số điện thoại"**. Mảng truyền thống bó tay vì bạn không thể viết `students["Nguyen Van A"]`. Nếu dùng Mảng, bạn phải quét từ đầu đến cuối (Tốn `O(N)`).

**Bảng Băm (Hash Table)** ra đời để giải quyết vấn đề này. Nó mang lại khả năng tra cứu với tốc độ của Mảng `O(1)`, nhưng cho phép bạn sử dụng bất kỳ kiểu dữ liệu nào làm Key (Chuỗi, Số điện thoại, Đối tượng).

## 2. Hàm Băm (Hash Function) là gì? {#hash-function}

Bí mật của Bảng băm nằm ở **Hàm băm**. Hàm băm là một cỗ máy ma thuật lấy đầu vào là một Key bất kỳ (ví dụ chuỗi `"Alice"`), xử lý các phép toán học trên mã ASCII/Unicode của nó, và trả ra một con số (index) hợp lệ để lưu vào mảng.

```mermaid
flowchart LR
    Key["Khóa (Key)\n'Alice'"] --> HF{Hàm Băm\n(Hash Function)}
    HF --> Index["Chỉ số Mảng\n(Index: 4)"]
    Index --> Array["Lưu vào Mảng\nArray[4] = Data"]
    
    style HF fill:#f59e0b,color:#fff
```

**Tính chất bắt buộc của một Hàm băm tốt:**
1. **Tính xác định (Deterministic):** Với cùng một đầu vào `"Alice"`, nó phải **luôn luôn** trả ra cùng một số `4`.
2. **Tính phân tán đều (Uniform Distribution):** Các kết quả trả ra không được chụm lại ở một vài số, mà phải rải đều khắp mảng để tránh "kẹt xe" (Collision).
3. **Tốc độ cực nhanh:** Hàm băm phải chạy với tốc độ `O(1)` (thường là vài phép toán bit/math đơn giản).

**Ví dụ hàm băm đơn giản cho string (DJB2):**
```csharp
public static uint HashString(string key)
{
    uint hash = 5381;
    foreach (char c in key)
    {
        // hash = hash * 33 + c  (tương đương (hash << 5) + hash + c)
        hash = ((hash << 5) + hash) ^ (uint)c;
    }
    return hash;
}
// Index = hash % capacity
```

## 3. Vấn đề Va chạm (Collision) {#collision}

Vì số lượng Key có thể (tất cả các chuỗi trên đời) lớn hơn rất rất nhiều so với kích thước Mảng vật lý trên RAM, chắc chắn sẽ có lúc **2 Key khác nhau lại bị băm ra cùng một chỉ số Index**. Hiện tượng này gọi là **Va chạm (Collision)**.

Ví dụ: `"Alice"` băm ra số `4`, nhưng `"Bob"` vô tình cũng bị băm ra số `4`. Chẳng lẽ ta ghi đè dữ liệu của Alice? Không! Ta có 2 cách giải quyết chính:

### Phương pháp 1: Chaining (Móc xích / Separate Chaining)

Tại mỗi ô (index) của mảng, thay vì lưu trực tiếp dữ liệu, ta lưu một **Danh sách liên kết (Linked List)** hoặc **Dynamic Array (List)**.

Khi `"Bob"` cũng rơi vào ô số `4`, ta chỉ việc thêm `"Bob"` vào đằng sau `"Alice"` trong danh sách liên kết tại ô số 4 đó.

*   **Ưu điểm:** Triển khai đơn giản, không bao giờ tràn mảng, xóa phần tử dễ dàng.
*   **Nhược điểm:** Cache miss cao (node phân tán RAM), tốn memory cho con trỏ/next. Khi Load Factor cao, List dài ra → truy cập giảm từ `O(1)` xuống `O(N)`.

```mermaid
flowchart LR
    subgraph Hash Table (Array)
        direction TB
        A0["Index 0: null"]
        A1["Index 1: null"]
        A2["..."]
        A4["Index 4: Head"]
    end
    
    subgraph Linked List at Index 4
        direction LR
        Node1["Alice\nValue: 90"] --> Node2["Bob\nValue: 85"] --> Node3["Charlie\nValue: 92"]
    end
    
    A4 --> Node1
```

**Độ phức tạp:**
| Thao tác | Trung bình (Load Factor α ≈ 1) | Xấu nhất |
| :--- | :--- | :--- |
| Search | O(1 + α) ≈ **O(1)** | **O(N)** (tất cả rơi vào 1 bucket) |
| Insert | **O(1)** | O(N) |
| Delete | O(1 + α) ≈ **O(1)** | O(N) |

> **Lưu ý:** Java `HashMap` (từ Java 8) chuyển từ Linked List sang **Red-Black Tree** khi bucket size > 8 (Treeify) để đảm bảo worst-case `O(log N)`.

---

### Phương pháp 2: Open Addressing (Địa chỉ mở / Probing)

Nếu ô số `4` đã bị `"Alice"` chiếm. `"Bob"` sẽ **không** dùng Linked List, mà sẽ "gõ cửa" ô tiếp theo theo một quy tắc xác định (Probing Sequence) cho đến khi tìm thấy ô trống.

#### 2.1. Linear Probing (Dò tuyến tính)
Công thức: `index = (hash(key) + i) % capacity` (với `i = 0, 1, 2...`)
*   Kiểm tra ô 4 → kín → kiểm tra ô 5 → kín → kiểm tra ô 6 → trống → đặt ở đây.
*   **Vấn đề:** **Primary Clustering** (Đòm cụm chính). Các phần tử liên tục đè lên nhau tạo thành cụm dài, làm tăng số lần probe cho các phần tử sau.

#### 2.2. Quadratic Probing (Dò bậc hai)
Công thức: `index = (hash(key) + c1*i + c2*i²) % capacity`
*   Nhảy theo đường parabol: +1, +4, +9, +16...
*   Giảm Primary Clustering nhưng gây **Secondary Clustering** (Các key có hash giống nhau sẽ theo cùng 1 chuỗi probe).

#### 2.3. Double Hashing (Băm kép) - Tốt nhất cho Open Addressing
Công thức: `index = (hash1(key) + i * hash2(key)) % capacity`
*   `hash2(key)` là hàm băm thứ 2, trả về bước nhảy (step size) **khác 0** và **nguyên tố cùng nhau với capacity**.
*   Mỗi key có "bước chân" riêng → Phân tán tốt nhất, ít clustering nhất.

---

## 4. Load Factor (Hệ số tải) & Rehashing (Mở rộng) {#load-factor-rehashing}

Đây là khái niệm **QUAN TRỌNG NHẤT** quyết định hiệu năng Hash Table.

**Load Factor (α) = Số phần tử (n) / Dung lượng mảng (capacity)**

| Load Factor | Ý nghĩa | Hậu quả |
| :--- | :--- | :--- |
| **α < 0.5** | Mảng thưa | Cache tốt, probe ngắn, nhưng lãng phí RAM. |
| **α ≈ 0.7 - 0.75** | **Cân bằng lý tưởng** | Trade-off tốt giữa memory và speed. **C# `Dictionary` default = 0.72~0.75**. |
| **α > 0.8** | Mảng đông | Collision nhiều, probe dài, hiệu năng sụt giảm mạnh. |
| **α → 1.0** | Mảng gần đầy | Open Addressing: **Tuyệt đối tránh** (Insert/Search có thể vô tận). Chaining: Chuyển thành Linked List thuần túy. |

### Rehashing (Mở rộng mảng - Resize)
Khi `n > capacity * MaxLoadFactor` (ví dụ: thêm phần tử thứ 75 vào mảng size 100 với LF=0.75):
1.  Cấp phát mảng mới gấp đôi kích thước (hoặc x1.5, x2 tùy implement).
2.  **Re-hash TẤT CẢ** các key cũ: Tính lại `index = hash(key) % new_capacity`.
3.  Chèn vào mảng mới.
4.  Giải phóng mảng cũ.

> **Chi phí:** Rehashing tốn `O(N)` và allocation lớn. Nhưng nó xảy ra hiếm (amortized O(1) cho Insert).
> **Mẹo:** Nếu biết trước số lượng phần tử ước lượng (ví dụ 10,000), hãy `new Dictionary(10000)` để tránh rehash nhiều lần.

---

## 5. Triển khai thực tế trong C#: `Dictionary<TKey, TValue>` {#csharp-implementation}

C# `Dictionary` (trong `System.Collections.Generic`) sử dụng **Open Addressing với Double Hashing** + **Randomized Hashing** (bảo mật).

### Cấu trúc nội bộ (Simplified)
```csharp
// Internal structure (conceptual)
private int[] buckets;      // Stores index into entries array + 1 (0 = empty)
private Entry[] entries;    // Contiguous array: { hashCode, next, key, value }
private int count;
private int freeList;       // Index of free slot in entries
private int freeCount;      // Number of free slots

struct Entry {
    public int hashCode;    // Cached hash code (lower 31 bits)
    public int next;        // Index of next entry in collision chain (Open addressing probe chain)
    public TKey key;
    public TValue value;
}
```

### Đặc điểm nổi bật:
1.  **Mảng `entries` liên tục (Contiguous):** Cache-friendly! Khác hẳn Java Chaining dùng Linked List (node phân tán).
2.  **`buckets` lưu index + 1:** `0` nghĩa là empty. Index thực tế trong `entries` = `buckets[i] - 1`.
3.  **Randomized Hashing:** `key.GetHashCode()` bị XOR với một `randomSeed` được sinh lúc runtime (`Environment.TickCount`...). **Mục đích:** Chống **HashDoS Attack** (Hacker gửi hàng triệu key cùng hash để làm sập server).
4.  **Xóa (Remove) dùng "Tombstone":** Không xóa vật lý khỏi `entries` (vì làm hỏng probe chain của key khác). Chỉ set `hashCode = -1` (hoặc key=null). Slot đó trở thành "Free" để Insert sau dùng lại.

### So sánh C# Dictionary vs Java HashMap vs C++ unordered_map

| Đặc tính | C# `Dictionary` | Java `HashMap` (8+) | C++ `unordered_map` |
| :--- | :--- | :--- | :--- |
| **Collision Resolution** | **Open Addressing** (Double Hashing) | **Chaining** (List → Tree) | **Chaining** (Bucket = List) |
| **Memory Layout** | **Contiguous Array** (Cache friendly) | Array of Node pointers (Cache miss) | Array of Node pointers |
| **Worst Case Search** | O(N) (rare,probe full) | **O(log N)** (Treeify) | O(N) |
| **Security (HashDoS)** | **Randomized Hashing** (Default ON) | Hash randomization (Optional) | Hash Policy (Custom) |
| **Remove Performance** | O(1) (Tombstone) | O(1) (Unlink node) | O(1) (Erase node) |
| **Iteration Order** | Insertion Order (Preserved!) | Random (Unstable) | Random |

> **Quan trọng:** C# `Dictionary` **giữ nguyên thứ tự chèn (Insertion Order)** khi duyệt `foreach` (từ .NET Core 3.0+). Điều này **KHÔNG** được đảm bảo bởi Spec nhưng là hành vi ổn định của implementation hiện tại.

---

## 6. Cẩm nang Troubleshooting & Best Practices {#best-practices}

### ✅ DO: Tự định nghĩa `GetHashCode()` & `Equals()` cho Key là `struct`/`class` tự tạo
```csharp
public readonly struct Point : IEquatable<Point>
{
    public int X { get; }
    public int Y { get; }
    
    public Point(int x, int y) { X = x; Y = y; }
    
    public bool Equals(Point other) => X == other.X && Y == other.Y;
    public override bool Equals(object obj) => obj is Point p && Equals(p);
    
    // QUAN TRỌNG: Kết hợp hash bằng cách bất biến (prime multiplier)
    public override int GetHashCode() => HashCode.Combine(X, Y); // .NET Core 2.1+
}
```

### ❌ DON'T: Dùng mutable object làm Key
```csharp
var dict = new Dictionary<List<int>, string>();
var key = new List<int> { 1, 2 };
dict[key] = "value";
key.Add(3); // MUTATED KEY!
// dict[key] giờ sẽ KHÔNG TÌM THẤY (hash code thay đổi) -> MEMORY LEAK LOGIC
```

### ⚡ Performance Tips
1.  **Pre-size:** `new Dictionary<int, string>(expectedCount)` tránh rehash.
2.  **TryGetValue:** Thay `ContainsKey` + `[]` (2 lần hash) bằng `TryGetValue` (1 lần hash).
    ```csharp
    if (dict.TryGetValue(key, out var value)) { /* use value */ }
    ```
3.  **Struct Key:** Ưu tiên `struct` (ValueType) làm Key thay vì `class` để tránh allocation GC và cache miss.
4.  **Alternate Lookup (NET 7+):** `dict.GetAlternateLookup<ReadOnlySpan<char>>()[span]` tra cứu string bằng `Span<char>` **không alloc substring**.

---

## 7. Bảng so sánh tóm tắt {#summary-table}

| Kịch bản | Cấu trúc khuyến nghị | Lý do |
| :--- | :--- | :--- |
| Tra cứu Key-Value chung | `Dictionary<TKey, TValue>` | O(1) nhanh nhất, built-in |
| Chỉ cần Key (Set) | `HashSet<T>` | Tối ưu memory, O(1) Contains |
| Cần giữ thứ tự Key (Sorted) | `SortedDictionary` / `SortedList` | O(log N), dùng Red-Black Tree |
| Key là string, tra cứu prefix | `Trie` (Prefix Tree) | O(L) thay vì O(L) hash + compare |
| Thread-safe | `ConcurrentDictionary` | Lock-free reads, fine-grained locks |
| Memory cực hạn, Key nhỏ | `FrozenDictionary` (.NET 8+) | Read-only, tối ưu memory & speed |
| Cần Multi-value per Key | `Dictionary<TKey, List<TValue>>` hoặc `ILookup` | `ToLookup()` từ LINQ |

---

## 8. Quiz kiểm tra hiểu bản chất {#quiz}

<details class="vt-quiz">
<summary>❓ Quiz 1: Tại sao C# Dictionary dùng Open Addressing thay vì Chaining như Java?</summary>

**Đáp án:**
1.  **Cache Locality:** Mảng `entries` liên tục → CPU load cache line đọc nhiều entry cùng lúc. Java Chasing pointer (Linked List) → Cache miss liên tục.
2.  **Memory Overhead:** Không cần object `Node` wrapper cho mỗi entry (tiết kiệm 16-24 bytes/entry).
3.  **Allocation:** Chỉ alloc 2 mảng lớn (`buckets`, `entries`) thay vì alloc rải rác hàng triệu object Node nhỏ → GC nhẹ nhàng hơn.
</details>

<details class="vt-quiz">
<summary>❓ Quiz 2: Load Factor 0.75 có ý nghĩa gì? Tại sao không để 0.9 hoặc 0.5?</summary>

**Đáp án:**
- **0.75** là "điểm cân bằng" (Golden Ratio) giữa **Memory** và **Probe Length**.
- **Math:** Với Open Addressing, Expected Probes ≈ `1/(1-α)`.
  - α=0.5 → 2 probes. 
  - α=0.75 → 4 probes. 
  - α=0.9 → 10 probes (tăng gấp 2.5 lần so với 0.75).
- **0.5** lãng phí 50% RAM. **0.9** rủi ro probe quá dài & rehash liên tục.
</details>

<details class="vt-quiz">
<summary>❓ Quiz 3: `Dictionary` có thread-safe cho đọc (Multiple Readers) không?</summary>

**Đáp án:** **CÓ** (khi không có Writer). `Dictionary` implementation hiện tại (.NET Core+) an toàn cho **Multiple Readers + No Writers**. Nếu có Writer → Phải dùng `ConcurrentDictionary` hoặc `lock`.
</details>

---

## Next Steps {#next-steps}

Bạn đã nắm vững lý thuyết cốt lõi của Hash Table. Để đi sâu vào thực chiến, hãy khám phá:

1.  **C# Hash Collections Deep Dive:** Xem cách `HashSet`, `ConcurrentDictionary`, `FrozenDictionary` hoạt động khác biệt như thế nào.
2.  **Bài toán thực tế:** "Thiết kế hệ thống Rate Limiter (Token Bucket) dùng Dictionary" hoặc "Triển khai LRU Cache O(1) bằng Dictionary + Doubly Linked List".

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/hash-table/csharp-hash-collections">
    <p class="next-steps-link">C# Hash Collections (Dictionary, HashSet, ConcurrentDictionary, FrozenDictionary)</p>
    <p class="next-steps-caption">So sánh hiệu năng, bộ nhớ và kịch bản sử dụng cho từng loại Collection băm trong .NET.</p>
  </a>
</div>