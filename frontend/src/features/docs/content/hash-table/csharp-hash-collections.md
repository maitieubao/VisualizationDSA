---
title: Hash Table trong C# (Dictionary & HashSet)
description: Tìm hiểu cách sử dụng hai cấu trúc dữ liệu ứng dụng Bảng băm được xài nhiều nhất trong thế giới .NET.
---

# Bảng Băm trong C# (Dictionary & HashSet) {#csharp-hash-collections}

:::info Mục tiêu bài học
- Nắm được cách sử dụng `Dictionary<TKey, TValue>` để lưu trữ và tra cứu cặp Khóa-Giá trị.
- Nắm được cách sử dụng `HashSet<T>` để lưu trữ tập hợp các phần tử không trùng lặp và thao tác tập hợp siêu nhanh.
- Hiểu được chi phí ẩn (Overhead) khi sử dụng các collection này.
:::

Hầu như bạn sẽ không bao giờ phải tự tay code một Bảng băm (Hash Table) với các hàm xử lý va chạm phức tạp từ đầu. Nền tảng .NET đã cung cấp sẵn hai bộ sưu tập (Collections) tuyệt vời ứng dụng cấu trúc này: **Dictionary** và **HashSet**.

## 1. Lớp `Dictionary<TKey, TValue>` {#dictionary}

`Dictionary` (trong Java gọi là `HashMap`, trong Python gọi là `dict`) dùng để lưu trữ các cặp dữ liệu có quan hệ 1-1 với nhau, gọi là **Key-Value**.

- **Key (Khóa):** Bắt buộc phải duy nhất (không được trùng lặp). Được dùng làm đầu vào cho hàm băm.
- **Value (Giá trị):** Dữ liệu đi kèm, có thể trùng lặp thoải mái.

### Cách sử dụng cơ bản

```csharp
using System.Collections.Generic;

public void DictionaryExample()
{
    // Tạo một từ điển tra cứu Số điện thoại theo Tên
    Dictionary<string, string> phoneBook = new Dictionary<string, string>();

    // 1. Chèn (Insert) - Tốc độ O(1)
    phoneBook.Add("Alice", "090-123-4567");
    phoneBook.Add("Bob", "098-765-4321");
    // phoneBook.Add("Alice", "011-111-1111"); // LỖI (ArgumentException) vì Key bị trùng!

    // Cập nhật giá trị (Nếu Alice đã tồn tại thì ghi đè, chưa có thì thêm mới)
    phoneBook["Alice"] = "099-999-9999"; 

    // 2. Tra cứu (Lookup) - Tốc độ O(1)
    if (phoneBook.ContainsKey("Bob")) 
    {
        Console.WriteLine("SĐT của Bob là: " + phoneBook["Bob"]);
    }

    // Cách tra cứu an toàn hơn (Không văng lỗi nếu Key không tồn tại)
    if (phoneBook.TryGetValue("Charlie", out string number))
    {
        Console.WriteLine(number);
    }
    else
    {
        Console.WriteLine("Không tìm thấy Charlie!");
    }

    // 3. Xóa (Delete) - Tốc độ O(1)
    phoneBook.Remove("Alice");
}
```

## 2. Lớp `HashSet<T>` {#hashset}

Khác với Dictionary lưu theo cặp, `HashSet` chỉ lưu trữ duy nhất các **Key**. 
Mục đích chính của HashSet không phải là để lấy dữ liệu ra, mà là để **trả lời câu hỏi (O(1)): "Phần tử này đã từng xuất hiện hay chưa?"** và **"Loại bỏ các phần tử trùng lặp"**.

### Cách sử dụng cơ bản

```csharp
using System.Collections.Generic;

public void HashSetExample()
{
    // Tạo một tập hợp biển số xe đã vi phạm
    HashSet<string> bannedPlates = new HashSet<string>();

    // 1. Chèn - O(1)
    bannedPlates.Add("51F-12345");
    bannedPlates.Add("29A-99999");
    
    // Nếu thêm một biển số đã tồn tại, nó chỉ đơn giản bỏ qua và trả về false (Không ném lỗi)
    bool isAdded = bannedPlates.Add("51F-12345"); // isAdded = false

    // 2. Tra cứu xem có vi phạm không? - Cực nhanh O(1)
    if (bannedPlates.Contains("29A-99999"))
    {
        Console.WriteLine("Báo cảnh sát!");
    }

    // HashSet đặc biệt hữu ích khi xử lý mảng có dữ liệu trùng lặp
    int[] numbers = { 1, 2, 2, 3, 4, 4, 5 };
    HashSet<int> uniqueNumbers = new HashSet<int>(numbers); 
    // uniqueNumbers bây giờ chỉ chứa: { 1, 2, 3, 4, 5 }
}
```

## 3. Khi nào KHÔNG nên dùng Hash Collections? {#when-not-to-use}

Dù `Dictionary` và `HashSet` nhanh vô địch ở thao tác chèn và tìm kiếm `O(1)`, nhưng chúng không phải là "chìa khóa vạn năng":

1. **Không duy trì thứ tự:** Do dữ liệu bị băm và ném vào các ô ngẫu nhiên, khi bạn duyệt bằng `foreach`, các phần tử sẽ không trả ra theo thứ tự mà bạn đã `Add` vào. Nếu cần duyệt khóa theo thứ tự tăng dần, hãy dùng `SortedDictionary<TKey, TValue>` (tốn `O(log n)`); còn nếu cần đúng thứ tự chèn thì dùng `OrderedDictionary` (phi generic) hoặc `List<KeyValuePair<TKey, TValue>>`.
2. **Chi phí bộ nhớ lớn (Overhead):** Bảng băm luôn cấp phát thừa bộ nhớ (thường gấp đôi số lượng phần tử cần thiết) để giảm tỷ lệ va chạm (Collision). Khi nó đầy, nó phải tạm dừng chương trình để cấp phát mảng mới và băm lại (Re-hashing) toàn bộ dữ liệu. Nếu bộ nhớ là vấn đề sống còn, bạn nên dùng Mảng truyền thống.

## 4. Khóa (Key), hợp đồng `GetHashCode`/`Equals` và các Collection liên quan {#key-hash-contract}

### Hợp đồng bất biến giữa `Equals` và `GetHashCode`

Mọi kiểu được dùng làm **Key** trong `Dictionary` hoặc `HashSet` đều phải tuân theo hợp đồng (Contract) giữa hai phương thức `Equals(object)` và `GetHashCode()`:

1. **Nếu hai đối tượng bằng nhau (`Equals` trả về `true`) thì `GetHashCode()` của chúng PHẢI trả về cùng một giá trị.** Chiều ngược lại không bắt buộc — hai đối tượng khác nhau có thể trùng mã băm (đó chính là va chạm).
2. **Giá trị `GetHashCode()` phải ổn định trong suốt vòng đời của đối tượng** khi nó đang nằm trong collection.
3. **Khóa phải là BẤT BIẾN (Immutable).** Nếu bạn thay đổi các trường mà `GetHashCode()` dựa vào *sau khi* chèn đối tượng vào `Dictionary`/`HashSet`, đối tượng sẽ "biến mất" khỏi collection: nó đang nằm trong bucket tính theo mã băm cũ, nhưng lần tra cứu kế tiếp lại tính bằng mã băm mới.
4. **Tránh dùng `struct` (kiểu giá trị) mutable làm Key**, đặc biệt là struct chứa trường có thể bị ghi đè. Nên ưu tiên `string`, `int`, `Guid` hoặc các `record`/class bất biến.

### Khác biệt với `SortedDictionary` và `Lookup`

Ngoài `Dictionary` và `HashSet`, .NET còn cung cấp hai collection băm đáng chú ý:

- **`SortedDictionary<TKey, TValue>`** — giữ khóa theo **thứ tự so sánh** (nội bộ dùng cây Red-Black Tree). Mọi thao tác tốn `O(log n)`, nhưng bù lại bạn luôn duyệt được các phần tử theo thứ tự tăng dần của khóa.
- **`Lookup<TKey, TValue>`** — cấu trúc "một khóa - nhiều giá trị" (multimap) dùng bảng băm. Nó không có constructor công khai; bạn tạo ra qua `Enumerable.ToLookup()`. Khác với `Dictionary`, tra cứu một khóa không tồn tại trả về chuỗi rỗng thay vì ném lỗi.

```csharp
using System.Linq;

// SortedDictionary: luôn duyệt khóa theo thứ tự tăng dần
var byRank = new SortedDictionary<int, string>
{
    [3] = "Bronze",
    [1] = "Gold",
    [2] = "Silver"
};
// Kết quả duyệt: 1, 2, 3 (khác hẳn thứ tự chèn)
foreach (var kvp in byRank)
{
    Console.WriteLine($"{kvp.Key}: {kvp.Value}");
}

// Lookup: một khóa - nhiều giá trị
string[] words = { "apple", "avocado", "banana" };
ILookup<char, string> byFirstLetter = words.ToLookup(w => w[0]);
// byFirstLetter['a'] trả về { "apple", "avocado" }
// Tra cứu khóa không tồn tại (ví dụ 'z') chỉ trả về chuỗi rỗng, KHÔNG ném lỗi
```

:::tip Tóm tắt nhanh (Key Takeaways)
- Cần ánh xạ 2 dữ liệu (Tên -> Điểm số)? Dùng **`Dictionary<TKey, TValue>`**.
- Cần tìm kiếm cực nhanh hoặc loại bỏ trùng lặp? Dùng **`HashSet<T>`**.
- Cần tiết kiệm từng byte RAM? Hãy cân nhắc lại việc dùng Hash Collections.
:::

---

## Next Steps {#next-steps}

Bạn đã nắm được cách sử dụng `Dictionary` và `HashSet` trong thực chiến .NET. Để củng cố nền tảng, hãy xem lại lý thuyết Bảng băm hoặc thử sức với những bài toán áp dụng:

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/hash-table/hash-table-theory">
    <p class="next-steps-link">Lý thuyết Bảng Băm (Hash Table)</p>
    <p class="next-steps-caption">Hàm băm, xử lý va chạm, Load Factor và phân tích độ phức tạp trung bình O(1).</p>
  </a>
  <a class="vt-box" href="/docs/intro/big-o">
    <p class="next-steps-link">Độ phức tạp & Ký hiệu O lớn</p>
    <p class="next-steps-caption">Ôn lại cách đọc và so sánh chi phí O(1) với các lớp độ phức tạp khác.</p>
  </a>
  <a class="vt-box" href="/docs/practice/leetcode-examples">
    <p class="next-steps-link">Giải mẫu LeetCode</p>
    <p class="next-steps-caption">Vận dụng Dictionary/HashSet để giải các bài toán phỏng vấn thường gặp.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Các kiến thức lý thuyết trong bài được tổng hợp và đối chiếu từ những nguồn học thuật sau:

- **Lý thuyết Bảng băm (Hash Table), hàm băm và phân tích độ phức tạp trung bình:** Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C., *Introduction to Algorithms* (CLRS), 3rd Edition, MIT Press, 2009 — Chương 11 *Hash Tables*.
- **Khái niệm tổng quan, va chạm (Collision) và các phương pháp xử lý:** Wikipedia, *Hash table* — https://en.wikipedia.org/wiki/Hash_table
- **API, hành vi nội bộ và các method của `Dictionary<TKey, TValue>`:** Microsoft Learn, *Dictionary\<TKey, TValue\> Class* — https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2
- **API, hành vi nội bộ và các method của `HashSet<T>`:** Microsoft Learn, *HashSet\<T\> Class* — https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1
- **Hợp đồng giữa `Equals` và `GetHashCode`, nguyên tắc khóa bất biến:** Microsoft Learn, *Object.GetHashCode Method* — https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode
- **Các bài toán ứng dụng Bảng băm và so sánh các cấu trúc băm:** GeeksforGeeks, *Hashing Data Structure* — https://www.geeksforgeeks.org/hashing-data-structure/
- **Bài giảng về Hashing trong thiết kế cấu trúc dữ liệu:** MIT OpenCourseWare, *6.006 Introduction to Algorithms, Spring 2020* — https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/
