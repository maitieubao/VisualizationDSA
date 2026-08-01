---
title: Duyệt Cây (Tree Traversal)
description: Khám phá 3 kỹ thuật duyệt cây đệ quy kinh điển - In-order, Pre-order và Post-order - để thao tác với mọi Node trên cây mà không bỏ sót bất cứ thứ gì.
---

# Duyệt Cây Nhị phân {#tree-traversal}

Duyệt (Traversal) có nghĩa là đi qua và "thăm" (ví dụ: in ra màn hình) tất cả các Node trên Cây đúng một lần. 

Với mảng 1 chiều, duyệt rất đơn giản: dùng một vòng lặp `for` chạy từ trái sang phải. Nhưng Cây là một cấu trúc phi tuyến tính (non-linear) 2 chiều. Từ một Node, bạn có thể rẽ trái hoặc rẽ phải. Bạn sẽ ưu tiên rẽ hướng nào trước? 

Nhờ vào Đệ quy (Recursion), chúng ta có 3 chiến thuật duyệt cây theo Chiều sâu (Depth-First) vô cùng ngắn gọn và thanh lịch.

Tên gọi của các phương pháp duyệt phụ thuộc vào thời điểm bạn "Thăm" **Node Hiện Tại (N)** so với việc duyệt nhánh **Trái (L)** và nhánh **Phải (R)**.

## 1. Duyệt Tiền thứ tự (Pre-order: N - L - R) {#pre-order}

Ở phương pháp này, ta thăm Node hiện tại TRƯỚC, rồi mới duyệt nhánh con trái, sau cùng là nhánh con phải.
**Cách nhớ:** Chữ **"Pre"** nghĩa là "Trước". Node hiện tại nằm ở Trước.

**Đặc điểm:** Root sẽ luôn là phần tử đầu tiên được in ra.
**Ứng dụng:** Dùng để tạo ra một bản sao (Copy) của Cây, hoặc dùng để Serialize cây thành một chuỗi văn bản.

```csharp
public void PreOrderTraversal(TreeNode node)
{
    if (node == null) return;

    // 1. N: Thăm Node hiện tại
    Console.Write(node.Value + " ");
    
    // 2. L: Đệ quy duyệt toàn bộ nhánh Trái
    PreOrderTraversal(node.Left);
    
    // 3. R: Đệ quy duyệt toàn bộ nhánh Phải
    PreOrderTraversal(node.Right);
}
```

## 2. Duyệt Trung thứ tự (In-order: L - N - R) {#in-order}

Ta duyệt toàn bộ nhánh Trái đến tận cùng đáy, sau đó quay lên thăm Node hiện tại, rồi mới qua nhánh Phải.
**Cách nhớ:** Chữ **"In"** nghĩa là "Ở giữa". Node hiện tại nằm kẹp Giữa nhánh Trái và Phải.

**Đặc điểm tuyệt diệu:** Nếu bạn áp dụng In-order lên một Cây Nhị phân Tìm kiếm (BST), kết quả in ra sẽ là một dãy số **đã được sắp xếp tăng dần hoàn hảo!**
**Ứng dụng:** Xuất dữ liệu BST theo thứ tự tăng dần. (Nếu muốn in giảm dần, chỉ cần đổi thành R - N - L).

```csharp
public void InOrderTraversal(TreeNode node)
{
    if (node == null) return;

    // 1. L: Đệ quy duyệt nhánh Trái
    InOrderTraversal(node.Left);

    // 2. N: Thăm Node hiện tại
    Console.Write(node.Value + " ");
    
    // 3. R: Đệ quy duyệt nhánh Phải
    InOrderTraversal(node.Right);
}
```

## 3. Duyệt Hậu thứ tự (Post-order: L - R - N) {#post-order}

Ta duyệt nát cả nhánh Trái và nhánh Phải, xong xuôi hết rồi mới "xử lý" Node cha hiện tại.
**Cách nhớ:** Chữ **"Post"** nghĩa là "Sau cùng". Node hiện tại nằm ở Sau cùng.

**Đặc điểm:** Root sẽ luôn là phần tử cuối cùng được in ra.
**Ứng dụng:** 
- Xóa một cây (Delete Tree): Bạn không thể xóa Node cha khi các con của nó vẫn còn sống lơ lửng trong bộ nhớ. Bạn phải xóa hết con Trái, con Phải, rồi mới xóa Cha.
- Tính toán dung lượng/kích thước của thư mục (Bạn phải tính tổng dung lượng các thư mục con bên trong rồi mới biết thư mục gốc nặng bao nhiêu).

```csharp
public void PostOrderTraversal(TreeNode node)
{
    if (node == null) return;

    // 1. L: Đệ quy nhánh Trái
    PostOrderTraversal(node.Left);
    
    // 2. R: Đệ quy nhánh Phải
    PostOrderTraversal(node.Right);

    // 3. N: Cuối cùng mới thăm Node hiện tại
    Console.Write(node.Value + " ");
}
```

:::info Điều kỳ diệu của Đệ quy
Bạn có nhận ra 3 đoạn code trên hoàn toàn giống nhau 100%, chỉ khác đúng **vị trí của dòng code in ra màn hình** không?
Chỉ bằng cách thay đổi vị trí dòng xử lý (trước, giữa, hay sau lời gọi hàm đệ quy), luồng chạy của chương trình thay đổi một cách kinh ngạc. Đó chính là sự thanh lịch tuyệt đỉnh của Cấu trúc dữ liệu phi tuyến.
:::

## Next Steps {#next-steps}

Cả 3 phương pháp trên đều có chung một đặc tính: **Cắm đầu đi sâu xuống tận đáy rồi mới vòng lên**. Do đó, chúng được xếp chung vào nhóm thuật toán **DFS (Duyệt theo chiều sâu)**.

Vậy nếu chúng ta không muốn cắm đầu đi sâu, mà muốn duyệt Cây theo từng tầng, từng lớp (ví dụ: quét ngang Tầng 1, xong xuống quét ngang Tầng 2)? Kỹ thuật đó gọi là **BFS (Duyệt theo chiều rộng)**, và để làm được nó, ta sẽ phải mời lại một người bạn cũ: **Hàng đợi (Queue)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/tree-graph/bfs">
    <p class="next-steps-link">Duyệt theo chiều rộng (BFS)</p>
    <p class="next-steps-caption">Kỹ thuật quét ngang qua cây theo từng tầng bằng Queue.</p>
  </a>
</div>
