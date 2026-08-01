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

1. **Không duy trì thứ tự:** Do dữ liệu bị băm và ném vào các ô ngẫu nhiên, khi bạn duyệt bằng `foreach`, các phần tử sẽ không trả ra theo thứ tự mà bạn đã `Add` vào (trừ khi dùng `OrderedDictionary`).
2. **Chi phí bộ nhớ lớn (Overhead):** Bảng băm luôn cấp phát thừa bộ nhớ (thường gấp đôi số lượng phần tử cần thiết) để giảm tỷ lệ va chạm (Collision). Khi nó đầy, nó phải tạm dừng chương trình để cấp phát mảng mới và băm lại (Re-hashing) toàn bộ dữ liệu. Nếu bộ nhớ là vấn đề sống còn, bạn nên dùng Mảng truyền thống.

:::tip Tóm tắt nhanh (Key Takeaways)
- Cần ánh xạ 2 dữ liệu (Tên -> Điểm số)? Dùng **`Dictionary<TKey, TValue>`**.
- Cần tìm kiếm cực nhanh hoặc loại bỏ trùng lặp? Dùng **`HashSet<T>`**.
- Cần tiết kiệm từng byte RAM? Hãy cân nhắc lại việc dùng Hash Collections.
:::
