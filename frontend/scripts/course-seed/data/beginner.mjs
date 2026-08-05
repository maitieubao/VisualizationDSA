export const beginnerCourse = {
  title: 'Nhập môn Cấu trúc Dữ liệu & Giải thuật',
  description:
    'Khóa học nền tảng cho người mới bắt đầu: làm quen với phân tích độ phức tạp Big-O, mảng, chuỗi, danh sách liên kết, ngăn xếp, hàng đợi, tìm kiếm và sắp xếp cơ bản, bảng băm. Mỗi bài học đi kèm minh họa trực quan, mã giả và bài tập tự luyện — chuẩn lộ trình GeeksforGeeks DSA Roadmap và giáo trình MIT 6.006.',
  thumbnail: 'https://images.unsplash.com/photo-1516116211223-48a122638c59?w=800&q=80',
  expectedTime: 40,
  category: 'DataStructure',
  difficulty: 'Beginner',
  isPremium: false,
  isPublished: true,
  modules: [
    {
      title: 'Chương 1: Nền tảng & Phân tích độ phức tạp',
      description:
        'Hiểu mô hình bộ nhớ, ký hiệu Big-O và cách đánh giá thuật toán — nền móng của mọi quyết định thiết kế giải thuật.',
      lessons: [
        {
          title: 'DSA là gì? Mô hình bộ nhớ máy tính',
          sandboxType: 'dsa',
          xpReward: 20,
          contentMd: `# DSA là gì? Mô hình bộ nhớ máy tính

## Mục tiêu bài học
- Giải thích được Data Structures (CTDL) và Algorithms (Giải thuật) là gì và mối quan hệ của chúng.
- Mô tả được sơ đồ bộ nhớ: Stack, Heap, Code segment, Data segment.
- Phân biệt được dữ liệu **tham chiếu** (reference) và **giá trị** (value) khi lưu trữ.

## Khái niệm cốt lõi
**Cấu trúc dữ liệu** là cách tổ chức và lưu trữ dữ liệu để thao tác hiệu quả (thêm, tìm, xóa, sửa). **Giải thuật** là dãy hữu hạn các bước giải quyết một bài toán cụ thể. Câu nói kinh điển: *"Data structures + Algorithms = Programs"* (Niklaus Wirth).

> "Bad programmers worry about the code. Good programmers worry about data structures and their relationships." — Linus Torvalds

## Bộ nhớ máy tính (4 vùng chính)
| Vùng | Lưu trữ | Đặc điểm |
| :--- | :--- | :--- |
| **Code segment** | Mã máy của chương trình | Chỉ đọc (read-only) |
| **Data segment** | Biến toàn cục, tĩnh | Tồn tại suốt vòng đời chương trình |
| **Stack** | Biến cục bộ, tham số, địa chỉ trả về | LIFO, nhỏ nhanh, cấp phát tự động |
| **Heap** | Cấp phát động (new/malloc) | Lớn, chậm hơn, phải giải phóng thủ công |

## Ví dụ minh họa
Mảng trong Java/C++ cấp phát liên tục trong Heap nhưng biến *tham chiếu* nằm trong Stack — đây là lý do khi truyền mảng vào hàm, mọi thay đổi đều ảnh hưởng tới mảng gốc.

## Bài tập tự luyện
1. Vẽ lại sơ đồ bộ nhớ khi chạy hàm \`main()\` gọi \`factorial(4)\` (đệ quy).
2. Giải thích tại sao Stack bị giới hạn kích thước còn Heap thì không.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Data Structures and Algorithms* (DSA Tutorial, 2026)
- MIT 6.006 — *Introduction to Algorithms* (Lecture 1: Algorithmic Thinking)
- CS50 Harvard — *Week 5: Data Structures, Memory Layout*`,
        },
        {
          title: 'Phân tích độ phức tạp: Big-O, Big-Ω, Big-Θ',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Phân tích độ phức tạp: Big-O, Big-Ω, Big-Θ

## Mục tiêu bài học
- Hiểu ý nghĩa ký hiệu tiệm cận **O** (chặn trên), **Ω** (chặn dưới), **Θ** (chặn chặt).
- Tính toán độ phức tạp thời gian của vòng lặp lồng nhau và đệ quy đơn giản.
- Phân biệt **Time Complexity** và **Space Complexity**.

## Ký hiệu tiệm cận
Cho hàm thời gian \`T(n)\`, ta viết \`T(n) = O(f(n))\` nếu tồn tại hằng số \`c, n₀\` sao cho \`T(n) ≤ c·f(n)\` với mọi \`n ≥ n₀\`.

| Ký hiệu | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| \`O(1)\` | Hằng số — truy cập mảng | \`arr[i]\` |
| \`O(log n)\` | Logarit — chia đôi | Binary Search |
| \`O(n)\` | Tuyến tính — duyệt | Linear Search |
| \`O(n log n)\` | Tuyến tính-log — chia để trị | Merge Sort |
| \`O(n²)\` | Bậc hai — vòng lặp lồng | Bubble Sort |
| \`O(2ⁿ)\` | Mũ — đệ quy nhánh đôi | Fibonacci naive |

## Quy tắc đánh giá nhanh
1. Bỏ hằng số: \`3n + 5 → O(n)\`.
2. Giữ bậc cao nhất: \`n² + 100n → O(n²)\`.
3. Vòng lặp lồng nhau thì **nhân** độ phức tạp.
4. Lệnh tuần tự thì **lấy max**.

## Ví dụ: phân tích vòng lặp
\`\`\`js
// O(n) — 1 vòng lặp
for (let i = 0; i < n; i++) sum += arr[i];

// O(n²) — 2 vòng lồng nhau
for (let i = 0; i < n; i++)
  for (let j = 0; j < n; j++)
    if (arr[i] > arr[j]) swap(arr, i, j);
\`\`\`

## Độ phức tạp không gian
Bao gồm stack đệ quy (depth) + bộ nhớ phụ trợ. Ví dụ: Merge Sort dùng \`O(n)\` bộ nhớ phụ cho mảng gộp, còn Bubble Sort chỉ dùng \`O(1)\`.

## Bài tập tự luyện
1. Xác định Big-O của: tìm phần tử lớn thứ hai, đảo mảng, in ma trận n×n theo đường chéo.
2. Vì sao \`O(n log n)\` là cận dưới của bài toán sắp xếp so sánh? (Gợi ý: cây quyết định)

## Tài liệu tham khảo
- GeeksforGeeks — *Analysis of Algorithms: Big-O, Big-Θ, Big-Ω*
- CLRS *Introduction to Algorithms*, Chapter 3: *Growth of Functions*
- MIT 6.006 — *Asymptotic Complexity*`,
        },
        {
          title: 'Đệ quy căn bản: Factorial, Fibonacci & Tower of Hanoi',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Đệ quy căn bản

## Mục tiêu bài học
- Hiểu cấu trúc hàm đệ quy: **base case** và **recursive case**.
- Phân tích đệ quy bằng **recurrence relation** (hệ thức truy hồi).
- Nhận diện hiểm họa **StackOverflow** khi đệ quy sâu.

## Cấu trúc đệ quy
Một hàm đệ quy gọi chính nó với kích thước bài toán nhỏ dần cho đến khi chạm **điều kiện dừng**:

\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;        // base case
  return n * factorial(n - 1); // recursive case
}
\`\`\`

## Phân tích bằng hệ thức truy hồi
\`T(n) = T(n-1) + O(1)\` → giải ra \`T(n) = O(n)\` thời gian và \`O(n)\` stack.

Fibonacci ngây thơ:
\`\`\`js
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2); // 2 nhánh → O(2ⁿ)
}
\`\`\`
\`T(n) = T(n-1) + T(n-2) + O(1) = O(2ⁿ)\` — bài toán con bị **tính lặp lại**, tiền đề cho Dynamic Programming ở khóa trung cấp.

## Tower of Hanoi — kinh điển
Di chuyển n đĩa từ cọc A sang cọc C dùng cọc trung gian B, mỗi lần chỉ 1 đĩa và đĩa lớn không được đè đĩa nhỏ:
\`\`\`js
function hanoi(n, from, to, aux) {
  if (n === 0) return;
  hanoi(n - 1, from, aux, to);
  console.log(\`Di chuyển đĩa \${n}: \${from} → \${to}\`);
  hanoi(n - 1, aux, to, from);
}
\`\`\`
Số bước tối thiểu: \`2ⁿ - 1\`.

## Bẫy thường gặp
- Thiếu base case → vô hạn đệ quy → StackOverflow.
- Gọi đệ quy với tham số không tiến về base case.
- Trùng lặp tính toán (cần memoization).

## Bài tập tự luyện
1. Viết \`gcd(a,b)\` đệ quy theo thuật toán Euclid.
2. Viết hàm đệ quy kiểm tra chuỗi Palindrome.
3. Đếm stack frames khi gọi \`factorial(5)\` — vẽ bảng.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Recursion*
- Programiz — *Recursion (DS & Algo)*
- CLRS Chapter 4: *Recurrences*`,
        },
      ],
    },
    {
      title: 'Chương 2: Mảng, Chuỗi & Ma trận',
      description:
        'Ba cấu trúc dữ liệu tuyến tính cơ bản nhất: mảng, chuỗi và ma trận — cùng các kỹ thuật duyệt và thao tác đặc trưng.',
      lessons: [
        {
          title: 'Mảng một chiều: chèn, xóa, tìm kiếm',
          sandboxType: 'dsa',
          xpReward: 20,
          contentMd: `# Mảng một chiều (Array)

## Mục tiêu bài học
- Nắm mô hình bộ nhớ liên tục của mảng và công thức địa chỉ \`addr(i) = base + i × sizeof\`.
- Thao tác được chèn/xóa giữa mảng (O(n)) và truy cập ngẫu nhiên (O(1)).
- Viết được các thuật toán duyệt, đảo ngược, xoay mảng.

## Đặc điểm cốt lõi
| Thao tác | Độ phức tạp | Ghi chú |
| :--- | :--- | :--- |
| Truy cập \`arr[i]\` | O(1) | Tính trực tiếp địa chỉ |
| Chèn vào cuối | O(1)* | *Nếu còn chỗ |
| Chèn/xóa giữa | O(n) | Dịch chuyển phần tử |
| Tìm tuyến tính | O(n) | — |
| Tìm nhị phân (đã sắp xếp) | O(log n) | Khóa trung cấp |

## Ví dụ: đảo ngược mảng — kỹ thuật Two Pointer sơ khai
\`\`\`js
function reverse(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
}
\`\`\`

## Ví dụ: xoay mảng trái k vị trí
Xoay bằng đảo 3 đoạn (reversal algorithm, O(n), O(1)):
1. Đảo \`[0, k-1]\` → 2. Đảo \`[k, n-1]\` → 3. Đảo cả mảng.

## Bẫy thường gặp
- Tràn chỉ số khi chèn/xóa (bounds check).
- Nhầm lẫn kích thước logic (size) và kích thước vật lý (capacity).
- Giả định mảng đã sắp xếp khi dùng tìm kiếm nhanh.

## Bài tập tự luyện
1. Tìm phần tử lớn thứ hai trong một lượt duyệt.
2. Dồn toàn bộ số 0 về cuối mảng giữ nguyên thứ tự phần tử khác.
3. Kiểm tra mảng đã sắp xếp tăng dần hay chưa.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Arrays*
- Programiz — *Array Data Structure*
- CS50 — *Week 2: Arrays*`,
        },
        {
          title: 'Chuỗi: Palindrome, Anagram, Subsequence',
          sandboxType: 'dsa',
          xpReward: 20,
          contentMd: `# Chuỗi (String) — các kỹ thuật xử lý cơ bản

## Mục tiêu bài học
- Xử lý chuỗi như mảng ký tự; nắm bất biến (immutability) của chuỗi trong JS/Python/Java.
- Giải quyết ba bài toán kinh điển: Palindrome, Anagram, Subsequence.
- Vận dụng **Two Pointer** và **Hash Map** ở mức cơ bản.

## 1) Kiểm tra Palindrome — Two Pointer
\`\`\`js
function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}
\`\`\`
Độ phức tạp: O(n), không gian O(1).

## 2) Kiểm tra Anagram — đếm tần suất ký tự
Hai chuỗi là anagram nếu cùng tập ký tự với cùng số lần xuất hiện:
\`\`\`js
function areAnagrams(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const ch of a) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const c = count.get(ch);
    if (!c) return false;
    count.set(ch, c - 1);
  }
  return true;
}
\`\`\`
Độ phức tạp: O(n), không gian O(1) nếu bảng chữ cái cố định (26 ký tự).

## 3) Subsequence (chuỗi con theo thứ tự)
\`s\` có phải subsequence của \`t\` không — duyệt hai con trỏ:
\`\`\`js
function isSubsequence(s, t) {
  let i = 0, j = 0;
  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) i++;
    j++;
  }
  return i === s.length;
}
\`\`\`

## Phân biệt thuật ngữ (quan trọng)
| Khái niệm | Định nghĩa | Ví dụ với "abc" |
| :--- | :--- | :--- |
| Substring | Liên tục | "ab", "bc" |
| Subsequence | Giữ thứ tự, không cần liên tục | "ac" |
| Subarray | Liên tục (mảng) | [a,b] |
| Subset | Không cần thứ tự | {a,c} |

## Bài tập tự luyện
1. Tìm ký tự đầu tiên không lặp lại trong chuỗi (O(n) với hash map).
2. Kiểm tra chuỗi "sentence palindrome" (bỏ khoảng trắng và dấu câu).
3. Kiểm tra chuỗi a có thể xóa tối đa k ký tự thành palindrome hay không.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Strings*
- Programiz — *C String Functions*
- LeetCode Patterns — *String & Two Pointer` +
            ' (tham khảo cách tư duy bài tập)',
        },
        {
          title: 'Ma trận 2D: duyệt, transpose, xoay 90°',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Ma trận (Matrix / 2D Array)

## Mục tiêu bài học
- Biểu diễn ma trận m×n bằng mảng 2 chiều và bản chất là mảng 1 chiều liên tục.
- Thực hiện được các phép duyệt hàng/cột/đường chéo, transpose, xoay 90°.
- Rèn tư duy quy đổi chỉ số \`(r, c) ↔ i\`.

## Bản chất bộ nhớ
Ma trận m×n là mảng liên tục \`m*n\` ô; truy cập \`M[r][c]\` thực chất là \`base + (r*n + c)*sizeof\` → O(1).

## Duyệt ma trận
\`\`\`js
// Duyệt toàn bộ — O(m×n)
for (let r = 0; r < m; r++)
  for (let c = 0; c < n; c++)
    process(M[r][c]);
\`\`\`
- **Đường chéo chính**: \`r === c\`.
- **Đường chéo phụ**: \`r + c === n - 1\`.
- **Đường chéo hướng \`\`↘\`\`**: hiệu \`r - c\` hằng số.
- **Đường chéo hướng \`\`↗\`\`**: tổng \`r + c\` hằng số.

## Transpose (chuyển vị) — tại chỗ với ma trận vuông
\`\`\`js
function transpose(M) {          // M là ma trận vuông n×n
  for (let i = 0; i < M.length; i++)
    for (let j = i + 1; j < M.length; j++)
      [M[i][j], M[j][i]] = [M[j][i], M[i][j]];
}
\`\`\`

## Xoay 90° theo chiều kim đồng hồ
Xoay = Transpose + Đảo từng hàng:
\`\`\`js
transpose(M);
for (const row of M) row.reverse();
\`\`\`
Độ phức tạp: O(n²), không gian O(1).

## Bài tập tự luyện
1. Duyệt ma trận theo hình xoắn ốc (spiral).
2. Tìm đường chéo dài nhất có tổng lớn nhất.
3. Kiểm tra ma trận Toeplitz (mọi đường chéo \`↘\` đồng giá trị).

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Matrix or Grid*
- GeeksforGeeks — *Rotate a Matrix by 90°*
- CLRS — Phụ lục về bài toán Ma trận`,
        },
      ],
    },
    {
      title: 'Chương 3: Danh sách liên kết',
      description:
        'Cấu trúc dữ liệu động đầu tiên: Singly, Doubly, Circular Linked List và kỹ thuật Fast & Slow Pointer.',
      lessons: [
        {
          title: 'Singly Linked List: Node, chèn, xóa, duyệt',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Singly Linked List (Danh sách liên kết đơn)

## Mục tiêu bài học
- Hiểu ý tưởng lưu trữ **phi liên tục** với con trỏ trỏ tới node kế tiếp.
- Thao tác thành thạo: chèn đầu/giữa/cuối, xóa, duyệt, tìm.
- So sánh được ưu nhược điểm với mảng.

## Cấu trúc Node
\`\`\`js
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;   // con trỏ tới node kế tiếp
  }
}
\`\`\`

## Chèn vào đầu danh sách — O(1)
\`\`\`js
function insertAtHead(head, value) {
  const newNode = new Node(value);
  newNode.next = head;      // 1. trỏ node mới tới head cũ
  return newNode;           // 2. node mới trở thành head
}
\`\`\`
Thứ tự 2 bước là điểm dễ sai: phải trỏ \`newNode.next = head\` **trước** khi cập nhật head.

## Chèn vào vị trí giữa — O(n)
Duyệt tới vị trí i-1, sau đó: \`newNode.next = prev.next; prev.next = newNode;\`.

## Bảng so sánh Array vs Linked List
| Tiêu chí | Array | Linked List |
| :--- | :--- | :--- |
| Bộ nhớ | Liên tục | Rải rác (node + con trỏ) |
| Truy cập ngẫu nhiên | O(1) | O(n) |
| Chèn/xóa đầu | O(n) (dịch chuyển) | O(1) |
| Chèn/xóa giữa | O(n) | O(n) tìm + O(1) nối |
| Bộ nhớ phụ mỗi phần tử | 0 | 1 con trỏ |

## Bẫy thường gặp
- Quên cập nhật \`head\` khi chèn/xóa đầu.
- Truy cập \`null.next\` (null pointer) khi xóa node cuối.
- Mất tham chiếu danh sách vì ghi đè \`head\` không kiểm soát.

## Bài tập tự luyện
1. Tìm phần tử giữa danh sách trong một lượt duyệt (Fast & Slow pointer).
2. Đảo ngược danh sách liên kết (iterative + recursive).
3. Xóa node tại vị trí k tính từ cuối trong một lượt duyệt.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Linked List*
- Programiz — *Linked List Data Structure*
- CS50 — *Week 5: Data Structures (singly linked lists)*`,
        },
        {
          title: 'Doubly & Circular Linked List',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Doubly & Circular Linked List

## Mục tiêu bài học
- Nắm cấu trúc Doubly Linked List (con trỏ prev + next) và lợi ích duyệt 2 chiều.
- Hiểu Circular Linked List và ứng dụng thực tế (round-robin, lịch vòng).
- Biết khi nào dùng loại nào.

## Doubly Linked List
\`\`\`js
class DNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}
\`\`\`
**Ưu điểm**: xóa node khi đã có con trỏ tới nó — O(1) (không cần node trước đó), duyệt ngược tự nhiên.
**Nhược điểm**: mỗi node thêm 1 con trỏ (bộ nhớ), thao tác chèn/xóa phức tạp hơn do phải cập nhật 2 chiều.

Chèn node X giữa A và B:
\`\`\`js
X.prev = A; X.next = B;
A.next = X; B.prev = X;   // thứ tự: gán X trước, rồi nối A/B
\`\`\`

## Circular Linked List
Node cuối trỏ ngược về head:
- **Duyệt vòng** không bao giờ chạm null → phải có điều kiện dừng rõ ràng.
- **Ứng dụng**: Round-robin scheduling của hệ điều hành, vòng lặp trò chơi, lịch nhắc việc lặp lại.
- Biến thể **Circular Doubly**: cả 2 chiều đều vòng — nền tảng của một số cài đặt cache LRU.

## Vì sao LRU Cache dùng Doubly Linked List?
Cần thao tác \`moveToFront\` và \`removeFromMiddle\` với O(1) — chỉ Doubly LL hỗ trợ cả hai (xem GfG *Design LRU Cache*).

## Bài tập tự luyện
1. Cài đặt vòng tròn Josephus bằng Circular Linked List.
2. Biến đổi Binary Tree thành Circular Doubly Linked List (thách thức trung cấp).
3. So sánh bộ nhớ của 3 loại danh sách với n phần tử.

## Tài liệu tham khảo
- GeeksforGeeks — *Doubly Linked List Tutorial* & *Circular Linked List*
- Programiz — *Doubly Linked List*
- CLRS Chapter 10: *Elementary Data Structures*`,
        },
        {
          title: 'Fast & Slow Pointer: phát hiện chu trình',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Fast & Slow Pointer (Thuật toán thỏ - rùa)

## Mục tiêu bài học
- Hiểu tư tưởng hai con trỏ di chuyển tốc độ khác nhau.
- Phát hiện chu trình trong danh sách liên kết với O(1) bộ nhớ.
- Tìm được node bắt đầu chu trình (thuật toán Floyd).

## Phát hiện chu trình — Floyd's Cycle Detection
Con trỏ \`slow\` đi 1 bước, \`fast\` đi 2 bước mỗi vòng. Nếu có chu trình, \`fast\` sẽ "vòng lại" và gặp \`slow\`:
\`\`\`js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;   // gặp nhau → có chu trình
  }
  return false;
}
\`\`\`
Độ phức tạp: O(n) thời gian, **O(1)** không gian (thay vì O(n) của hash set).

## Tìm node bắt đầu chu trình
Sau khi gặp nhau, đặt \`slow\` về \`head\`, cả hai cùng đi **1 bước/vòng** — điểm gặp lần 2 chính là node đầu chu trình:
\`\`\`js
function detectCycleStart(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) break;
  }
  if (!fast || !fast.next) return null;      // không có chu trình
  slow = head;
  while (slow !== fast) { slow = slow.next; fast = fast.next; }
  return slow;
}
\`\`\`

## Vì sao đúng? (chứng minh trực giác)
Gọi khoảng cách từ head tới điểm đầu chu trình là \`L\`, chu vi chu trình là \`C\`. Khi gặp nhau, \`fast\` đã đi hơn \`slow\` đúng một bội số của \`C\`. Đặt lại về head và đi cùng tốc độ sẽ khiến cả hai hội tụ đúng tại \`L\` bước — tức node đầu chu trình.

## Ứng dụng cùng họ kỹ thuật
- Tìm phần tử giữa danh sách.
- Kiểm tra Palindrome của danh sách (đảo nửa sau).
- Tìm node thứ k từ cuối.

## Bài tập tự luyện
1. Tìm phần tử giữa danh sách bằng Fast & Slow pointer.
2. Tính độ dài chu trình sau khi phát hiện.
3. Kiểm tra Palindrome trong O(n) thời gian, O(1) không gian.

## Tài liệu tham khảo
- GeeksforGeeks — *Detect Loop in a Linked List (Floyd's Cycle-Finding)*
- Wikipedia — *Cycle detection (tortoise and hare)*
- CLRS Chapter 22 (ý tưởng hai con trỏ mở rộng cho đồ thị)`,
        },
      ],
    },
    {
      title: 'Chương 4: Ngăn xếp & Hàng đợi',
      description:
        'Hai cấu trúc tuyến tính có ràng buộc truy cập: Stack (LIFO) và Queue (FIFO) cùng các bài toán biểu thức kinh điển.',
      lessons: [
        {
          title: 'Stack — LIFO và bài toán dấu ngoặc',
          sandboxType: 'dsa',
          xpReward: 20,
          contentMd: `# Stack (Ngăn xếp) — LIFO

## Mục tiêu bài học
- Hiểu nguyên tắc **Last-In-First-Out** và 4 thao tác cơ bản: push, pop, peek, isEmpty.
- Cài đặt stack bằng mảng.
- Giải bài toán kiểm tra dấu ngoặc cân bằng.

## Bốn thao tác cốt lõi
| Thao tác | Mô tả | Độ phức tạp |
| :--- | :--- | :--- |
| \`push(x)\` | Đẩy x lên đỉnh | O(1) |
| \`pop()\` | Lấy phần tử đỉnh và xóa | O(1) |
| \`peek()\` | Xem đỉnh không xóa | O(1) |
| \`isEmpty()\` | Kiểm tra rỗng | O(1) |

Cài đặt bằng mảng: push/pop tại cuối mảng chính là O(1) — đơn giản nhất.

## Bài toán: kiểm tra dấu ngoặc cân bằng
\`\`\`js
function isBalanced(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}
\`\`\`
- Dấu mở → **push**.
- Dấu đóng → **pop** và đối chiếu cặp.
- Cuối cùng stack phải rỗng.

## Vì sao Stack phù hợp?
Ngoặc đóng phải khớp với ngoặc mở **gần nhất chưa đóng** — đúng thứ tự LIFO. Đây là mẫu "matching pairs" kinh điển của Stack.

## Ứng dụng thực tế
- Undo/Redo trong trình soạn thảo.
- Back/Forward của trình duyệt.
- Gọi hàm đệ quy (call stack).
- Đảo ngược chuỗi, kiểm tra Palindrome.

## Bài tập tự luyện
1. Cài đặt stack có \`getMin()\` O(1).
2. Đánh giá biểu thức hậu tố (postfix).
3. Chuyển biểu thức trung tố sang hậu tố (shunting-yard cơ bản).

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Stack*
- Programiz — *Stack Data Structure*
- CS50 — *Week 5: Stacks*`,
        },
        {
          title: 'Queue — FIFO và Circular Queue',
          sandboxType: 'dsa',
          xpReward: 20,
          contentMd: `# Queue (Hàng đợi) — FIFO

## Mục tiêu bài học
- Hiểu nguyên tắc **First-In-First-Out**: enqueue, dequeue, front.
- Cài đặt queue hiệu quả bằng mảng vòng (circular).
- Nhận diện ứng dụng FIFO trong thực tế.

## Bốn thao tác cốt lõi
| Thao tác | Mô tả | Độ phức tạp |
| :--- | :--- | :--- |
| \`enqueue(x)\` | Thêm vào cuối hàng | O(1) |
| \`dequeue()\` | Lấy phần tử đầu hàng | O(1) |
| \`front()\` | Xem đầu hàng | O(1) |
| \`isEmpty()\` | Kiểm tra rỗng | O(1) |

## Cài đặt Circular Queue — tại sao phải "vòng"?
Dùng 2 con trỏ \`front\` và \`rear\`; khi rear chạm cuối mảng thì **quay vòng** về đầu (\`(rear+1) % capacity\`) — tránh dọn mảng sau mỗi dequeue:

\`\`\`js
class CircularQueue {
  constructor(capacity) {
    this.arr = new Array(capacity);
    this.capacity = capacity;
    this.front = 0;
    this.rear = 0;
    this.size = 0;
  }
  enqueue(x) {
    if (this.size === this.capacity) throw new Error('Queue đầy');
    this.arr[this.rear] = x;
    this.rear = (this.rear + 1) % this.capacity;
    this.size++;
  }
  dequeue() {
    if (this.size === 0) throw new Error('Queue rỗng');
    const val = this.arr[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    return val;
  }
}
\`\`\`

## Ứng dụng thực tế
- Hàng đợi in ấn, task scheduling.
- **BFS trên đồ thị** (khóa trung cấp) — quản lý hàng đợi thăm đỉnh.
- Buffer truyền thông, khóa học xử lý sự kiện.

## Bẫy thường gặp
- Nhầm \`% capacity\` khi quay vòng con trỏ.
- Kiểm tra "đầy" trước khi enqueue — phân biệt rỗng và đầy khi kích thước logic 0/capacity.
- Dùng mảng shift() O(n) thay vì circular → bài toán dễ trượt về O(n²).

## Bài tập tự luyện
1. Cài đặt Queue bằng 2 Stack (O(1) amortized cho enqueue).
2. Đảo ngược k phần tử đầu hàng đợi.
3. Tìm ký tự đầu tiên không lặp lại trong luồng ký tự (queue + count).

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Queue* & *Circular Queue*
- Programiz — *Queue Data Structure*
- CLRS Chapter 10.1: *Queues*`,
        },
        {
          title: 'Monotonic Stack & Ứng dụng kinh điển',
          sandboxType: 'dsa',
          xpReward: 30,
          contentMd: `# Monotonic Stack — kỹ thuật nâng cao đầu tiên

## Mục tiêu bài học
- Hiểu khái niệm stack đơn điệu (monotonic stack).
- Giải bài toán Next Greater Element (phần tử lớn hơn kế tiếp).
- Nhận diện mẫu bài toán "phần tử gần nhất thỏa điều kiện".

## Ý tưởng
Duy trì stack luôn **tăng/giảm đơn điệu** theo giá trị. Mỗi phần tử bị **pop ra đúng 1 lần** → tổng O(n) dù có vòng lặp trong lúc pop.

## Bài toán: Next Greater Element
Với mỗi phần tử, tìm phần tử lớn hơn nó **gần nhất về bên phải**:
\`\`\`js
function nextGreater(arr) {
  const n = arr.length;
  const result = new Array(n).fill(-1);
  const stack = [];          // chứa chỉ số, giá trị giảm dần
  for (let i = 0; i < n; i++) {
    while (stack.length && arr[stack.at(-1)] < arr[i]) {
      result[stack.pop()] = arr[i];   // phần tử này có NGE = arr[i]
    }
    stack.push(i);
  }
  return result;
}
// [4, 5, 2, 25] → [5, 25, 25, -1]
\`\`\`

## Vì sao O(n)?
Mỗi chỉ số vào stack **một lần** và bị pop **một lần**. Tổng thao tác ≤ 2n — bất chấp \`while\` lồng nhau, đây là kỹ thuật **amortized analysis** (sẽ học sâu ở khóa nâng cao).

## Các biến thể cùng mẫu
- **Previous Greater Element**: duyệt trái.
- **Next Smaller / Previous Smaller**: đảo điều kiện so sánh.
- **Stock Span**: khoảng cách tới NGE.
- **Largest Rectangle in Histogram**: NGE + PGE phối hợp (bài khó cổ điển).
- **Trapping Rain Water**: hai lần monotonic stack.

## Bài tập tự luyện
1. Tính Stock Span (chuỗi giá cổ phiếu).
2. Tìm diện tích hình chữ nhật lớn nhất trong histogram.
3. Tổng độ rộng mảng con tối thiểu (sum of subarray minimums).

## Tài liệu tham khảo
- GeeksforGeeks — *Next Greater Element* & *Monotonic Stack pattern*
- LeetCode Pattern Study — *Monotonic Stack*
- CLRS — ý tưởng amortized analysis (Chapter 17)`,
        },
      ],
    },
    {
      title: 'Chương 5: Tìm kiếm, Sắp xếp cơ bản & Bảng băm',
      description:
        'Linear/Binary Search, ba thuật toán sắp xếp O(n²) và Hash Table — kết thúc khóa nhập môn với nền tảng vững chắc.',
      lessons: [
        {
          title: 'Linear Search & Binary Search',
          sandboxType: 'sorting',
          xpReward: 25,
          contentMd: `# Tìm kiếm: Linear Search & Binary Search

## Mục tiêu bài học
- Cài đặt Linear Search O(n) và Binary Search O(log n).
- Hiểu điều kiện áp dụng Binary Search: mảng **đã sắp xếp**.
- Tránh lỗi tràn số nguyên khi tính giữa mảng.

## Linear Search — O(n)
Duyệt tuần tự từ đầu đến khi tìm thấy. Không đòi hỏi dữ liệu sắp xếp. Phù hợp mảng nhỏ hoặc tìm kiếm một lần.

## Binary Search — O(log n)
Chia đôi phạm vi tìm kiếm mỗi bước:
\`\`\`js
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // tránh tràn: (lo+hi)/2 có thể overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
\`\`\`

## Vì sao O(log n)?
Mỗi bước loại bỏ một nửa không gian tìm kiếm: \`n → n/2 → n/4 → … → 1\` cần \`log₂(n)\` bước.

## Các biến thể kinh điển
- **Lower bound** (first index ≥ target) và **Upper bound** (first index > target).
- Tìm phần tử xuất hiện một lần trong mảng toàn cặp.
- Tìm trong mảng đã xoay vòng (rotated sorted array).
- Tìm peak element (mảng không sắp xếp nhưng có cấu trúc đỉnh).

## Bẫy thường gặp
- Quên điều kiện \`lo <= hi\` (thay vì \`lo < hi\`) — mất phần tử đơn lẻ.
- Tràn số nguyên khi \`(lo + hi)\` vượt giới hạn — luôn dùng \`lo + (hi - lo) / 2\`.
- Vòng lặp vô hạn khi không cập nhật lo/hi đúng.

## Bài tập tự luyện
1. Tìm vị trí chèn (insert position) của target trong mảng đã sắp xếp.
2. Đếm số lần xuất hiện của target (2 binary searches).
3. Tìm phần tử bị thiếu trong mảng 1..n.

## Tài liệu tham khảo
- GeeksforGeeks — *Binary Search Algorithm* & *Linear Search*
- Programiz — *Binary Search*
- CS50 — *Week 3: Algorithms (searching)*`,
        },
        {
          title: 'Bubble Sort & Selection Sort',
          sandboxType: 'sorting',
          xpReward: 25,
          contentMd: `# Bubble Sort & Selection Sort

## Mục tiêu bài học
- Cài đặt và mô phỏng trực quan được Bubble Sort và Selection Sort.
- Phân tích so sánh/hoán đổi của từng thuật toán.
- Hiểu tối ưu "early exit" của Bubble Sort.

## Bubble Sort — "nổi bọt" phần tử lớn nhất
So sánh cặp liền kề, đổi chỗ nếu sai thứ tự — phần tử lớn nhất "nổi" lên cuối mảng sau mỗi lượt:
\`\`\`js
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;   // mảng đã sắp xếp → dừng sớm
  }
}
\`\`\`
- Worst/Average: O(n²), Best (đã sắp xếp): O(n) nhờ early exit.
- **Stable** (giữ thứ tự phần tử bằng nhau). Bộ nhớ O(1).

## Selection Sort — chọn phần tử nhỏ nhất
Mỗi lượt tìm phần tử nhỏ nhất còn lại và đưa về đúng vị trí:
\`\`\`js
function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++)
      if (arr[j] < arr[minIdx]) minIdx = j;
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
}
\`\`\`
- Luôn O(n²) so sánh nhưng tối đa n-1 hoán đổi → tốt khi chi phí hoán đổi cao.
- **Không stable**. Bộ nhớ O(1).

## Bảng so sánh
| Tiêu chí | Bubble | Selection |
| :--- | :--- | :--- |
| Thời gian | O(n²) / O(n) best | O(n²) luôn |
| Số hoán đổi | O(n²) | ≤ n-1 |
| Stable | ✅ | ❌ |
| Bộ nhớ | O(1) | O(1) |

## Bài tập tự luyện
1. Đếm số lượt so sánh của Bubble Sort với mảng đã sắp xếp ngược.
2. Mô phỏng Selection Sort lên mảng [64, 25, 12, 22, 11] từng bước.
3. Dùng kiến thức swapped detection: thuật toán nào tối ưu hơn cho mảng "gần sắp xếp"?

## Tài liệu tham khảo
- GeeksforGeeks — *Bubble Sort* & *Selection Sort*
- Programiz — *Bubble Sort* / *Selection Sort*
- CS50 — *Week 3: Algorithms (sorting)*`,
        },
        {
          title: 'Insertion Sort & so sánh họ O(n²)',
          sandboxType: 'sorting',
          xpReward: 25,
          contentMd: `# Insertion Sort & so sánh họ sắp xếp O(n²)

## Mục tiêu bài học
- Cài đặt Insertion Sort — thuật toán "chia bài" quen thuộc.
- So sánh 3 thuật toán O(n²) để chọn đúng bối cảnh.
- Hiểu vì sao Insertion Sort vẫn được dùng trong thực tế (gần-sắp-xếp, mảng nhỏ).

## Insertion Sort — chèn bài vào đúng vị trí
Giống cách chia bài: mỗi lượt lấy một phần tử và chèn vào phần đã sắp xếp phía trước:
\`\`\`js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];   // dịch phải
      j--;
    }
    arr[j + 1] = key;
  }
}
\`\`\`

## Độ phức tạp
- Worst: O(n²) — mảng giảm dần.
- Best: **O(n)** — mảng gần sắp xếp (rất ít dịch chuyển).
- **Stable** và bộ nhớ O(1) → lựa chọn lý tưởng làm **thuật toán nền** cho các bước nhỏ trong Merge/Quick Sort hiện đại (ví dụ TimSort của Python/JS).

## So sánh họ O(n²)
| Tiêu chí | Bubble | Selection | Insertion |
| :--- | :--- | :--- | :--- |
| Best case | O(n) | O(n²) | **O(n)** |
| Hoán đổi | Nhiều | Ít nhất | Trung bình |
| Stable | ✅ | ❌ | ✅ |
| Tốt cho mảng gần sắp xếp | ✅ | ❌ | ✅✅ |

## Trực quan hóa trong dự án
Mở tab Sorting trong ứng dụng, chọn Bubble/Selection/Insertion với cùng bộ dữ liệu [64, 25, 12, 22, 11] — quan sát số bước và mẫu hoán đổi của từng thuật toán. Lặp lại với mảng đã sắp xếp ngược để thấy sự khác biệt về số lượt.

## Bài tập tự luyện
1. Chạy Insertion Sort trên mảng 5 phần tử, vẽ lại mảng sau mỗi lượt.
2. Vì sao Insertion Sort nhanh với mảng gần sắp xếp? Phân tích số phép dịch chuyển.
3. Sắp xếp danh sách liên kết bằng insertion sort — có thể cải tiến gì?

## Tài liệu tham khảo
- GeeksforGeeks — *Insertion Sort*
- Programiz — *Insertion Sort*
- CLRS Chapter 2: *Insertion Sort* (thuật toán mở đầu sách)`,
        },
        {
          title: 'Hashing & Hash Table: xung đột, chaining',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Hashing & Hash Table

## Mục tiêu bài học
- Hiểu hàm băm (hash function) và bảng băm (hash table).
- Giải quyết xung đột bằng Separate Chaining và Open Addressing.
- Phân tích độ phức tạp **amortized** O(1) cho các thao tác.

## Ý tưởng
Hash function ánh xạ khóa (key) thành chỉ số mảng: \`index = hash(key) % capacity\`. Truy cập trực tiếp → trung bình O(1).

## Xung đột (collision)
Hai khóa khác nhau có cùng chỉ số. Hai chiến lược xử lý kinh điển:

**1) Separate Chaining** — mỗi slot là một danh sách liên kết:
\`\`\`js
class HashTable {
  constructor(capacity = 16) {
    this.table = Array.from({ length: capacity }, () => []);
    this.capacity = capacity;
  }
  _hash(key) {
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) % this.capacity;
    return h;
  }
  put(key, value) {
    const bucket = this.table[this._hash(key)];
    const idx = bucket.findIndex(([k]) => k === key);
    if (idx !== -1) bucket[idx][1] = value;
    else bucket.push([key, value]);
  }
  get(key) {
    const bucket = this.table[this._hash(key)];
    return bucket.find(([k]) => k === key)?.[1] ?? null;
  }
}
\`\`\`

**2) Open Addressing** — Linear Probing: nếu slot đầy, tìm slot trống kế tiếp.

## Hệ số tải (load factor)
\`α = số phần tử / capacity\`. Khi α vượt ngưỡng (~0.75), **rehash** mở rộng bảng — duy trì thao tác O(1) amortized.

## Ứng dụng phổ biến
- Đếm tần suất phần tử trong mảng (frequency map).
- Bài toán 2-Sum: \`target - arr[i]\` đã gặp chưa?
- Lưu cache, từ điển, database index (bucket hash).

## Bài tập tự luyện
1. Tìm phần tử xuất hiện nhiều nhất trong mảng bằng hash map.
2. 2-Sum: tìm cặp tổng bằng target trong O(n).
3. Tìm dãy con liên tiếp dài nhất (longest consecutive sequence) dùng hash set.

## Tài liệu tham khảo
- GeeksforGeeks — *Introduction to Hashing*
- Programiz — *Hash Table*
- CLRS Chapter 11: *Hash Tables*`,
        },
      ],
    },
  ],
};
