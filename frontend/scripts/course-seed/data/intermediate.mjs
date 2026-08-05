export const intermediateCourse = {
  title: 'Giải thuật & Cấu trúc dữ liệu nâng cao',
  description:
    'Khóa học trung cấp dành cho người đã nắm nền tảng: sắp xếp hiệu quả (Merge/Quick/Heap Sort), cây nhị phân và cây cân bằng AVL, hàng đợi ưu tiên, đồ thị với BFS/DFS và Dijkstra, hai con trỏ, cửa sổ trượt và quy hoạch động cơ bản. Định hướng theo lộ trình GeeksforGeeks DSA Roadmap giai đoạn 2 và giáo trình MIT 6.006.',
  thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
  expectedTime: 60,
  category: 'Algorithm',
  difficulty: 'Intermediate',
  isPremium: false,
  isPublished: true,
  modules: [
    {
      title: 'Chương 1: Sắp xếp hiệu quả & Chia để trị',
      description:
        'Làm chủ các thuật toán sắp xếp O(n log n): Merge Sort, Quick Sort, Heap Sort, cùng tư tưởng Divide & Conquer và các loại sắp xếp tuyến tính.',
      lessons: [
        {
          title: 'Merge Sort: chia để trị & merge hai dãy',
          sandboxType: 'sorting',
          xpReward: 25,
          contentMd: `# Merge Sort: chia để trị & merge hai dãy

## Mục tiêu bài học
- Hiểu tư tưởng **Divide & Conquer** (chia để trị) qua Merge Sort.
- Triển khai đúng hàm \`merge\` hai dãy con đã sắp.
- Phân tích O(n log n) thời gian, O(n) không gian phụ.

## Ý tưởng
Chia mảng làm đôi liên tục tới khi còn 1 phần tử (hiển nhiên đã sắp), rồi **trộn** (merge) các cặp dãy con đã sắp lại với nhau:

\`\`\`js
function mergeSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  mergeSort(arr, lo, mid);
  mergeSort(arr, mid + 1, hi);
  merge(arr, lo, mid, hi);
}

function merge(arr, lo, mid, hi) {
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}
\`\`\`

## Phân tích độ phức tạp
Mỗi cấp đệ quy duyệt tổng cộng O(n) phần tử; có \`log₂n\` cấp → **O(n log n)** ở mọi trường hợp (worst, average, best).

## Đặc điểm quan trọng
- **Ổn định (stable)**: phần tử bằng nhau giữ nguyên thứ tự — nhờ phép so sánh \`left[i] <= right[j]\`.
- **Không tại chỗ (not in-place)**: cần mảng phụ O(n) bộ nhớ.
- Phù hợp **danh sách liên kết** và dữ liệu không truy cập ngẫu nhiên tốt.

## Bài tập tự luyện
1. Đếm số cặp nghịch thế (inversions) dùng merge sort — thêm 1 bộ đếm vào hàm merge.
2. Sắp xếp danh sách liên kết đơn bằng merge sort (không cấp phát mảng).
3. Merge k mảng đã sắp thành một mảng (dùng vòng lặp merge từng cặp).

## Tài liệu tham khảo
- GeeksforGeeks — *Merge Sort*
- CLRS Chapter 2: *Getting Started* (2.3 Designing algorithms)
- MIT 6.006 Lecture 3: *Divide & Conquer*`,
        },
        {
          title: 'Quick Sort: chọn pivot & phân vùng Lomuto/Hoare',
          sandboxType: 'sorting',
          xpReward: 30,
          contentMd: `# Quick Sort: chọn pivot & phân vùng Lomuto/Hoare

## Mục tiêu bài học
- Hiểu cơ chế phân vùng (partition) và vai trò của pivot.
- So sánh phân vùng Lomuto (dễ viết) và Hoare (nhanh hơn).
- Phân tích trường hợp tốt O(n log n) và xấu O(n²), cách né tránh.

## Ý tưởng
Chọn một phần tử làm **pivot**, hoán vị mảng sao cho mọi phần tử nhỏ hơn pivot nằm bên trái, lớn hơn nằm bên phải; pivot về đúng vị trí cuối cùng. Đệ quy hai bên.

## Phân vùng Lomuto (pivot cuối)
\`\`\`js
function partitionLomuto(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  const p = partitionLomuto(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
}
\`\`\`

## Phân vùng Hoare (pivot giữa)
\`\`\`js
function partitionHoare(arr, lo, hi) {
  const pivot = arr[(lo + hi) >> 1];
  let i = lo, j = hi;
  while (true) {
    while (arr[i] < pivot) i++;
    while (arr[j] > pivot) j--;
    if (i >= j) return j;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++; j--;
  }
}
\`\`\`

## Trường hợp xấu O(n²) & cách né
Pivot luôn là min/max (mảng đã sắp) → phân vùng mất cân bằng. Né bằng: chọn pivot **ngẫu nhiên** hoặc **Median-of-Three**. Quick Sort **không ổn định**.

## Bài tập tự luyện
1. Quick Select: tìm phần tử lớn thứ k trong O(n) trung bình (chỉ đệ quy một bên).
2. Chia mảng thành 3 vùng: < pivot, = pivot, > pivot (Dutch National Flag) để xử lý phần tử trùng.
3. Tìm k phần tử nhỏ nhất mà không cần sắp toàn bộ.

## Tài liệu tham khảo
- GeeksforGeeks — *Quick Sort*
- CLRS Chapter 7: *Quicksort*
- MIT 6.006 Lecture 5: *Linear Time Sorting* (so sánh với Counting Sort)`,
        },
        {
          title: 'Heap Sort & hàng đợi ưu tiên (Priority Queue)',
          sandboxType: 'sorting',
          xpReward: 30,
          contentMd: `# Heap Sort & hàng đợi ưu tiên (Priority Queue)

## Mục tiêu bài học
- Hiểu cấu trúc **Binary Heap** (max-heap/min-heap) biểu diễn bằng mảng.
- Triển khai \`heapify\`, \`siftDown\`, \`siftUp\` và Heap Sort tại chỗ O(n log n).
- Dùng heap xây Priority Queue — nền tảng của Dijkstra và Huffman.

## Heap là gì?
Cây nhị phân gần đầy: mọi nút \`i\` có con trái \`2i+1\`, con phải \`2i+2\`. **Max-heap**: \`arr[i] ≥ arr[con]\`. Hàm \`heapify\` đẩy một nút xuống đúng vị trí:

\`\`\`js
function siftDown(arr, n, i) {
  while (true) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest === i) break;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}

function heapSort(arr) {
  for (let i = (arr.length >> 1) - 1; i >= 0; i--) siftDown(arr, arr.length, i);
  for (let end = arr.length - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, end, 0);
  }
}
\`\`\`

## Priority Queue
Thao tác \`push\` (thêm vào cuối + siftUp O(log n)) và \`pop\` (lấy root + siftDown O(log n)):
- **Max-heap**: phần tử lớn nhất luôn ở \`arr[0]\`.
- Dùng cho: lấy "k phần tử lớn nhất", sắp xếp luồng dữ liệu động (online median), Dijkstra.

## So sánh với các thuật toán khác
| Thuật toán | Time | Space | Ổn định | Đặc điểm |
| :--- | :--- | :--- | :--- | :--- |
| Merge Sort | O(n log n) | O(n) | ✅ | Ổn định, phù hợp LL |
| Quick Sort | O(n log n)* | O(log n) | ❌ | Nhanh thực tế, đệ quy |
| Heap Sort | O(n log n) | O(1) | ❌ | Tại chỗ, thứ tự đảo lộn |

## Bài tập tự luyện
1. Xây min-heap từ mảng và in ra 3 phần tử nhỏ nhất.
2. Dùng heap tìm **Median liên tục** trong dòng dữ liệu (2 heaps).
3. Giải thích tại sao heap sort không ổn định — cho ví dụ phản chứng.

## Tài liệu tham khảo
- GeeksforGeeks — *Heap Sort* và *Priority Queue*
- CLRS Chapter 6: *Heapsort*
- Programiz — *Heap Sort Data Structure*`,
        },
        {
          title: 'Counting Sort, Radix Sort & sắp xếp tuyến tính',
          sandboxType: 'sorting',
          xpReward: 25,
          contentMd: `# Counting Sort, Radix Sort & sắp xếp tuyến tính

## Mục tiêu bài học
- Hiểu ý tưởng "sắp xếp không so sánh" đạt O(n + k).
- Triển khai Counting Sort (ổn định) và Radix Sort.
- Biết khi nào dùng sắp xếp tuyến tính thay cho sắp xếp so sánh.

## Counting Sort
Đếm tần suất từng giá trị trong khoảng \`[0, k-1]\`, cộng dồn để biết vị trí đích, đặt ngược từ cuối để giữ **tính ổn định**:

\`\`\`js
function countingSort(arr, k) {
  const count = new Array(k).fill(0);
  for (const x of arr) count[x]++;
  for (let i = 1; i < k; i++) count[i] += count[i - 1];
  const out = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    out[--count[arr[i]]] = arr[i];
  }
  return out;
}
\`\`\`

**Giới hạn**: chỉ dùng được với khóa nguyên, khoảng giá trị nhỏ so với n. Độ phức tạp **O(n + k)**.

## Radix Sort
Sắp xếp theo từng chữ số (hàng đơn vị → hàng chục → hàng trăm), mỗi vòng dùng Counting Sort ổn định:

\`\`\`js
function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    // counting sort theo (arr[i] / exp) % 10
  }
  return arr;
}
\`\`\`

Với số có d chữ số: **O(d · (n + 10)) ≈ O(d·n)** — tuyến tính khi d là hằng số.

## Định lý chặn dưới
Sắp xếp chỉ dùng so sánh có chặn dưới **Ω(n log n)**. Muốn nhanh hơn phải khai thác cấu trúc dữ liệu (CLRS Chapter 8).

## Bài tập tự luyện
1. Sắp xếp chuỗi ký tự theo độ dài rồi theo thứ tự từ điển bằng counting sort ổn định.
2. Nếu khoảng giá trị là 10⁹ thì có nên dùng counting sort không? Vì sao?
3. Sắp xếp số thực có 2 chữ số thập phân dùng radix sort như thế nào?

## Tài liệu tham khảo
- GeeksforGeeks — *Counting Sort*, *Radix Sort*
- CLRS Chapter 8: *Sorting in Linear Time`
        },
      ],
    },
    {
      title: 'Chương 2: Cây nhị phân, BST & Cây AVL',
      description:
        'Đi sâu vào cây nhị phân: duyệt cây, cây tìm kiếm nhị phân (BST), cây cân bằng AVL và Heap dạng mảng.',
      lessons: [
        {
          title: 'Duyệt cây: Preorder, Inorder, Postorder & Level-order',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Duyệt cây: Preorder, Inorder, Postorder & Level-order

## Mục tiêu bài học
- Nắm chắc 3 phép duyệt đệ quy DFS và duyệt theo tầng BFS.
- Liên hệ thứ tự duyệt với bài toán nén dãy, biểu diễn biểu thức.
- Cài đặt duyệt cây **không đệ quy** bằng stack.

## Các phép duyệt DFS
Với cây nhị phân gốc nút \`root\`:
- **Preorder** (N-L-R): gốc → trái → phải. Dùng để **sao chép cây**, xuất biểu thức tiền tố.
- **Inorder** (L-N-R): trái → gốc → phải. Trên BST cho dãy **đã sắp tăng**.
- **Postorder** (L-R-N): trái → phải → gốc. Dùng để **giải phóng cây**, tính giá trị biểu thức hậu tố.

\`\`\`js
function inorder(node, visit) {
  if (!node) return;
  inorder(node.left, visit);
  visit(node);
  inorder(node.right, visit);
}

function inorderIterative(root, visit) {
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    visit(cur);
    cur = cur.right;
  }
}
\`\`\`

## Level-order (BFS)
Dùng hàng đợi: mỗi vòng pop nút, push hai con. Ghi nhận độ sâu từng tầng để giải bài toán "in từng tầng".

## Chiều cao & kích thước
- Kích thước = 1 + size(left) + size(right).
- Chiều cao = 1 + max(height(left), height(right)), cây rỗng có chiều cao 0.

## Bài tập tự luyện
1. Từ **preorder + inorder** dựng lại cây nhị phân duy nhất.
2. Kiểm tra hai cây giống hệt nhau (same tree) bằng đệ quy.
3. Kiểm tra cây có phải **BST** không — dùng khoảng giá trị (min, max) khi đệ quy.

## Tài liệu tham khảo
- GeeksforGeeks — *Tree Traversals (Inorder, Preorder and Postorder)*
- CLRS Chapter 12: *Binary Search Trees* (12.1)
- MIT 6.006 Lecture 6: *Binary Trees*`,
        },
        {
          title: 'BST: chèn, xóa, tìm & phân tích chiều cao',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# BST: chèn, xóa, tìm & phân tích chiều cao

## Mục tiêu bài học
- Hiểu bất biến (invariant) của BST: \`left < node ≤ right\`.
- Cài đặt chèn, tìm kiếm, tìm min/max và **xóa với 3 trường hợp**.
- Nhận ra nhược điểm: BST suy biến thành danh sách liên kết → O(n).

## Chèn & tìm kiếm
\`\`\`js
function insert(root, key) {
  if (!root) return { key, left: null, right: null };
  if (key < root.key) root.left = insert(root.left, key);
  else if (key > root.key) root.right = insert(root.right, key);
  return root;
}

function search(root, key) {
  if (!root || root.key === key) return root;
  return key < root.key ? search(root.left, key) : search(root.right, key);
}
\`\`\`

## Xóa: 3 trường hợp
1. **Nút lá**: xóa trực tiếp.
2. **Một con**: nối con lên thay vị trí nút.
3. **Hai con**: thay bằng **node kế cận inorder** (inorder successor — nút nhỏ nhất của cây con phải), rồi xóa nút đó.

\`\`\`js
function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.key) root.left = deleteNode(root.left, key);
  else if (key > root.key) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.key = succ.key;
    root.right = deleteNode(root.right, succ.key);
  }
  return root;
}
\`\`\`

## Phân tích
- **Cân bằng**: chiều cao h = O(log n) → mọi thao tác O(log n).
- **Xấu nhất**: khóa chèn theo thứ tự tăng dần → cây lệch phải, h = O(n) → mọi thao tác O(n).
- Giải pháp: **cây tự cân bằng** — AVL (chương tiếp theo), Red-Black Tree.

## Bài tập tự luyện
1. Tìm **LCA** (Lowest Common Ancestor) của hai nút trong BST.
2. Kiểm tra BST hợp lệ không dùng khoảng [−∞, +∞] thu hẹp dần.
3. Tìm floor/ceil của một khóa trong BST.

## Tài liệu tham khảo
- GeeksforGeeks — *Binary Search Tree*
- CLRS Chapter 12: *Binary Search Trees*
- Programiz — *Binary Search Tree*`,
        },
        {
          title: 'Cây AVL & phép xoay cân bằng',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# Cây AVL & phép xoay cân bằng

## Mục tiêu bài học
- Hiểu chỉ số cân bằng (balance factor) của AVL.
- Nắm 4 kiểu xoay: LL, RR, LR, RL — giữ chiều cao O(log n).
- Phân tích chi phí chèn/xóa và vai trò của AVL trong thực tế.

## Ý tưởng
AVL = BST + bất biến: với mọi nút, \`|height(left) − height(right)| ≤ 1\`. Chỉ số cân bằng \`bf = hL − hR\` chỉ nhận \`−1, 0, 1\`.

## Chèn: 2 bước
1. Chèn như BST thường.
2. **Backtrack** cập nhật chiều cao; nút nào \`|bf| = 2\` thì xoay theo 4 trường hợp:

| Trường hợp | Điều kiện | Phép xoay |
| :--- | :--- | :--- |
| LL | bf(z) = 2, bf(child) ≥ 0 | Right-Rotate(z) |
| RR | bf(z) = −2, bf(child) ≤ 0 | Left-Rotate(z) |
| LR | bf(z) = 2, bf(child) < 0 | Left(child) → Right(z) |
| RL | bf(z) = −2, bf(child) > 0 | Right(child) → Left(z) |

\`\`\`js
function rightRotate(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x;
}
function leftRotate(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y;
}
\`\`\`

## Phân tích
- Chiều cao tối đa: \`h ≤ 1.44·log₂(n+1)\` → mọi thao tác **O(log n) nghiêm ngặt**.
- Chi phí: chèn/xóa có thể gây nhiều lần xoay (delete nhiều hơn insert).
- So với Red-Black Tree: AVL đọc nhanh hơn (cân bằng chặt hơn), RB chèn/xóa rẻ hơn.

## Bài tập tự luyện
1. Chèn dãy \`10, 20, 30, 40, 50, 25\` vào AVL rỗng, vẽ từng bước xoay.
2. Viết hàm kiểm tra một cây có phải AVL hợp lệ không.
3. Tìm số xoay tối đa sau một phép xóa trong AVL (gợi ý: O(log n)).

## Tài liệu tham khảo
- GeeksforGeeks — *AVL Tree*
- CLRS Chapter 13 (so sánh với Red-Black Trees)
- MIT 6.006 Lecture 8: *AVL Trees*`,
        },
        {
          title: 'Max-Heap & Min-Heap: biểu diễn mảng, heapify',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Max-Heap & Min-Heap: biểu diễn mảng, heapify

## Mục tiêu bài học
- Biểu diễn heap bằng mảng: con trái \`2i+1\`, con phải \`2i+2\`, cha \`floor((i−1)/2)\`.
- Triển khai \`buildHeap\` O(n) bằng heapify bottom-up.
- Ứng dụng: k phần tử lớn nhất, median online, hợp k luồng.

## Biểu diễn mảng
Cây nhị phân đầy đủ được đánh số theo tầng. **Max-heap**: \`arr[i] ≥ arr[2i+1]\` và \`arr[i] ≥ arr[2i+2]\`.

\`\`\`js
class MaxHeap {
  constructor() { this.a = []; }
  push(x) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p] >= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  pop() {
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      this.siftDown(0);
    }
    return top;
  }
  siftDown(i) {
    while (true) {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < this.a.length && this.a[l] > this.a[largest]) largest = l;
      if (r < this.a.length && this.a[r] > this.a[largest]) largest = r;
      if (largest === i) break;
      [this.a[i], this.a[largest]] = [this.a[largest], this.a[i]];
      i = largest;
    }
  }
}
\`\`\`

## buildHeap O(n)
Heapify từ **nút trong cuối cùng** lên gốc. Tổng công là O(n) (phân tích bằng tổng cấp số nhân: hầu hết nút ở tầng thấp chỉ dịch chuyển ít).

## Ứng dụng điển hình
- **k phần tử lớn nhất**: giữ min-heap kích thước k → O(n log k).
- **Median online**: max-heap cho nửa dưới, min-heap cho nửa trên.
- **Merge k dãy đã sắp**: push đầu mỗi dãy vào min-heap.

## Bài tập tự luyện
1. Chứng minh buildHeap thực hiện ≤ 2n phép so sánh (gợi ý tổng \`Σ h/2^h\`).
2. Kiểm tra một mảng có phải max-heap không.
3. Thêm thao tác \`updateKey\` (giảm/ tăng khóa) cho heap — nền tảng của Dijkstra.

## Tài liệu tham khảo
- GeeksforGeeks — *Binary Heap*
- CLRS Chapter 6: *Heapsort*
- Programiz — *Heap Data Structure*`,
        },
      ],
    },
    {
      title: 'Chương 3: Đồ thị: duyệt & đường đi ngắn nhất',
      description:
        'Biểu diễn đồ thị, duyệt BFS/DFS, topo sắp thứ tự và thuật toán đường đi ngắn nhất Dijkstra/Bellman-Ford.',
      lessons: [
        {
          title: 'Biểu diễn đồ thị: adjacency list & matrix',
          sandboxType: 'graph',
          xpReward: 25,
          contentMd: `# Biểu diễn đồ thị: adjacency list & matrix

## Mục tiêu bài học
- So sánh adjacency matrix và adjacency list: bộ nhớ, thời gian truy vấn.
- Biểu diễn đồ thị có hướng, vô hướng và có trọng số bằng adjacency list.
- Chọn cấu trúc phù hợp theo đặc điểm bài toán.

## Hai cách biểu diễn
**Adjacency Matrix**: ma trận \`n×n\`, \`M[i][j] = 1\` (hoặc trọng số) nếu có cạnh \`i→j\`.
- Truy vấn cạnh **O(1)**, thêm cạnh O(1).
- Bộ nhớ **O(n²)** — phù hợp đồ thị **dày đặc** (dense).

**Adjacency List**: mỗi đỉnh giữ danh sách các đỉnh kề.
- Bộ nhớ **O(V + E)** — phù hợp đồ thị **thưa** (sparse), thực tế.
- Duyệt toàn bộ cạnh O(V + E).

\`\`\`js
// Đồ thị vô hướng có trọng số — adjacency list
function buildGraph(edges, n) {
  const g = Array.from({ length: n }, () => []);
  for (const [u, v, w = 1] of edges) {
    g[u].push({ to: v, w });
    g[v].push({ to: u, w });
  }
  return g;
}
\`\`\`

## Tiêu chí chọn lựa
| Tiêu chí | Matrix | List |
| :--- | :--- | :--- |
| Kiểm tra cạnh (u,v) | O(1) | O(deg(u)) |
| Duyệt hàng xóm của u | O(n) | O(deg(u)) |
| Bộ nhớ | O(n²) | O(V+E) |
| Dùng khi | Dense, Floyd-Warshall | Sparse, BFS/DFS/Dijkstra |

## Bài tập tự luyện
1. Từ danh sách cạnh, đếm **bậc** (degree) mỗi đỉnh bằng adjacency list O(V+E).
2. Chuyển đổi matrix → list và ngược lại.
3. Với đồ thị 10⁵ đỉnh 10⁵ cạnh, chọn biểu diễn nào? Giải thích.

## Tài liệu tham khảo
- GeeksforGeeks — *Graph and its representations*
- CLRS Chapter 22: *Elementary Graph Algorithms* (22.1)
- MIT 6.006 Lecture 9: *Graphs I*`,
        },
        {
          title: 'BFS & DFS: khám phá, chu trình, liên thông',
          sandboxType: 'graph',
          xpReward: 30,
          contentMd: `# BFS & DFS: khám phá, chu trình, liên thông

## Mục tiêu bài học
- Triển khai BFS (hàng đợi) và DFS (stack/đệ quy).
- Dùng BFS tìm đường đi **ngắn nhất theo số cạnh** (unweighted).
- Dùng DFS phát hiện chu trình, thành phần liên thông, hai phía (bipartite).

## BFS — Breadth-First Search
\`\`\`js
function bfs(g, start) {
  const dist = new Array(g.length).fill(-1);
  const q = [start];
  dist[start] = 0;
  for (let head = 0; head < q.length; head++) {
    const u = q[head];
    for (const { to } of g[u]) {
      if (dist[to] === -1) {
        dist[to] = dist[u] + 1;
        q.push(to);
      }
    }
  }
  return dist;
}
\`\`\`
BFS duyệt theo **tầng**: đường đi tìm được là ngắn nhất theo số cạnh. Dùng: kiểm tra đồ thị hai phía (màu luân phiên), các bài toán "bước đi tối thiểu".

## DFS — Depth-First Search
\`\`\`js
function dfs(g, u, visited, parent) {
  visited[u] = true;
  for (const { to } of g[u]) {
    if (!visited[to]) {
      if (dfs(g, to, visited, parent)) return true; // có chu trình
    } else if (to !== parent[u]) {
      return true; // cạnh ngược (back edge) → chu trình
    }
  }
  return false;
}
\`\`\`
Dùng: topo sort, SCC, tìm cầu/khớp (bridge/articulation), backtracking.

## Độ phức tạp
Cả hai: **O(V + E)** với adjacency list — mỗi đỉnh thăm 1 lần, mỗi cạnh xét 1 lần.

## Bài tập tự luyện
1. Đếm số **thành phần liên thông** của đồ thị vô hướng.
2. Kiểm tra đồ thị vô hướng có chu trình hay không bằng DFS.
3. Tìm bước đi tối thiểu từ \`(0,0)\` tới \`(n-1,m-1)\` trong lưới có chướng ngại vật (BFS trên lưới).

## Tài liệu tham khảo
- GeeksforGeeks — *Breadth First Search or BFS* và *Depth First Search or DFS*
- CLRS Chapter 22: *Elementary Graph Algorithms*
- MIT 6.006 Lecture 9–10: *Graphs*`,
        },
        {
          title: 'Topological Sort & chu trình trên DAG',
          sandboxType: 'graph',
          xpReward: 30,
          contentMd: `# Topological Sort & chu trình trên DAG

## Mục tiêu bài học
- Hiểu DAG (Directed Acyclic Graph) và ứng dụng: lịch học, pipeline, dependency.
- Cài đặt topo sort bằng **DFS + postorder** và **Kahn's algorithm** (BFS in-degree).
- Phát hiện chu trình: DAG có topo sort còn đồ thị có chu trình thì không.

## Ý tưởng
Topological sort sắp xếp các đỉnh sao cho mọi cạnh \`u→v\` đều có u đứng trước v. Chỉ tồn tại trên **DAG**.

## Kahn's Algorithm (BFS theo in-degree)
1. Đếm in-degree mỗi đỉnh.
2. Hàng đợi các đỉnh in-degree = 0.
3. Pop u, giảm in-degree các đỉnh kề; đỉnh nào về 0 thì vào hàng đợi.

\`\`\`js
function topoSort(g, n) {
  const indeg = new Array(n).fill(0);
  for (const edges of g) for (const { to } of edges) indeg[to]++;
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const order = [];
  for (let head = 0; head < q.length; head++) {
    const u = q[head];
    order.push(u);
    for (const { to } of g[u]) {
      if (--indeg[to] === 0) q.push(to);
    }
  }
  return order.length === n ? order : null; // null = có chu trình
}
\`\`\`

## DFS + postorder
Duyệt DFS, thêm đỉnh vào danh sách **sau khi xong nhánh con** (postorder), đảo ngược lại → topo order. Gặp back-edge nghĩa là có chu trình.

## Ứng dụng thực tế
- Sắp xếp môn học theo tiên quyết (prerequisite).
- Xây dựng pipeline build (Makefile, CI/CD).
- Xử lý dependency trong package manager.

## Bài tập tự luyện
1. Lịch học: cho n môn và danh sách cặp \`(a,b)\` nghĩa là phải học a trước b — tìm thứ tự học hợp lệ hoặc báo có xung đột.
2. Kiểm tra đồ thị có hướng có chu trình hay không bằng 2 phương pháp.
3. Chứng minh: mọi DAG đều có ít nhất một đỉnh in-degree bằng 0.

## Tài liệu tham khảo
- GeeksforGeeks — *Topological Sorting*
- CLRS Chapter 22.4: *Topological Sort*
- MIT 6.006 Lecture 14: *Depth-First Search (DFS), Topological Sorting*`,
        },
        {
          title: 'Dijkstra & Bellman-Ford: đường đi ngắn nhất',
          sandboxType: 'graph',
          xpReward: 35,
          contentMd: `# Dijkstra & Bellman-Ford: đường đi ngắn nhất

## Mục tiêu bài học
- Triển khai Dijkstra với **min-heap (priority queue)** cho trọng số ≥ 0.
- Hiểu Bellman-Ford — làm việc với trọng số âm và phát hiện chu trình âm.
- So sánh độ phức tạp và phạm vi áp dụng hai thuật toán.

## Dijkstra — greedy với trọng số không âm
\`\`\`js
function dijkstra(g, start, n) {
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  const pq = [[0, start]]; // [dist, node] — dùng min-heap thật
  while (pq.length) {
    const [d, u] = pq.shift(); // shift = O(n) — cần heap O(log n)
    if (d > dist[u]) continue;
    for (const { to, w } of g[u]) {
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        pq.push([dist[to], to]);
      }
    }
  }
  return dist;
}
\`\`\`

**Ý tưởng greedy**: mỗi bước lấy đỉnh **chưa xử lý** có dist nhỏ nhất — bất biến: dist này là tối ưu vì mọi đường đi khác đều đi qua đỉnh dist ≥ nó (trọng số ≥ 0). Độ phức tạp **O((V+E) log V)** với heap.

## Bellman-Ford — chịu trọng số âm
Nới lỏng (relax) **toàn bộ cạnh V−1 lần**; lần thứ V còn cải thiện được → tồn tại **chu trình âm**.

\`\`\`js
function bellmanFord(edges, n, start) {
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
    }
    if (!changed) break;
  }
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) return null; // chu trình âm
  }
  return dist;
}
\`\`\`
Độ phức tạp **O(V·E)**.

## Bảng so sánh
| | Dijkstra | Bellman-Ford |
| :--- | :--- | :--- |
| Trọng số âm | ❌ | ✅ |
| Phát hiện chu trình âm | ❌ | ✅ |
| Độ phức tạp | O((V+E) log V) | O(V·E) |
| Dùng khi | Graph phổ biến, không âm | Có cạnh âm |

## Bài tập tự luyện
1. Tìm đường đi ngắn nhất giữa hai thành phố cho trước (bản đồ có trọng số).
2. Vẽ đồ thị có chu trình âm và chạy Bellman-Ford — kết quả là gì?
3. Giải thích tại sao Dijkstra sai khi có cạnh âm — cho phản ví dụ.

## Tài liệu tham khảo
- GeeksforGeeks — *Dijkstra's Shortest Path Algorithm*, *Bellman-Ford*
- CLRS Chapter 24: *Single-Source Shortest Paths*
- MIT 6.006 Lecture 17: *Dijkstra*`,
        },
      ],
    },
    {
      title: 'Chương 4: Kỹ thuật tư duy thuật toán',
      description:
        'Hai con trỏ, cửa sổ trượt, tìm kiếm nhị phân nâng cao và bảng băm — bộ kỹ thuật giải bài tối ưu thời gian.',
      lessons: [
        {
          title: 'Hai con trỏ (Two Pointers) & cặp có tổng bằng k',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Hai con trỏ (Two Pointers) & cặp có tổng bằng k

## Mục tiêu bài học
- Nhận diện bài toán dùng được hai con trỏ: mảng **đã sắp**.
- Giảm O(n²) brute-force xuống O(n).
- Nắm biến thể: 3-Sum, xóa phần tử trùng, vùng nước (container).

## Ý tưởng
Trên mảng đã sắp tăng, hai con trỏ \`i\` ở đầu, \`j\` ở cuối:
- \`sum = arr[i] + arr[j]\`
- \`sum < k\` → cần tổng lớn hơn → \`i++\`.
- \`sum > k\` → cần tổng nhỏ hơn → \`j--\`.
- \`sum == k\` → tìm thấy cặp.

\`\`\`js
function twoSumSorted(arr, k) {
  let i = 0, j = arr.length - 1;
  while (i < j) {
    const sum = arr[i] + arr[j];
    if (sum === k) return [i, j];
    if (sum < k) i++;
    else j--;
  }
  return null;
}
\`\`\`

## Tại sao đúng?
Mỗi bước loại bỏ vĩnh viễn một khả năng: nếu tổng nhỏ thì \`arr[i]\` không thể ghép với bất kỳ phần tử nào bên phải \`j\`; nếu tổng lớn thì \`arr[j]\` không thể ghép với phần tử bên trái \`i\`. Không bỏ sót cặp nào → O(n) lần lặp.

## Biến thể quan trọng
- **3-Sum**: cố định i, chạy two pointers trên phần còn lại → O(n²).
- **Container With Most Water**: giữ khoảng cách tối đa, dịch con trỏ nhỏ hơn.
- **Xóa phần tử trùng trong mảng đã sắp**: con trỏ slow/fast.

## Bài tập tự luyện
1. 3-Sum: tìm mọi bộ ba tổng bằng 0, không trùng lặp.
2. Tìm cặp gần nhất với k (closest pair sum).
3. Đếm số cặp có tổng nhỏ hơn k (dùng two pointers + cộng dồn).

## Tài liệu tham khảo
- GeeksforGeeks — *Two Pointers Technique*
- LeetCode Pattern: *Two Pointers* (các bài Two Sum II, 3Sum, Container)
- CSES — *Sorting and Searching* (Sum of Two Values)`,
        },
        {
          title: 'Cửa sổ trượt (Sliding Window): kích thước cố định & linh hoạt',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Cửa sổ trượt (Sliding Window): kích thước cố định & linh hoạt

## Mục tiêu bài học
- Hiểu mô hình cửa sổ trượt: mỗi bước thêm phần tử phải, bỏ phần tử trái.
- Giải bài toán "dãy con liên tiếp có tính chất X" trong O(n).
- Phân biệt cửa sổ cố định k và cửa sổ linh hoạt (shrink/expand).

## Cửa sổ kích thước cố định k
Bài: **tổng lớn nhất của dãy con liên tiếp độ dài k**:
\`\`\`js
function maxSumFixed(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k]; // thêm phải, bỏ trái
    best = Math.max(best, sum);
  }
  return best;
}
\`\`\`
Mỗi bước O(1), tổng cộng **O(n)** thay vì O(n·k).

## Cửa sổ linh hoạt (shrink/expand)
Bài: **dãy con liên tiếp dài nhất có tổng ≤ k**:
\`\`\`js
function longestSubarraySumLE(arr, k) {
  let left = 0, sum = 0, best = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    while (sum > k) sum -= arr[left++];
    best = Math.max(best, right - left + 1);
  }
  return best;
}
\`\`\`
Con trỏ phải **mở rộng**, con trỏ trái **co lại** khi vi phạm điều kiện. Phù hợp bài "chuỗi con chứa nhiều nhất k ký tự khác nhau", "chuỗi con dài nhất không lặp ký tự".

## Khi nào dùng?
- Mảng/chuỗi, yêu cầu **liên tiếp** (contiguous).
- Điều kiện cửa sổ đơn điệu: cửa sổ thỏa mãn thì mọi cửa sổ con trong đó cũng thỏa mãn.

## Bài tập tự luyện
1. Dãy con liên tiếp **dài nhất** có tổng **bằng k** (dùng prefix sum + hash map).
2. Chuỗi con dài nhất **không có ký tự lặp** (hash set + sliding window).
3. Tổng nhỏ nhất của dãy con độ dài k và dãy con đó nằm ở đâu.

## Tài liệu tham khảo
- GeeksforGeeks — *Sliding Window Technique*
- MIT 6.006 — Recitation: *Two Pointers & Sliding Window*
- LeetCode Pattern: *Sliding Window*`,
        },
        {
          title: 'Tìm kiếm nhị phân nâng cao: tìm biên, peak, trên mảng xoay',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Tìm kiếm nhị phân nâng cao: tìm biên, peak, trên mảng xoay

## Mục tiêu bài học
- Vận dụng bất biến \`[lo, hi]\` của binary search vào các biến thể.
- Tìm first/last occurrence, vị trí chèn, peak element.
- Tìm phần tử trên **mảng xoay** (rotated sorted array) — bài phỏng vấn kinh điển.

## Template tổng quát
\`\`\`js
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length; // vị trí đầu tiên ≥ target
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
\`\`\`
- \`lowerBound\`: đầu tiên **≥ target**.
- \`upperBound\`: đầu tiên **> target**.
- first occurrence = lowerBound(target); last = upperBound(target) − 1.

## Tìm peak (đỉnh) trên mảng không đơn điệu
\`\`\`js
function findPeak(arr) {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < arr[mid + 1]) lo = mid + 1; // dốc lên → peak bên phải
    else hi = mid;
  }
  return lo;
}
\`\`\`
Chỉ so sánh cạnh kề vẫn đúng nhờ **tính đơn điệu theo "hướng"**: nếu dốc lên, chắc chắn tồn tại đỉnh bên phải.

## Mảng xoay (rotated sorted)
Mảng đã sắp bị xoay quanh một pivot (vd \`[4,5,6,7,0,1,2]\`):
\`\`\`js
function searchRotated(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[lo] <= arr[mid]) {
      if (target >= arr[lo] && target < arr[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (target > arr[mid] && target <= arr[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
\`\`\`

## Bài tập tự luyện
1. Tìm số lần mảng bị xoay (vị trí phần tử nhỏ nhất) — dùng binary search.
2. Tìm vị trí đầu tiên và cuối cùng của target trong mảng có trùng lặp.
3. Tìm peak trong mảng 2 chiều (ma trận) — gợi ý: binary search trên cột giữa.

## Tài liệu tham khảo
- GeeksforGeeks — *Binary Search*, *Search in Rotated Sorted Array*
- CLRS Chapter 2.3: *Searching* (binary search)
- MIT 6.006 Recitation: *Binary Search and Bounds*`,
        },
        {
          title: 'Hash Map nâng cao: prefix sum, group by, tần suất',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Hash Map nâng cao: prefix sum, group by, tần suất

## Mục tiêu bài học
- Dùng hash map biến bài toán "so sánh toàn bộ" thành "tra cứu từng bước" O(n).
- Giải dãy con có tổng bằng k bằng **prefix sum + hash map**.
- Group by và đếm tần suất — nền tảng giải bài Map-Reduce kiểu leetcode.

## Bài toán: dãy con liên tiếp có tổng bằng k
Brute-force O(n²). Quan sát: tổng dãy \`[i..j]\` = \`prefix[j] − prefix[i−1]\`. Cần \`prefix[j] − prefix[i−1] = k\` ⇔ đã từng gặp \`prefix[i−1] = prefix[j] − k\`:

\`\`\`js
function subarraySum(arr, k) {
  const seen = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const x of arr) {
    sum += x;
    count += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}
\`\`\`

## Group by
Gom các phần tử theo thuộc tính: key = đặc trưng, value = danh sách.
- **Nhóm từ anagram**: sort từng từ làm key.
- **Nhóm theo chữ số tổng** (digit sum), **theo tháng**, v.v.

## Mẹo chung
- Nếu cần biết "đã từng gặp chưa" → hash set.
- Nếu cần "gặp bao nhiêu lần / tổng bao nhiêu" → hash map.
- Nếu cần "vị trí đầu tiên/đủ điều kiện nào" → hash map lưu index.

## Bài tập tự luyện
1. Tìm dãy con liên tiếp **dài nhất** có tổng bằng k.
2. Nhóm các từ là **anagram** của nhau trong danh sách.
3. Đếm số cặp \`(i,j)\` có \`arr[i] + arr[j] = k\` với \`i < j\` (kết hợp hash map + duyệt).

## Tài liệu tham khảo
- GeeksforGeeks — *Hashing data structure* (advanced)
- LeetCode — *Subarray Sum Equals K* (Pattern: Prefix Sum)
- CLRS Chapter 11: *Hash Tables*`,
        },
      ],
    },
    {
      title: 'Chương 5: Quy hoạch động cơ bản',
      description:
        'Tư duy quy hoạch động: từ đệ quy quay lui tới top-down memoization và bottom-up tabulation qua các bài toán kinh điển.',
      lessons: [
        {
          title: 'Giới thiệu DP: Fibonacci, memoization & tabulation',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Giới thiệu DP: Fibonacci, memoization & tabulation

## Mục tiêu bài học
- Nhận diện 2 đặc điểm của DP: **overlapping subproblems** và **optimal substructure**.
- Chuyển đệ quy naive → top-down (memoization) → bottom-up (tabulation).
- Phân tích giảm thời gian từ O(2ⁿ) xuống O(n).

## Vấn đề đệ quy naive
Fibonacci \`F(n) = F(n−1) + F(n−2)\` — cây đệ quy lặp lại tính \`F(2)\`, \`F(3)\`, ... vô số lần → **O(2ⁿ)**.

## Top-down: memoization
Lưu kết quả đã tính vào mảng nhớ, chỉ tính khi chưa có:
\`\`\`js
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  return (memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo));
}
\`\`\`

## Bottom-up: tabulation
Tính từ bài toán nhỏ nhất, lưu vào bảng, dựng dần lên:
\`\`\`js
function fibTab(n) {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}
\`\`\`

## Quy trình giải DP (4 bước)
1. **Định nghĩa trạng thái**: \`dp[i]\` nghĩa là gì?
2. **Công thức chuyển trạng thái**: \`dp[i]\` tính từ những \`dp[j]\` nào?
3. **Base case**: giá trị khởi tạo.
4. **Thứ tự tính**: từ nhỏ tới lớn.

## Độ phức tạp
Mỗi trạng thái tính 1 lần, mỗi lần O(1) (với chuyển trạng thái đơn giản) → **O(n) thời gian, O(n) không gian**.

## Bài tập tự luyện
1. Giải leo cầu thang (climbing stairs): \`f(n) = f(n−1) + f(n−2)\` với điều kiện biên.
2. Tối ưu không gian Fibonacci về O(1) (chỉ giữ 2 biến).
3. Giải thích sự khác nhau giữa memoization và tabulation — khi nào dùng cái nào.

## Tài liệu tham khảo
- GeeksforGeeks — *Dynamic Programming (Introduction)*
- MIT 6.006 Lecture 19: *Dynamic Programming I*
- CLRS Chapter 15: *Dynamic Programming*`,
        },
        {
          title: '1D DP: leo cầu thang, house robber, coin change',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# 1D DP: leo cầu thang, house robber, coin change

## Mục tiêu bài học
- Luyện chuỗi bài 1D DP kinh điển với cùng 4-bước quy trình.
- Hiểu các mức độ: tổ hợp (đếm) vs tối ưu (min/max).
- Cài đặt bottom-up và tối ưu bộ nhớ O(1).

## Bài 1: Leo cầu thang
\`f(n)\` = số cách leo lên bậc n (mỗi bước 1 hoặc 2 bậc). \`f(n) = f(n−1) + f(n−2)\`, \`f(1)=1, f(2)=2\` — giống Fibonacci.

## Bài 2: House Robber
Không lấy 2 nhà kề nhau. \`dp[i]\` = max cướp được tính tới nhà i:
\`\`\`js
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
\`\`\`
Chọn giữa: **không cướp nhà i** (\`prev1\`) hoặc **cướp nhà i** (\`prev2 + x\`).

## Bài 3: Coin Change (tối thiểu số đồng xu)
\`dp[a]\` = số xu tối thiểu tạo tổng a. \`dp[a] = min(dp[a − coin] + 1)\` với mọi coin:
\`\`\`js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\`

## Đặc điểm chung
- Trạng thái 1 chiều: vị trí / tổng / số lượng.
- Chuyển trạng thái: xét "lựa chọn cuối cùng".
- Thứ tự tính theo chiều tăng.

## Bài tập tự luyện
1. Tìm **số cách** tạo tổng amount bằng coins (đếm, không phải min).
2. Decode Ways: số cách giải mã chuỗi số thành chữ cái (điều kiện 1 hoặc 2 chữ số).
3. Maximum Product Subarray: dãy con liên tiếp có tích lớn nhất (giữ min và max song song).

## Tài liệu tham khảo
- GeeksforGeeks — *Dynamic Programming* (Coin Change, House Robber series)
- MIT 6.006 Lecture 19–21: *Dynamic Programming*
- LeetCode — *Coin Change*, *House Robber*, *Climbing Stairs*`,
        },
        {
          title: '2D DP: LCS, Edit Distance, đường đi trong lưới',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# 2D DP: LCS, Edit Distance, đường đi trong lưới

## Mục tiêu bài học
- Mở rộng DP lên bảng 2 chiều với 2 chuỗi / 2 chỉ số.
- Giải LCS và Edit Distance — bài phỏng vấn phổ biến nhất.
- Truy vết (backtrack) kết quả từ bảng DP.

## LCS — Longest Common Subsequence
\`dp[i][j]\` = độ dài dãy con chung dài nhất của \`s1[0..i]\` và \`s2[0..j]\`:
- Nếu \`s1[i] == s2[j]\`: \`dp[i][j] = dp[i−1][j−1] + 1\`.
- Ngược lại: \`dp[i][j] = max(dp[i−1][j], dp[i][j−1])\`.

\`\`\`js
function lcs(s1, s2) {
  const n = s1.length, m = s2.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[n][m];
}
\`\`\`

## Edit Distance (Levenshtein)
Chi phí biến \`s1\` thành \`s2\` bằng insert/delete/replace:
\`dp[i][j] = min(\` delete: \`dp[i−1][j]+1\`, insert: \`dp[i][j−1]+1\`, replace: \`dp[i−1][j−1] + (s1[i−1] !== s2[j−1])\` \`)\`.

## Đường đi trong lưới
\`dp[i][j]\` = số đường đi tới ô (i,j): \`dp[i][j] = dp[i−1][j] + dp[i][j−1]\` (không chướng ngại), có ô cấm thì về 0.

## Độ phức tạp
2 trạng thái n×m, mỗi trạng thái O(1) → **O(n·m) thời gian và không gian**. Có thể tối ưu không gian về O(m) (chỉ giữ 2 dòng).

## Bài tập tự luyện
1. In ra **nội dung** LCS (backtrack từ \`dp[n][m]\`).
2. Biến đổi \`"horse"\` thành \`"ros"\` — vẽ bảng dp và tìm chi phí tối thiểu.
3. Đếm số đường đi trong lưới n×m có chướng ngại vật (unique paths II).

## Tài liệu tham khảo
- GeeksforGeeks — *Longest Common Subsequence*, *Edit Distance*
- MIT 6.006 Lecture 20: *Dynamic Programming II*
- CLRS 15.4: *Longest Common Subsequence*`,
        },
        {
          title: 'Knapsack: bài toán cái túi 0/1 & unbounded',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Knapsack: bài toán cái túi 0/1 & unbounded

## Mục tiêu bài học
- Mô hình hóa bài toán chọn đồ vật tối ưu với ngân sách khối lượng.
- Giải Knapsack 0/1 bằng bảng 2D và tối ưu không gian 1D.
- Phân biệt 0/1 (mỗi đồ 1 lần) và unbounded (lấy thoải mái).

## Knapsack 0/1
n đồ vật, đồ i có khối lượng w[i] và giá trị v[i]; túi chứa tối đa W. Mỗi đồ lấy hoặc không lấy. \`dp[i][c]\` = giá trị tối đa xét i đồ đầu, túi dung lượng c:

\`\`\`js
function knapsack01(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      if (weights[i - 1] <= c) {
        dp[i][c] = Math.max(dp[i - 1][c], dp[i - 1][c - weights[i - 1]] + values[i - 1]);
      } else {
        dp[i][c] = dp[i - 1][c];
      }
    }
  }
  return dp[n][W];
}
\`\`\`

## Tối ưu không gian: mảng 1D
Chỉ cần dòng trước → lặp **ngược** dung lượng để không tái dùng đồ vật:
\`\`\`js
function knapsack01Opt(weights, values, W) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let c = W; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[W];
}
\`\`\`

## Unbounded Knapsack
Mỗi đồ lấy không giới hạn → lặp **xuôi** dung lượng:
\`\`\`js
for (let c = weights[i]; c <= W; c++) {
  dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
}
\`\`\`

## Ứng dụng thực tế
- Cắt vật liệu, đóng gói, lựa chọn dự án theo ngân sách.
- Coin change (min coins) là dạng unbounded knapsack.

## Bài tập tự luyện
1. Phân hoạch mảng thành 2 tập con có tổng bằng nhau (partition equal subset sum).
2. Số cách tạo tổng với đồng xu (unbounded, đếm).
3. Target Sum: gán dấu ± để đạt target — biến đổi thành knapsack.

## Tài liệu tham khảo
- GeeksforGeeks — *0/1 Knapsack Problem*, *Unbounded Knapsack*
- MIT 6.006 Lecture 21: *Dynamic Programming III*
- CLRS 15.4–15.5: *Dynamic Programming*`,
        },
      ],
    },
  ],
};
