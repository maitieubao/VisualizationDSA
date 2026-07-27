---
title: Cây Nhị phân Tìm kiếm (BST)
description: Khám phá Cây nhị phân tìm kiếm (Binary Search Tree) - một trong những cấu trúc dữ liệu thanh lịch và hiệu quả nhất để lưu trữ và truy xuất dữ liệu động.
---

# Cây Nhị phân Tìm kiếm (BST) {#bst}

Mảng (Array) giúp tìm kiếm nhanh (Binary Search) nhưng lại tốn thời gian khi thêm/xóa dữ liệu. Danh sách liên kết (Linked List) giúp thêm/xóa nhanh nhưng tìm kiếm lại chậm chạp như rùa bò. Liệu có cách nào kết hợp được ưu điểm của cả hai cấu trúc trên không? 

Câu trả lời chính là **Cây Nhị phân Tìm kiếm (Binary Search Tree - BST)**.

## Cấu trúc của Cây Nhị phân {#structure}

Khác với mảng là đường thẳng nằm ngang, Cây (Tree) phát triển từ trên xuống dưới.
- **Node (Nút):** Chứa dữ liệu (Value) và tối đa 2 con trỏ chỉ tới 2 Node con.
- **Root (Gốc):** Node trên cùng của cây. Mọi hành trình đều bắt đầu từ Root.
- **Leaf (Lá):** Những Node tận cùng ở dưới đáy, không có Node con nào.
- Mọi Node chỉ có duy nhất **MỘT Node cha** (ngoại trừ Root). Nếu một Node có 2 cha, đó không còn là Cây nữa mà gọi là Đồ thị (Graph).

**Quy tắc Vàng của BST:**
Đối với BẤT KỲ một Node nào trên cây:
1. Mọi giá trị ở **nhánh bên TRÁI** đều phải **NHỎ HƠN** giá trị của Node đó.
2. Mọi giá trị ở **nhánh bên PHẢI** đều phải **LỚN HƠN** giá trị của Node đó.

## Nguyên lý hoạt động {#how-it-works}

Nhờ Quy tắc Vàng, mỗi lần ta di chuyển xuống 1 tầng của cây, ta đã vứt bỏ được một nửa số lượng dữ liệu (giống hệt tư duy Binary Search).

**1. Tìm kiếm (Search):**
Giả sử gốc là `50`. Bạn cần tìm `30`. 
Vì `30 < 50`, bạn lập tức rẽ sang trái, lờ đi toàn bộ nhánh bên phải. Tiếp tục so sánh và rẽ cho đến khi tìm thấy hoặc đi vào ngõ cụt (null).

**2. Thêm mới (Insert):**
Cũng làm y hệt quá trình Tìm kiếm. Khi đi đến ngõ cụt (null), bạn tạo một Node mới và gắn nó vào ngõ cụt đó. Dữ liệu mới luôn trở thành Node Lá (Leaf).

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Trung bình)** | **O(log N)** - Dành cho các thao tác Thêm, Xóa, Tìm kiếm. Chiều cao của cây là log N. |
| **Thời gian (Xấu nhất)** | **O(N)** - Xảy ra khi bạn nhét một mảng *đã sắp xếp sẵn* (`1, 2, 3, 4, 5`) vào BST. Cây sẽ bị mọc lệch hẳn sang bên phải, biến thành một đường thẳng (Linked List). |
| **Không gian bộ nhớ** | **O(N)** - Cần bộ nhớ để lưu trữ N Node. |

## Cài đặt bằng C# (Code Example) {#code-example}

Đầu tiên, ta cần định nghĩa Cấu trúc của một Node:

```csharp
public class TreeNode 
{
    public int Value;
    public TreeNode Left;
    public TreeNode Right;

    public TreeNode(int value) 
    {
        Value = value;
        Left = null;
        Right = null;
    }
}
```

Sau đó là thuật toán **Thêm mới (Insert)** bằng đệ quy cực kỳ thanh lịch:

```csharp
public class BinarySearchTree 
{
    public TreeNode Root;

    public void Insert(int value) 
    {
        Root = InsertRecursive(Root, value);
    }

    private TreeNode InsertRecursive(TreeNode current, int value) 
    {
        // 1. Điểm dừng: Tìm thấy ngõ cụt, tạo Node mới ở đây
        if (current == null) 
        {
            return new TreeNode(value);
        }

        // 2. Rẽ trái nếu nhỏ hơn
        if (value < current.Value) 
        {
            current.Left = InsertRecursive(current.Left, value);
        }
        // 3. Rẽ phải nếu lớn hơn
        else if (value > current.Value) 
        {
            current.Right = InsertRecursive(current.Right, value);
        }

        // 4. Trả về Node hiện tại để các Node cha nối lại dây chỉ
        return current;
    }
}
```

:::warning Cây cân bằng (Balanced Tree)
Như đã nói ở bảng Big O, nhược điểm lớn nhất của BST là nguy cơ bị "mọc lệch" thành O(N). Trong các hệ cơ sở dữ liệu thực tế (như SQL, MySQL), người ta không dùng BST thuần túy. Họ sử dụng các biến thể của nó như **AVL Tree** hay **Red-Black Tree** (Cây Đỏ Đen). 
Các loại cây này có tính năng tự xoay (Rotate) mỗi khi bị lệch để ép chiều cao cây luôn cân đối ở mức O(log N). Lớp `SortedDictionary<TKey, TValue>` trong C# chính là được cài đặt ngầm bằng một Cây Đỏ Đen!
:::

## Next Steps {#next-steps}

Vẽ cây, thêm node, tìm node... tất cả đều theo chiều dọc. Nhưng làm thế nào để chúng ta có thể "in" toàn bộ các giá trị trên cây ra màn hình thành một hàng ngang?

Kỹ thuật lướt qua mọi ngóc ngách của cây mà không bỏ sót Node nào được gọi là **Duyệt Cây (Tree Traversal)**. Hãy chuyển sang bài tiếp theo để khám phá 3 chiến thuật duyệt cây kinh điển: **Pre-order, In-order và Post-order**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/tree-graph/tree-traversal">
    <p class="next-steps-link">Duyệt Cây (Tree Traversal)</p>
    <p class="next-steps-caption">Kỹ thuật đệ quy in ra toàn bộ cây theo 3 thứ tự khác nhau.</p>
  </a>
</div>
