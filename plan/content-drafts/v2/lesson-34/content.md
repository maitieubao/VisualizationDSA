# 🎯 Trie (Prefix Tree)

## 1. Động cơ học (Why this matters)
Khi gõ 'ap' vào hộp tìm kiếm, các gợi ý apple, application, apex hiện ra tức thì — đó là autocomplete, tính năng quen thuộc nhưng rất khó cài bằng cấu trúc dữ liệu thường. Một hash set chỉ cho biết một từ có tồn tại hay không, không thể liệt kê các từ bắt đầu bằng một tiền tố. Trie (cây tiền tố) được thiết kế riêng cho lớp bài toán này: mọi phép toán chạy theo độ dài chuỗi, không phụ thuộc tổng số từ.

## 2. Lý thuyết cốt lõi
- Trie là cây đa phân, mỗi node đại diện một ký tự; đường đi từ gốc tạo thành một chuỗi (prefix).
- Node mang cờ isEnd = true đánh dấu nơi kết thúc một từ hợp lệ — quan trọng vì 'app' vừa là tiền tố của 'apple' vừa là từ độc lập.
- Mỗi node gồm children (bảng băm ký tự → node con) và cờ isEnd; node gốc rỗng, không mang ký tự.
- Các từ chia sẻ tiền tố chung sẽ dùng chung node nên cây gọn hơn lưu trữ riêng rẽ.

Ba thao tác insert, search, startsWith đều chỉ đi xuống cây theo từng ký tự nên thời gian không phụ thuộc kích thước từ điển — lợi thế hash set không có. Đổi lại, mỗi node giữ một cấu trúc children riêng nên bộ nhớ tăng nhanh với bảng chữ cái lớn hay từ vựng ít tiền tố chung; khi đó dùng Radix Tree để nén các node chỉ có một con.

## 3. Thuật toán từng bước
1. Insert: bắt đầu từ gốc, với mỗi ký tự của từ, tạo node con nếu chưa tồn tại rồi di chuyển xuống; sau khi đi hết từ, gán isEnd = true.
2. Search: đi theo từng ký tự; nếu gặp thiếu node ở giữa chuỗi thì trả false, nếu đi hết thì trả giá trị isEnd — khớp đủ ký tự thôi chưa đủ, cần cờ kết thúc.
3. StartsWith: giống search nhưng bỏ qua cờ isEnd — chỉ cần đường đi tồn tại là trả true.
4. Autocomplete: tới node cuối của prefix rồi duyệt DFS nhánh con, ghép ký tự dọc đường để thu thập từ; chi phí O(L + K) với K là số gợi ý.

Ví dụ từ điển gồm app và apple: gốc → 'a' → 'p' → 'p'; node 'p' thứ hai có isEnd (kết thúc app) và con 'l' → 'e' có isEnd (kết thúc apple). Search('ap') trả false do thiếu isEnd; StartsWith('ap') trả true; autocomplete với 'app' trả về app và apple.

### Ví dụ
```javascript
class TrieNode {
  constructor() {
    this.children = new Map(); // ký tự -> node con
    this.isEnd = false;        // đánh dấu cuối một từ
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  // chèn từ: tạo node con khi thiếu, cuối cùng gắn cờ
  insert(word) {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, new TrieNode());
      cur = cur.children.get(c);
    }
    cur.isEnd = true;
  }

  // trả node cuối của chuỗi, hoặc null khi thiếu đường đi
  findNode(word) {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) return null;
      cur = cur.children.get(c);
    }
    return cur;
  }

  // tìm kiếm chính xác: cần cả đường đi lẫn cờ isEnd
  search(word) {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  // kiểm tra tiền tố: chỉ cần đường đi tồn tại
  startsWith(prefix) {
    return this.findNode(prefix) !== null;
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Insert | O(L) | L là độ dài chuỗi |
| Search | O(L) | Đi xuống theo từng ký tự |
| StartsWith | O(L) | Không cần kiểm tra isEnd |
| Autocomplete | O(L + K) | K là số gợi ý trả về |

- Bộ nhớ: O(A × N × L) với A là kích thước bảng chữ cái, N là số từ, L là độ dài trung bình — tốn hơn hash set vì chi phí mỗi node.
- Tìm từ chính xác: cả hai đều O(L), nhưng truy vấn tiền tố với hash set phải duyệt toàn bộ O(N × L) còn Trie chỉ O(L).
- Trie duyệt theo thứ tự từ điển tự nhiên; ứng dụng gồm autocomplete, kiểm tra chính tả, định tuyến IP, word search II.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Trie lưu từng ký tự thành node; đường đi từ gốc là một tiền tố, cờ isEnd phân biệt từ với tiền tố.
- Insert, search, startsWith đều chạy O(L) — không phụ thuộc số lượng từ trong từ điển.
- Điểm mạnh là truy vấn tiền tố và autocomplete; hash set chỉ trả lời được câu hỏi tồn tại.
- Bộ nhớ cao hơn hash set; dùng Radix Tree khi từ vựng lớn và ít tiền tố chung.
- Bẫy thường gặp: search trả true khi chỉ khớp tiền tố mà quên kiểm tra isEnd; quên tạo node mới khi insert từ dài hơn các từ hiện có.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
