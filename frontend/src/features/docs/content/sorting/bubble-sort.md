---
title: Sắp xếp Nổi bọt (Bubble Sort)
description: Khám phá cách thuật toán Bubble Sort hoạt động bằng cách đẩy dần các phần tử lớn nhất về cuối mảng như những bọt khí nổi lên mặt nước.
---

# Sắp xếp Nổi bọt (Bubble Sort) {#bubble-sort}

Thuật toán Sắp xếp Nổi bọt (Bubble Sort) có lẽ là thuật toán sắp xếp nổi tiếng nhất đối với người mới học lập trình, không phải vì nó nhanh, mà vì nó cực kỳ dễ hiểu và dễ cài đặt.

Ý tưởng đằng sau Bubble Sort rất trực quan: **So sánh từng cặp phần tử liền kề nhau và đổi chỗ chúng nếu chúng đang đứng sai thứ tự**. Giống như những bọt khí trong một cốc nước có ga, phần tử nặng nhất sẽ "chìm" xuống đáy (cuối mảng), trong khi các phần tử nhẹ hơn sẽ dần dần "nổi" lên trên (đầu mảng).

## Nguyên lý hoạt động (Từng bước) {#how-it-works}

Giả sử chúng ta muốn sắp xếp mảng `[5, 3, 8, 4, 2]` theo thứ tự tăng dần.

**Lượt chạy (Pass) 1:**
1. So sánh `5` và `3` -> Sai thứ tự -> Đổi chỗ -> `[3, 5, 8, 4, 2]`
2. So sánh `5` và `8` -> Đúng thứ tự -> Giữ nguyên -> `[3, 5, 8, 4, 2]`
3. So sánh `8` và `4` -> Sai thứ tự -> Đổi chỗ -> `[3, 5, 4, 8, 2]`
4. So sánh `8` và `2` -> Sai thứ tự -> Đổi chỗ -> `[3, 5, 4, 2, 8]`
*👉 Kết thúc Lượt 1, phần tử lớn nhất là `8` đã "nổi" về đúng vị trí cuối cùng của mảng.*

**Lượt chạy (Pass) 2:**
Bây giờ chúng ta lặp lại quá trình, nhưng bỏ qua số `8` ở cuối vì nó đã đúng chỗ.
1. So sánh `3` và `5` -> Đúng thứ tự
2. So sánh `5` và `4` -> Đổi chỗ -> `[3, 4, 5, 2, 8]`
3. So sánh `5` và `2` -> Đổi chỗ -> `[3, 4, 2, 5, 8]`
*👉 Kết thúc Lượt 2, số `5` đã về đúng vị trí áp chót.*

Quá trình tiếp tục lặp lại cho đến khi mảng được sắp xếp hoàn toàn.

## Độ phức tạp Thuật toán (Complexity) {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tốt nhất)** | **O(N)** - Nếu mảng đã được sắp xếp sẵn (và bạn có dùng cờ tối ưu `isSwapped`). |
| **Thời gian (Trung bình & Xấu nhất)** | **O(N²)** - Phải duyệt qua mảng N lần, mỗi lần lại duyệt thêm N phần tử nữa. |
| **Không gian bộ nhớ** | **O(1)** - Sắp xếp tại chỗ (In-place), chỉ cần một biến tạm để đổi chỗ, không tốn thêm RAM. |
| **Tính ổn định (Stable)** | **Có** - Các phần tử bằng nhau sẽ không bị đảo lộn vị trí ban đầu. |

## Cài đặt (Code Example) {#code-example}

Dưới đây là phiên bản Bubble Sort đã được tối ưu bằng một cờ `isSwapped`. Nếu trong suốt một lượt duyệt không có bất kỳ cặp nào phải đổi chỗ, mảng đã được sắp xếp và ta có thể dừng sớm!

```playground:bubble-sort
```

```dual:bubble-sort
public void BubbleSort(int[] array)
{
    int n = array.Length;
    bool isSwapped;
    
    // Duyệt qua từng lượt
    for (int i = 0; i < n - 1; i++)
    {
        isSwapped = false;
        
        // So sánh các cặp liền kề. 
        // Bỏ qua i phần tử cuối cùng vì chúng đã về đúng vị trí
        for (int j = 0; j < n - i - 1; j++)
        {
            if (array[j] > array[j + 1])
            {
                // Đổi chỗ hai phần tử
                int temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                
                isSwapped = true;
            }
        }
        
        // Nếu không có phần tử nào đổi chỗ, mảng đã được sắp xếp xong!
        if (!isSwapped)
        {
            break;
        }
    }
}
```

:::info Khi nào nên sử dụng Bubble Sort?
Thành thật mà nói, trong thực tế sản xuất phần mềm, **người ta hiếm khi sử dụng Bubble Sort** vì nó quá chậm với O(N²). Tuy nhiên, nó là một công cụ sư phạm tuyệt vời. Bạn nên dùng nó để làm quen với các khái niệm vòng lặp lồng nhau (nested loops) và thao tác hoán vị (swap) cơ bản trước khi tiến tới các thuật toán phức tạp hơn.
:::

:::tip Mẹo phỏng vấn
Nếu người phỏng vấn hỏi bạn: *"Hãy tối ưu Bubble Sort hết mức có thể"*, đừng chỉ trả lời việc dùng vòng lặp `for` lùi (bỏ qua các phần tử đã sort). Hãy nhắc đến cờ `isSwapped`. Cờ này giúp biến thuật toán từ $O(N^2)$ trở thành $O(N)$ trong trường hợp dữ liệu đã được sắp xếp gần hết!
:::

<details class="vt-quiz">
<summary>📝 Kiểm tra nhanh: Tại sao không dùng Bubble Sort cho mảng 1 triệu phần tử?</summary>

**Đáp án:** Vì độ phức tạp là $O(N^2)$. Với mảng 1 triệu ($10^6$) phần tử, thuật toán sẽ cần thực hiện khoảng $10^{12}$ (1 nghìn tỷ) phép so sánh. CPU thông thường sẽ mất hàng chục phút, thậm chí hàng giờ chỉ để sắp xếp mảng này!
</details>

## Next Steps {#next-steps}

Đừng chỉ đọc lý thuyết! Hãy truy cập bảng điều khiển tương tác (Sandbox) bên phải màn hình. Bấm nút "Play" và xem từng vòng lặp được thực thi, các khối màu hoán đổi vị trí cho nhau để thực sự củng cố kiến thức này.

Sau khi đã nắm vững, chúng ta sẽ bước sang một phiên bản sắp xếp tiên tiến hơn, phức tạp hơn, nhưng tốc độ xé gió: **Sắp xếp Nhanh (Quick Sort)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/sorting/quick-sort">
    <p class="next-steps-link">Sắp xếp Nhanh (Quick Sort)</p>
    <p class="next-steps-caption">Sức mạnh của thuật toán Chia để trị (Divide and Conquer).</p>
  </a>
</div>

## Tham khảo lý thuyết {#references}

Dưới đây là các nguồn tài liệu kinh điển và chính thống được dùng để biên soạn bài viết này, giúp bạn tự nghiên cứu sâu hơn nếu muốn:

- **Khái niệm Bubble Sort, nguyên lý nổi bọt và minh họa từng bước:** [Bubble sort - Wikipedia](https://en.wikipedia.org/wiki/Bubble_sort). Nguồn chính về mô tả thuật toán, bảng độ phức tạp và tính ổn định (stable) của thuật toán.
- **Cải tiến cờ `isSwapped` giúp đạt O(N) ở trường hợp tốt nhất:** GeeksforGeeks - [Bubble Sort](https://www.geeksforgeeks.org/bubble-sort/). Bài viết phân tích chi tiết biến thể tối ưu dừng sớm khi mảng đã sắp xếp xong.
- **Nền tảng phân tích độ phức tạp Big O và tính ổn định trong sắp xếp:** Cormen, Leiserson, Rivest & Stein, *Introduction to Algorithms* (CLRS) - Chương về Sắp xếp (Bubble Sort xuất hiện trong bài tập 2-2 của sách).
- **Bối cảnh thực tế: vì sao hiếm khi dùng Bubble Sort trong sản xuất:** Microsoft Learn - [Array.Sort Method (.NET)](https://learn.microsoft.com/en-us/dotnet/api/system.array.sort). Tài liệu giải thích cách .NET dùng thuật toán lai IntroSort nhanh hơn đáng kể so với O(N²).
