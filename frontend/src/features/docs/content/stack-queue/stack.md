---
title: Ngăn xếp (Stack) – Nguyên lý LIFO
description: Tìm hiểu cấu trúc dữ liệu cơ bản nhất nhưng lại đóng vai trò tối quan trọng trong việc quản lý bộ nhớ và lịch sử thao tác của mọi phần mềm.
---

# Ngăn xếp (Stack) {#stack}

Ngăn xếp (Stack) là một cấu trúc dữ liệu tuyến tính vô cùng đơn giản nhưng lại là "xương sống" của Khoa học máy tính. Mọi chương trình máy tính (kể cả trình duyệt web bạn đang dùng, hay phần mềm bạn đang code) đều dựa vào Stack để hoạt động.

Stack hoạt động theo một nguyên lý duy nhất: **LIFO (Last-In, First-Out)** - Cái gì đưa vào sau cùng thì sẽ được lấy ra đầu tiên.

## Nguyên lý hoạt động {#how-it-works}

Hãy tưởng tượng bạn có một chồng đĩa trong nhà hàng. Khi bạn cất đĩa sau khi rửa xong, bạn đặt chiếc đĩa mới lên **đỉnh** của chồng đĩa. Khi có khách đến và cần lấy đĩa, nhân viên cũng chỉ lấy chiếc đĩa ở **đỉnh** ra. Sẽ thật thảm họa nếu ai đó cố gắng rút chiếc đĩa ở tận cùng dưới đáy!

Các thao tác cơ bản trên một Stack bao gồm:
1. **Push:** Thêm một phần tử vào Đỉnh (Top) của Stack.
2. **Pop:** Lấy (và xóa) phần tử ở Đỉnh của Stack ra.
3. **Peek / Top:** Xem giá trị của phần tử ở Đỉnh mà không xóa nó.
4. **IsEmpty:** Kiểm tra xem Stack có đang rỗng hay không.

Tất cả các thao tác trên đều có độ phức tạp thời gian là **O(1)**.

## Cài đặt bằng C# (Code Example) {#code-example}

Trong C#, bạn hiếm khi phải tự viết lại Stack bằng mảng hay Linked List, vì .NET đã cung cấp sẵn class `Stack<T>` cực kỳ tối ưu.

```csharp
using System.Collections.Generic;

public void StackExample()
{
    // Khởi tạo một Stack chứa các chuỗi
    Stack<string> history = new Stack<string>();

    // Push: Người dùng truy cập các trang web
    history.Push("google.com");
    history.Push("facebook.com");
    history.Push("github.com");

    // Peek: Xem trang hiện tại (Trang cuối cùng vừa vào)
    Console.WriteLine(history.Peek()); // In ra: "github.com"

    // Pop: Người dùng bấm nút "Back" trên trình duyệt
    string lastPage = history.Pop();
    Console.WriteLine($"Vừa thoát khỏi: {lastPage}"); // In ra: "github.com"

    // Kiểm tra trang hiện tại sau khi Back
    Console.WriteLine(history.Peek()); // In ra: "facebook.com"
}
```

:::warning Lưu ý về Exception
Nếu bạn gọi hàm `.Pop()` hoặc `.Peek()` trên một Stack đang rỗng rỗng (Empty), C# sẽ ném ra lỗi `InvalidOperationException`. Hãy luôn kiểm tra `history.Count > 0` hoặc dùng hàm `.TryPop(out var result)` ở các phiên bản C# mới.
:::

## Ứng dụng thực tế {#real-world}

Vì tính chất "Nhớ lại quá khứ gần nhất" (Remembering the immediate past), Stack được sử dụng ở khắp mọi nơi:

1. **Nút Back của Trình duyệt:** Mỗi khi bạn sang trang mới, URL hiện tại được Push vào Stack. Khi bấm Back, URL được Pop ra.
2. **Tính năng Undo / Redo:** Trong Word, Photoshop hay Visual Studio. Mỗi thao tác bạn gõ phím hay vẽ một nét cọ đều được Push vào Stack "Lịch sử". Bấm `Ctrl + Z` chính là gọi lệnh Pop!
3. **Call Stack của Hệ điều hành:** Khi Hàm A gọi Hàm B, hệ thống "Push" vị trí của Hàm A vào bộ nhớ Stack để nhớ đường quay về. Khi Hàm B chạy xong (Pop), hệ thống lấy vị trí của Hàm A ra và tiếp tục chạy. (Đó là lý do ta có lỗi `StackOverflow` nếu đệ quy vô hạn).
4. **Kiểm tra dấu ngoặc hợp lệ (Valid Parentheses):** Dùng để parse các biểu thức toán học hoặc biên dịch mã nguồn.

## Next Steps {#next-steps}

Stack là cấu trúc "Vào sau, Ra trước". Nhưng trong cuộc sống thực tế, sự bất công đó ít khi được chấp nhận. Xếp hàng mua vé mà người đến sau lại được phục vụ trước thì thật là thảm họa!

Vậy nên, chúng ta có một người anh em của Stack, chuyên xử lý những tình huống "Công bằng" hơn: **Hàng đợi (Queue)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/stack-queue/queue">
    <p class="next-steps-link">Hàng đợi (Queue) – Nguyên lý FIFO</p>
    <p class="next-steps-caption">Người đến trước, phục vụ trước - Cấu trúc dữ liệu của sự công bằng.</p>
  </a>
</div>
