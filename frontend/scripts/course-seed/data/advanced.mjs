export const advancedCourse = {
  title: 'Thuật toán nâng cao & Tối ưu hóa',
  description:
    'Khóa học chuyên sâu cho người chuẩn bị phỏng vấn kỹ thuật hoặc thi lập trình đỉnh cao: cây cân bằng Red-Black/B-Tree, Trie, Disjoint Set Union, đồ thị nâng cao (MST, SCC, Flow), DP nâng cao (bitmask, digit, interval), string algorithms và kỹ thuật tối ưu. Chuẩn lộ trình GeeksforGeeks giai đoạn 3 và nội dung MIT 6.006 phần cuối.',
  thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  expectedTime: 80,
  category: 'Algorithm',
  difficulty: 'Advanced',
  isPremium: false,
  isPublished: true,
  modules: [
    {
      title: 'Chương 1: Cây tự cân bằng & Trie',
      description:
        'Red-Black Tree, B-Tree và Trie — nền tảng của cơ sở dữ liệu, bộ nhớ đệm và từ điển.',
      lessons: [
        {
          title: 'Red-Black Tree: bất biến màu & các phép xoay',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Red-Black Tree: bất biến màu & các phép xoay

## Mục tiêu bài học
- Nắm 5 bất biến màu của Red-Black Tree (RBT).
- Hiểu vì sao RBT cân bằng "lỏng" nhưng vẫn đảm bảo O(log n).
- So sánh RBT với AVL và thấy ứng dụng thực tế (std::map, TreeMap).

## 5 bất biến
1. Mỗi nút đỏ hoặc đen.
2. Gốc luôn đen.
3. Nút lá (NIL) đen.
4. Nút đỏ không có con đỏ (hai nút đỏ không liền kề).
5. Mọi đường đi từ gốc tới lá có **cùng số nút đen** (black-height).

## Chiều cao đảm bảo
Từ bất biến 4+5 suy ra: \`h ≤ 2·log₂(n+1)\`. Đường dài nhất chỉ gấp đôi đường ngắn nhất → chèn/xóa/tìm **O(log n)**.

## Chèn: 3 trường hợp fix-up
Sau khi chèn nút đỏ, vi phạm bất biến 4. Xử lý theo **chú (uncle)**:
- Uncle đỏ → **đổi màu** cha, chú, ông; leo lên ông.
- Uncle đen, zig-zag (LR/RL) → xoay con → về dạng thẳng.
- Uncle đen, thẳng (LL/RR) → **xoay ông + đổi màu**.

## Xóa: 2 trường hợp chính
Xóa nút đen gây thâm hụt black-height → xử lý double-black bằng 4 case (sibling đỏ/đen + con của sibling). Chi tiết phức tạp — quan trọng là **bất biến được phục hồi sau O(log n)**.

## RBT vs AVL
| | Red-Black | AVL |
| :--- | :--- | :--- |
| Cân bằng | Lỏng (h ≤ 2log n) | Chặt (h ≤ 1.44log n) |
| Chèn/Xóa | Ít xoay hơn | Nhiều xoay hơn |
| Tìm kiếm | Chậm hơn chút | Nhanh hơn chút |
| Dùng khi | Viết nhiều, đọc vừa | Đọc nhiều, viết ít |

## Ứng dụng
- C++ \`std::map/std::set\`, Java \`TreeMap/TreeSet\`, Linux Completely Fair Scheduler.
- Nền tảng của **Timsort** (Python/Java sort) khi dãy nhỏ.

## Bài tập tự luyện
1. Chèn \`41, 38, 31, 12, 19, 8\` vào RBT rỗng, vẽ từng bước đổi màu/xoay.
2. Với n = 10⁶, chứng minh chiều cao RBT ≤ 40.
3. Giải thích tại sao RBT không cần tái cân bằng toàn cây sau mỗi phép viết.

## Tài liệu tham khảo
- GeeksforGeeks — *Red-Black Tree*
- CLRS Chapter 13: *Red-Black Trees*
- MIT 6.006 Lecture 8: *AVL Trees* (so sánh)`,
        },
        {
          title: 'B-Tree & ứng dụng trong cơ sở dữ liệu',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# B-Tree & ứng dụng trong cơ sở dữ liệu

## Mục tiêu bài học
- Hiểu cấu trúc B-Tree bậc m (nhiều con, nhiều khóa/nút).
- Giải thích vì sao B-Tree giảm số lần truy cập đĩa — nền tảng DB index.
- So sánh B-Tree với Binary Search Tree trong ngữ cảnh bộ nhớ ngoài.

## Tại sao cần B-Tree?
BST/AVL tối ưu RAM, nhưng **đĩa đọc theo block**: mỗi block chứa nhiều khóa. Nếu cây "cao", mỗi tầng = 1 lần truy cập đĩa. B-Tree **bậc m** có tới m con/nút → chiều cao giảm mạnh.

## Định nghĩa (B-Tree bậc m)
- Mỗi nút có ≤ m con, ≥ ⌈m/2⌉ con (trừ gốc).
- Nút nội lưu k−1 khóa cho k con — khóa phân tách vùng dữ liệu của các con.
- Mọi lá cùng độ sâu → chiều cao tối thiểu \`⌈log_m(n)⌉\`, tối đa \`⌊log_{⌈m/2⌉}(n)⌋\`.

## Thao tác
- **Chèn**: thêm khóa vào lá; đầy thì **split** (tách nút, đẩy khóa giữa lên cha).
- **Xóa**: merge/split ngược lại — giữ bất biến số con tối thiểu.
- Mỗi thao tác **O(log_m n)** truy cập đĩa — với m lớn (vd 1000), chỉ 2–3 block cho 1 tỷ khóa.

## B+Tree — biến thể DB thực tế
- Khóa trùng lặp ở lá; lá nối **linked list** để quét tuần tự nhanh (range query).
- MySQL InnoDB, PostgreSQL, MongoDB đều dùng B+Tree làm index.

## So sánh BST vs B-Tree
| | BST | B-Tree (m=100) |
| :--- | :--- | :--- |
| Chiều cao với 10⁶ khóa | ~20 | ~3 |
| Lần đọc đĩa (worst) | ~20 | ~3 |
| Cache locality | Kém | Tốt (block) |

## Bài tập tự luyện
1. Chèn \`1..10\` vào B-Tree bậc 4, vẽ các lần split.
2. Với 1 tỷ khóa và m=1000, chiều cao tối đa là bao nhiêu?
3. Tại sao B+Tree dùng cho range query tốt hơn B-Tree?

## Tài liệu tham khảo
- GeeksforGeeks — *B-Tree*
- CLRS Chapter 18: *B-Trees*
- MIT 6.006 Lecture 8 (extra): *B-Trees*`,
        },
        {
          title: 'Trie: tìm kiếm tiền tố, autocomplete, count distinct',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# Trie: tìm kiếm tiền tố, autocomplete, count distinct

## Mục tiêu bài học
- Xây dựng Trie (prefix tree) — chèn, tìm, xóa tiền tố.
- Giải bài toán tìm kiếm tiền tố, autocomplete, số từ khác nhau.
- So sánh Trie với hash map trong bài toán từ điển.

## Cấu trúc
Mỗi nút = mảng con + cờ \`isEnd\`. Chia sẻ tiền tố chung → tiết kiệm bộ nhớ với tập từ có tiền tố trùng.

\`\`\`js
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}
\`\`\`

## Độ phức tạp
- Chèn/tìm/startsWith: **O(L)** với L = độ dài chuỗi — không phụ thuộc số từ.
- Hash map cũng O(L) nhưng **không duyệt được theo tiền tố**; Trie tự nhiên hỗ trợ prefix.

## Ứng dụng
- Autocomplete / từ điển gợi ý.
- Tìm **số chuỗi khác nhau** (đếm nút làEnd) — thay cho sort rồi dedupe.
- **XOR lớn nhất**: binary trie (bit 0/1) cho mảng số.
- Spell checker, IP routing (longest prefix match).

## Bài tập tự luyện
1. Đếm số từ khác nhau trong dòng văn bản bằng Trie.
2. Autocomplete: cho tiền tố, liệt kê mọi từ bắt đầu bằng tiền tố đó.
3. Tìm cặp số có **XOR lớn nhất** trong mảng — dùng binary trie O(n·32).

## Tài liệu tham khảo
- GeeksforGeeks — *Trie | (Insert and Search)*
- MIT 6.006 Lecture 7 (extra): *Binary Heaps / Tries*
- LeetCode — *Implement Trie (Prefix Tree)*`,
        },
        {
          title: 'Disjoint Set Union (DSU) & Union-Find nâng cao',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Disjoint Set Union (DSU) & Union-Find nâng cao

## Mục tiêu bài học
- Cài đặt DSU với path compression + union by rank/size.
- Hiểu chi phí gần như O(1) — hàm Ackermann ngược.
- Ứng dụng: thành phần liên thông động, Kruskal MST, cycle detection.

## Ý tưởng
Mỗi tập có một **đại diện** (representative). \`find(x)\` trả đại diện; \`union(x,y)\` gộp hai tập.

\`\`\`js
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // path compression
    return this.parent[x];
  }
  union(x, y) {
    let rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) [rx, ry] = [ry, rx];
    this.parent[ry] = rx;
    if (this.rank[rx] === this.rank[ry]) this.rank[rx]++;
    return true;
  }
}
\`\`\`

## Hai tối ưu quyết định
- **Path compression**: nén đường đi khi find — cây càng "bẹt".
- **Union by rank/size**: gắn cây nhỏ vào cây lớn.
Kết hợp cả hai → tổng m thao tác **O(m·α(n))**, với α(n) ≤ 4 trên thực tế.

## Ứng dụng kinh điển
- **Kruskal MST**: sắp xếp cạnh, union cạnh nối hai tập khác nhau.
- **Cycle detection trên đồ thị vô hướng**: union cạnh (u,v); nếu find(u)==find(v) → có chu trình.
- **Offline queries**: truy vấn "u, v có liên thông sau khi thêm k cạnh" — xử lý theo thứ tự.
- Dynamic connectivity trong game/map.

## Bài tập tự luyện
1. Số thành phần liên thông còn lại sau khi thêm lần lượt các cạnh (online queries).
2. Kiểm tra đồ thị vô hướng có chu trình bằng DSU.
3. Số nhóm bạn bè trong danh sách quan hệ (union mọi cặp, đếm gốc).

## Tài liệu tham khảo
- GeeksforGeeks — *Disjoint Set Data Structures*
- CLRS Chapter 21: *Data Structures for Disjoint Sets*
- MIT 6.006 Recitation: *Union-Find*`,
        },
      ],
    },
    {
      title: 'Chương 2: Đồ thị nâng cao',
      description:
        'Cây khung nhỏ nhất, thành phần liên thông mạnh, luồng cực đại và các kỹ thuật duyệt đồ thị phức tạp.',
      lessons: [
        {
          title: 'MST: Prim & Kruskal, phát hiện chu trình',
          sandboxType: 'graph',
          xpReward: 40,
          contentMd: `# MST: Prim & Kruskal, phát hiện chu trình

## Mục tiêu bài học
- Hiểu định nghĩa Minimum Spanning Tree (MST) và tính chất cắt (cut property).
- Cài đặt Kruskal (DSU + sort) và Prim (min-heap).
- So sánh độ phức tạp hai thuật toán theo đặc điểm đồ thị.

## Định nghĩa
MST = cây bao trùm mọi đỉnh với **tổng trọng số cạnh nhỏ nhất** trong đồ thị liên thông vô hướng.

## Kruskal — greedy theo cạnh
1. Sắp xếp cạnh tăng dần trọng số.
2. Duyệt từng cạnh, nếu hai đầu **chưa cùng tập** (DSU) thì thêm vào cây.

\`\`\`js
function kruskal(n, edges) {
  const dsu = new DSU(n);
  edges.sort((a, b) => a[2] - b[2]);
  let total = 0, count = 0;
  for (const [u, v, w] of edges) {
    if (dsu.union(u, v)) { total += w; count++; }
    if (count === n - 1) break;
  }
  return total;
}
\`\`\`
Độ phức tạp: **O(E log E)** (sort) + **O(E α(n))** (union).

## Prim — greedy theo đỉnh
Bắt đầu từ 1 đỉnh, luôn chọn **cạnh rẻ nhất** nối cây đang xây với đỉnh ngoài:

\`\`\`js
function prim(g, n) {
  const inTree = new Array(n).fill(false);
  const dist = new Array(n).fill(Infinity);
  dist[0] = 0;
  const pq = [[0, 0]];
  let total = 0;
  while (pq.length) {
    const [d, u] = pq.shift(); // min-heap thật
    if (inTree[u]) continue;
    inTree[u] = true;
    total += d;
    for (const { to, w } of g[u]) {
      if (!inTree[to] && w < dist[to]) {
        dist[to] = w;
        pq.push([w, to]);
      }
    }
  }
  return total;
}
\`\`\`
Độ phức tạp: **O(E log V)** với heap.

## Khi nào dùng gì?
- Kruskal: đồ thị **thưa** (E ≈ V), đơn giản nhờ sort.
- Prim: đồ thị **dày đặc** (E ≈ V²) hoặc cần dừng sớm.

## Bài tập tự luyện
1. Tìm MST và **cạnh ngoài cây** nhỏ nhất tạo chu trình (second MST).
2. Có bao nhiêu MST khác nhau với các cạnh trọng số bằng nhau? (Kruskal với edge quyền chọn).
3. Giảm trọng số một cạnh — MST mới có thay đổi không?

## Tài liệu tham khảo
- GeeksforGeeks — *Kruskal's Algorithm*, *Prim's Algorithm*
- CLRS Chapter 23: *Minimum Spanning Trees*
- MIT 6.006 Lecture 18: *Minimum Spanning Trees*`,
        },
        {
          title: 'SCC: thuật toán Kosaraju & Tarjan',
          sandboxType: 'graph',
          xpReward: 40,
          contentMd: `# SCC: thuật toán Kosaraju & Tarjan

## Mục tiêu bài học
- Định nghĩa Strongly Connected Component trên đồ thị có hướng.
- Cài đặt Kosaraju: 2 lần DFS + đồ thị đảo.
- Hiểu Tarjan: 1 lần DFS với low-link values.

## Định nghĩa
Thành phần liên thông mạnh (SCC) = tập con tối đa các đỉnh mà **mọi đỉnh đều tới được nhau** (có hướng). Nén SCC thành DAG → thu gọn bài toán đồ thị.

## Kosaraju — 2 lần DFS
1. DFS tính **thứ tự hoàn thành** (finish order) trên đồ thị gốc.
2. Xây đồ thị **đảo ngược** cạnh.
3. Duyệt đảo theo finish order **giảm dần**; mỗi lần DFS gặp được một SCC.

\`\`\`js
function kosaraju(g, n) {
  const visited = new Array(n).fill(false);
  const order = [];
  const dfs = (u) => {
    visited[u] = true;
    for (const { to } of g[u]) if (!visited[to]) dfs(to);
    order.push(u);
  };
  for (let i = 0; i < n; i++) if (!visited[i]) dfs(i);
  const rev = Array.from({ length: n }, () => []);
  for (let u = 0; u < n; u++) for (const { to } of g[u]) rev[to].push({ to: u });
  const comp = new Array(n).fill(-1);
  let id = 0;
  const dfsRev = (u) => {
    comp[u] = id;
    for (const { to } of rev[u]) if (comp[to] === -1) dfsRev(to);
  };
  for (let i = n - 1; i >= 0; i--) {
    if (comp[order[i]] === -1) { dfsRev(order[i]); id++; }
  }
  return comp; // comp[u] = mã SCC
}
\`\`\`

## Tarjan — low-link trong 1 lần DFS
Mỗi đỉnh có \`disc\` (thời điểm thăm) và \`low\` (disc nhỏ nhất tới được). Gặp back-edge thì cập nhật low; nút gốc cây DFS có \`disc == low\` → pop stack ra một SCC.

## Ứng dụng
- Rút gọn đồ thị phụ thuộc để phát hiện vòng lặp trong build system.
- Xếp hạng trang (Kosaraju trong PageRank preprocessing).
- 2-SAT (thuật toán tuyến tính trên đồ thị hàm ý).

## Bài tập tự luyện
1. Đếm số SCC của đồ thị có hướng.
2. Kiểm tra mọi đỉnh có tới được mọi đỉnh khác không (1 SCC duy nhất).
3. Tìm **số đỉnh tối thiểu cần thêm** để đồ thị liên thông mạnh (dùng nén SCC + in/out degree).

## Tài liệu tham khảo
- GeeksforGeeks — *Strongly Connected Components*, *Tarjan's Algorithm*
- CLRS Chapter 22.5: *Strongly Connected Components*
- MIT 6.006 Lecture 15: *Graphs (SCC)*`,
        },
        {
          title: 'Floyd-Warshall & đường đi ngắn nhất mọi cặp',
          sandboxType: 'graph',
          xpReward: 35,
          contentMd: `# Floyd-Warshall & đường đi ngắn nhất mọi cặp

## Mục tiêu bài học
- Cài đặt Floyd-Warshall — DP trên 3 vòng lặp.
- Hiểu vai trò trung gian đỉnh k trong truy hồi.
- Ứng dụng: đóng bắc cầu, bán kính đồ thị, chu trình âm.

## Ý tưởng DP
\`dist[k][i][j]\` = đường đi ngắn nhất từ i tới j chỉ đi qua các đỉnh trung gian trong \`{0..k}\`:
\`dist[k][i][j] = min(dist[k−1][i][j], dist[k−1][i][k] + dist[k−1][k][j])\`.

\`\`\`js
function floydWarshall(adj, n) {
  const dist = adj.map(row => row.slice());
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}
\`\`\`

## Độ phức tạp
**O(V³)** thời gian, **O(V²)** không gian. Chạy Dijkstra V lần: O(V·E log V) — thắng khi đồ thị thưa và V nhỏ.

## Phát hiện chu trình âm
Sau khi chạy, nếu \`dist[i][i] < 0\` → tồn tại chu trình âm đi qua i.

## Ứng dụng
- **Transitive closure**: thay min bằng OR → bài toán "có đường đi hay không".
- **Đường kính đồ thị**: max dist giữa mọi cặp.
- **Bài toán định tuyến** nhiều nguồn, ma trận chi phí.

## Bài tập tự luyện
1. Tìm bán kính (eccentricity min) của đồ thị.
2. Kiểm tra đồ thị có chu trình âm không bằng Floyd-Warshall.
3. Đóng bắc cầu: biến đổi ma trận liền kề thành ma trận reachability.

## Tài liệu tham khảo
- GeeksforGeeks — *Floyd Warshall Algorithm*
- CLRS Chapter 25: *All-Pairs Shortest Paths*
- MIT 6.006 Lecture 17 (extra)`,
        },
        {
          title: 'Max Flow: Ford-Fulkerson, Edmonds-Karp, ứng dụng',
          sandboxType: 'graph',
          xpReward: 45,
          contentMd: `# Max Flow: Ford-Fulkerson, Edmonds-Karp, ứng dụng

## Mục tiêu bài học
- Mô hình bài toán luồng cực đại trên mạng.
- Cài đặt Edmonds-Karp (BFS tìm đường tăng) — O(V·E²).
- Chuyển đổi bài toán thực tế sang max flow: matching, min cut.

## Mô hình
Đồ thị có hướng với khả năng thông qua (capacity) cạnh; nguồn s, đích t. **Luồng cực đại** = lượng tối đa đẩy từ s tới t tôn trọng capacity và cân bằng dòng tại nút trung gian.

## Ford-Fulkerson — tư tưởng
Lặp: tìm đường tăng trong **đồ thị thặng dư** (cạnh dư + cạnh ngược), tăng luồng tới khi không còn đường. **Edmonds-Karp** = luôn dùng **BFS** (đường ngắn nhất) → đảm bảo dừng trong **O(V·E²)**.

\`\`\`js
function maxFlow(g, s, t, n) {
  const cap = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, c] of g) { cap[u][v] += c; }
  let flow = 0;
  while (true) {
    const parent = new Array(n).fill(-1);
    const q = [s];
    parent[s] = s;
    for (let i = 0; i < q.length && parent[t] === -1; i++) {
      const u = q[i];
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) { parent[v] = u; q.push(v); }
      }
    }
    if (parent[t] === -1) break;
    let bottleneck = Infinity;
    for (let v = t; v !== s; v = parent[v]) bottleneck = Math.min(bottleneck, cap[parent[v]][v]);
    for (let v = t; v !== s; v = parent[v]) { cap[parent[v]][v] -= bottleneck; cap[v][parent[v]] += bottleneck; }
    flow += bottleneck;
  }
  return flow;
}
\`\`\`

## Định lý Min-Cut Max-Flow
Luồng cực đại = **sức chứa nhỏ nhất** của một lát cắt (s,t). Định lý này cho phép chuyển bài toán "cắt tối thiểu" về max flow.

## Ứng dụng mạnh mẽ
- **Bipartite matching**: nối s → nhóm trái (cap 1), cạnh quan hệ, nhóm phải → t → số cặp tối đa.
- **Bài toán phân công**, **lịch trực**, **mạng lưới giao thông**, **cutting image** (min cut).

## Bài tập tự luyện
1. Tìm matching cực đại của đồ thị hai phía bằng max flow.
2. Vẽ mạng và tính max flow bằng tay (ví dụ 6 đỉnh).
3. Chứng minh: min cut == max flow trên ví dụ cụ thể.

## Tài liệu tham khảo
- GeeksforGeeks — *Max Flow Problem Introduction*, *Ford-Fulkerson Algorithm*
- CLRS Chapter 26: *Maximum Flow*
- MIT 6.006 Lecture 22: *Max Flow / Min Cut*`,
        },
      ],
    },
    {
      title: 'Chương 3: DP nâng cao & Kỹ thuật tối ưu',
      description:
        'Bitmask DP, digit DP, interval DP và các kỹ thuật tối ưu hóa quy hoạch động (convex hull, divide & conquer optimization).',
      lessons: [
        {
          title: 'Bitmask DP: bài toán người giao hàng (TSP)',
          sandboxType: 'dsa',
          xpReward: 45,
          contentMd: `# Bitmask DP: bài toán người giao hàng (TSP)

## Mục tiêu bài học
- Biểu diễn tập con bằng **bitmask** — DP trên mọi tập con.
- Giải TSP (Traveling Salesman Problem) trong O(n²·2ⁿ).
- Hiểu giới hạn: bitmask DP chỉ dùng được khi n ≤ 20–22.

## Vấn đề
Đồ thị đầy đủ n thành phố, tìm chu trình đi qua **mọi thành phố đúng 1 lần** và quay về với tổng chi phí nhỏ nhất. Brute-force n! — không khả thi.

## Trạng thái bitmask
\`dp[mask][i]\` = chi phí nhỏ nhất đi qua tập thành phố \`mask\` và **kết thúc tại i**. Chuyển trạng thái: thêm thành phố k chưa đi:

\`\`\`js
function tsp(n, cost) {
  const size = 1 << n;
  const dp = Array.from({ length: size }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; // bắt đầu từ thành phố 0
  for (let mask = 1; mask < size; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i)) || dp[mask][i] === Infinity) continue;
      for (let k = 0; k < n; k++) {
        if (mask & (1 << k)) continue;
        dp[mask | (1 << k)][k] = Math.min(dp[mask | (1 << k)][k], dp[mask][i] + cost[i][k]);
      }
    }
  }
  const full = size - 1;
  let ans = Infinity;
  for (let i = 1; i < n; i++) ans = Math.min(ans, dp[full][i] + cost[i][0]);
  return ans;
}
\`\`\`

## Độ phức tạp
Số trạng thái 2ⁿ·n, mỗi trạng thái O(n) chuyển → **O(n²·2ⁿ)**. Với n=20: ~4×10⁸ phép — chạm giới hạn thực tế.

## Mẹo bit
- Kiểm tra bit: \`mask & (1 << i)\`.
- Bật bit: \`mask | (1 << i)\`.
- Đếm bit: \`mask & (mask − 1)\` bỏ bit thấp nhất — duyệt tập con hiệu quả.

## Bài tập tự luyện
1. Partition to k equal sum subsets dùng bitmask.
2. Tìm số hoán vị thỏa điều kiện "không có 2 kẻ thù cạnh nhau" (bitmask + đếm).
3. Minimum number of work sessions — DP bitmask trên công việc.

## Tài liệu tham khảo
- GeeksforGeeks — *Travelling Salesman Problem using Dynamic Programming*
- Competitive Programming 3 (Halim) — *Bitmask DP*
- CSES — *Hamiltonian Flights*`,
        },
        {
          title: 'Digit DP: đếm số thỏa điều kiện chữ số',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Digit DP: đếm số thỏa điều kiện chữ số

## Mục tiêu bài học
- Hiểu kỹ thuật đếm số trong khoảng [L, R] bằng DP theo chữ số.
- Nắm biến trạng thái "tight" — giới hạn bởi chữ số của n.
- Giải các bài toán đếm điều kiện chữ số phổ biến.

## Vấn đề mẫu
Đếm số x trong \`[0, n]\` sao cho **tổng các chữ số chia hết cho k** (n ≤ 10¹⁸).

## Ý tưởng
\`dp[pos][sum][tight]\`: xét tới vị trí \`pos\` (từ trái sang phải), tổng dư \`sum\`, đang bị chặn bởi n (\`tight\`) hay không. Với tight = true, chỉ chọn chữ số ≤ \`n[pos]\`.

\`\`\`js
function count(n, k) {
  const digits = String(n).split('').map(Number);
  const memo = Array.from({ length: digits.length }, () =>
    Array.from({ length: k }, () => new Array(2).fill(-1)));
  const dp = (pos, sum, tight) => {
    if (pos === digits.length) return sum % k === 0 ? 1 : 0;
    if (memo[pos][sum][tight] !== -1) return memo[pos][sum][tight];
    let res = 0;
    const limit = tight ? digits[pos] : 9;
    for (let d = 0; d <= limit; d++) {
      res += dp(pos + 1, (sum + d) % k, tight && d === limit);
    }
    return memo[pos][sum][tight] = res;
  };
  return dp(0, 0, 1);
}
// Đáp án [L,R] = count(R) − count(L−1)
\`\`\`

## Vì sao hiệu quả?
Số chữ số ≤ 19, trạng thái 19 × k × 2 — dù n đến 10¹⁸ vẫn chỉ vài nghìn trạng thái (mỗi trạng thái duyệt 10 chữ số).

## Biến thể phổ biến
- Chứa/không chứa một chuỗi con (kết hợp KMP automaton).
- Đếm số không có **số 4 và 13 liền nhau**.
- Đếm số chẵn chữ số 3, số bit 1 trong binary representation (bit digit DP).

## Bài tập tự luyện
1. Đếm số chứa chữ số 7 trong [1, 10⁹].
2. Đếm số có đúng k chữ số lẻ trong [0, n].
3. Số không có hai chữ số liền nhau bằng nhau.

## Tài liệu tham khảo
- GeeksforGeeks — *Digit DP | Introduction*
- Competitive Programming 3 — *Digit DP*
- Codeforces blog: *Digit DP* (intro tutorial)`,
        },
        {
          title: 'Interval DP: MCM, palindromic subsequence, stone game',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Interval DP: MCM, palindromic subsequence, stone game

## Mục tiêu bài học
- Nhận diện bài toán DP trên **đoạn [i, j]**.
- Giải Matrix Chain Multiplication — mô hình kinh điển.
- Giải dãy con palindrome dài nhất và game lấy đá.

## Ý tưởng
Trạng thái \`dp[i][j]\` = kết quả trên đoạn từ i tới j; chuyển trạng thái bằng cách **chia đoạn tại k** (\`i ≤ k < j\`). Thứ tự tính: theo chiều dài đoạn tăng dần.

## Matrix Chain Multiplication (MCM)
\`dp[i][j]\` = số phép nhân tối thiểu nhân dãy ma trận i..j:
\`dp[i][j] = min over k (dp[i][k] + dp[k+1][j] + p[i−1]·p[k]·p[j])\`

\`\`\`js
function mcm(dims) { // dims[i-1] x dims[i] là ma trận i
  const n = dims.length - 1;
  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        dp[i][j] = Math.min(dp[i][j],
          dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]);
      }
    }
  }
  return dp[1][n];
}
\`\`\`

## Palindromic subsequence dài nhất
\`dp[i][j]\`: nếu s[i]==s[j] → \`dp[i+1][j−1] + 2\`; ngược lại \`max(dp[i+1][j], dp[i][j−1])\`.

## Stone Game / game trên đoạn
\`dp[i][j]\` = lợi thế của người đi trước trên đoạn đá \`[i,j]\`; chuyển trạng thái từ hai đầu (lấy trái hoặc phải).

## Độ phức tạp
O(n²) trạng thái, mỗi trạng thái O(n) → **O(n³)** điển hình. Với n ≤ 500 là chấp nhận được.

## Bài tập tự luyện
1. Cắt xích (burst balloons) — biến thể MCM.
2. Dãy con palindrome dài nhất — in chuỗi kết quả.
3. Đếm số cách ngoặc hóa biểu thức đúng (boolean parenthesization).

## Tài liệu tham khảo
- GeeksforGeeks — *Matrix Chain Multiplication*, *Longest Palindromic Subsequence*
- CLRS 15.3: *Matrix-Chain Multiplication*
- Competitive Programming 3 — *Interval DP*`,
        },
        {
          title: 'Kỹ thuật tối ưu DP: CHT, Divide & Conquer optimization',
          sandboxType: 'dsa',
          xpReward: 45,
          contentMd: `# Kỹ thuật tối ưu DP: CHT, Divide & Conquer optimization

## Mục tiêu bài học
- Nhận diện bài toán DP có thể tối ưu bằng Convex Hull Trick (CHT).
- Hiểu ý tưởng Divide & Conquer DP optimization.
- Giảm độ phức tạp từ O(n²) xuống O(n log n) hoặc O(n).

## Convex Hull Trick
DP dạng \`dp[i] = min_j (a_j·x_i + b_j) + const\` — mỗi j là một **đường thẳng** \`y = a_j·x + b_j\`, câu hỏi là min tại \`x_i\`. Nếu các \`a_j\` chèn theo thứ tự và \`x_i\` tăng dần → dùng **deque** giữ hull, pop đường thẳng không còn là min.

\`\`\`js
// Mảng thẳng được thêm theo hệ số a tăng dần, truy vấn x tăng dần
function chtSolve(lines, queries) {
  const hull = []; // {a, b}
  const cross = (l1, l2, l3) => (l2.b - l1.b) * (l1.a - l3.a) >= (l3.b - l1.b) * (l1.a - l2.a);
  let ptr = 0;
  const add = (a, b) => {
    const line = { a, b };
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], line)) hull.pop();
    hull.push(line);
    if (ptr >= hull.length) ptr = hull.length - 1;
  };
  const query = (x) => {
    while (ptr + 1 < hull.length && hull[ptr].a * x + hull[ptr].b >= hull[ptr + 1].a * x + hull[ptr + 1].b) ptr++;
    return hull[ptr].a * x + hull[ptr].b;
  };
  return queries.map(q => query(q));
}
\`\`\`

## Divide & Conquer DP optimization
Bài \`dp[i][j] = min_{k<j} (dp[i−1][k] + C(k, j))\` với tính chất **quadrangle inequality**: vị trí tối ưu \`opt[i][j]\` đơn điệu (\`opt[i][j−1] ≤ opt[i][j] ≤ opt[i][j+1]\`). Khi đó đệ quy chia giữa — mỗi tầng O(n), tổng **O(n log n)** thay cho O(n²).

## Nhận diện khi nào dùng
- Công thức DP có hệ số \`a_j·x_i\` lẫn nhau → CHT.
- DP 2 chiều + chi phí đoạn + opt đơn điệu → D&C optimization.
- Nghi ngờ tính đơn điệu → thử brute-force opt trên mẫu nhỏ.

## Bài tập tự luyện
1. Bài toán "bài viết & dòng" (poet problem): dp[i] = min(dp[j] + cost(j,i)) — dùng CHT.
2. Chia n phần tử thành k nhóm tối ưu — dùng D&C optimization.
3. Cho hàm cost thỏa quadrangle, viết brute-force kiểm tra opt có đơn điệu không.

## Tài liệu tham khảo
- GeeksforGeeks — *Convex Hull Trick*
- Competitive Programming 3 — *DP Optimization*
- Codeforces blog: *Convex Hull Trick* (cp-algorithms.com)`,
        },
      ],
    },
    {
      title: 'Chương 4: Thuật toán chuỗi (String Algorithms)',
      description:
        'KMP, Z-algorithm, Rolling Hash/Rabin-Karp và các kỹ thuật xử lý chuỗi tốc độ tuyến tính.',
      lessons: [
        {
          title: 'KMP: tìm kiếm mẫu trong văn bản O(n + m)',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# KMP: tìm kiếm mẫu trong văn bản O(n + m)

## Mục tiêu bài học
- Hiểu hàm tiền tố (prefix function / LPS array).
- Cài đặt KMP — trượt mẫu thông minh, không quay lui văn bản.
- So sánh với naive search O(n·m).

## Vấn đề
Tìm mọi vị trí xuất hiện của mẫu P (dài m) trong văn bản T (dài n). Naive: O(n·m). KMP: **O(n + m)**.

## LPS array
\`lps[i]\` = độ dài tiền tố dài nhất của \`P[0..i]\` đồng thời là hậu tố của chính nó (đúng prefix). Vd P = "ababaca" → lps = [0,0,1,2,3,0,1].

\`\`\`js
function buildLps(p) {
  const lps = new Array(p.length).fill(0);
  let len = 0, i = 1;
  while (i < p.length) {
    if (p[i] === p[len]) { lps[i++] = ++len; }
    else if (len > 0) { len = lps[len - 1]; }
    else { lps[i++] = 0; }
  }
  return lps;
}

function kmpSearch(t, p) {
  const lps = buildLps(p);
  const found = [];
  let i = 0, j = 0;
  while (i < t.length) {
    if (t[i] === p[j]) { i++; j++; }
    if (j === p.length) {
      found.push(i - j);
      j = lps[j - 1];
    } else if (i < t.length && t[i] !== p[j]) {
      j = j > 0 ? lps[j - 1] : i++;
    }
  }
  return found;
}
\`\`\`

## Tại sao không quay lui?
Khi khớp hỏng tại j, thay vì trượt mẫu 1 ô, ta trượt tới **\`lps[j−1]\`** — phần hậu tố đã khớp trùng với tiền tố. Chỉ số i của văn bản **không bao giờ giảm** → tổng tuyến tính.

## Ứng dụng
- Tìm chu kỳ của chuỗi: nếu \`n % (n − lps[n−1]) == 0\` → chu kỳ = \`n − lps[n−1]\`.
- Xây **automaton KMP** cho digit DP (không chứa mẫu cấm).
- Tìm xâu con lặp dài nhất, kiểm tra chuỗi là lặp của một chuỗi nhỏ hơn.

## Bài tập tự luyện
1. Tìm **số lần** mẫu xuất hiện trong văn bản (đếm thay vì liệt kê).
2. Kiểm tra chuỗi có phải lặp của xâu con (ví dụ "ababab" = 3 lần "ab").
3. Tìm chu kỳ ngắn nhất của chuỗi bằng lps.

## Tài liệu tham khảo
- GeeksforGeeks — *KMP Algorithm for Pattern Searching*
- CLRS 32.4: *The Knuth-Morris-Pratt Algorithm*
- cp-algorithms.com — *Prefix function. Knuth–Morris–Pratt*`,
        },
        {
          title: 'Z-algorithm & Rabin-Karp: hashing chuỗi',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Z-algorithm & Rabin-Karp: hashing chuỗi

## Mục tiêu bài học
- Hiểu Z-array và cài đặt Z-algorithm O(n).
- Triển khai Rolling Hash (Rabin-Karp) — so sánh chuỗi trung bình O(n+m).
- Chọn giữa các thuật toán tìm mẫu theo bối cảnh.

## Z-array
\`Z[i]\` = độ dài khớp dài nhất giữa \`s[0..]\` và \`s[i..]\`. Ghép P + "$" + T, mọi vị trí có \`Z[i] ≥ m\` là một lần xuất hiện.

\`\`\`js
function zAlgorithm(s) {
  const z = new Array(s.length).fill(0);
  let l = 0, r = 0;
  for (let i = 1; i < s.length; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < s.length && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}
\`\`\`
Bất biến \`[l, r]\` (khối khớp xa nhất) → mỗi ký tự so khớp tối đa một lần → **O(n)**.

## Rabin-Karp — rolling hash
Băm mẫu và băm mỗi cửa sổ trượt trong O(1) trượt (trừ phải cộng/trừ) → khớp cửa sổ nào hash trùng (xác suất cao):

\`\`\`js
function rabinKarp(t, p) {
  const MOD = 10 ** 9 + 7, BASE = 91138233 % MOD;
  const m = p.length;
  let h = 0, hp = 0, pow = 1;
  for (let i = 0; i < m; i++) {
    hp = (hp * BASE + p.charCodeAt(i)) % MOD;
    h = (h * BASE + t.charCodeAt(i)) % MOD;
    pow = pow * BASE % MOD;
  }
  const found = [];
  for (let i = 0; i + m <= t.length; i++) {
    if (h === hp) found.push(i);
    if (i + m < t.length) {
      h = ((h * BASE - t.charCodeAt(i) * pow % MOD + MOD) % MOD + t.charCodeAt(i + m)) % MOD;
    }
  }
  return found;
}
\`\`\`
Trung bình **O(n + m)**, xấu nhất O(n·m) (trùng hash nhiều — có thể giảm bằng double hash).

## So sánh
| Thuật toán | Thời gian | Đặc điểm |
| :--- | :--- | :--- |
| Naive | O(n·m) | Đơn giản, m nhỏ |
| KMP | O(n+m) | Xác định, phức tạp |
| Z | O(n+m) | Gọn, tương đương KMP |
| Rabin-Karp | O(n+m) tb | Đa mẫu cùng lúc (cùng hash) |

## Bài tập tự luyện
1. Đếm xâu con phân biệt của chuỗi dùng Z hoặc hash.
2. Tìm mọi lần xuất hiện của **nhiều mẫu** cùng lúc (hash mọi mẫu vào set).
3. Kiểm tra hai xâu xoay vòng (rotation) của nhau.

## Tài liệu tham khảo
- GeeksforGeeks — *Z algorithm (Linear time pattern searching Algorithm)*, *Rabin-Karp*
- cp-algorithms.com — *Z-function*, *Rabin-Karp*
- CLRS 32.3: *String Matching with Finite Automata* (nền tảng)`,
        },
        {
          title: 'Manacher & Suffix Array: xử lý chuỗi cao cấp',
          sandboxType: 'dsa',
          xpReward: 45,
          contentMd: `# Manacher & Suffix Array: xử lý chuỗi cao cấp

## Mục tiêu bài học
- Cài đặt thuật toán Manacher — tìm mọi palindrome O(n).
- Hiểu Suffix Array và cách dùng LCP để đếm xâu con phân biệt.
- Biết Suffix Automaton tồn tại — công cụ mạnh cho vấn đề chuỗi.

## Manacher — palindrome O(n)
\`d2[i]\` (chẵn) / \`d1[i]\` (lẻ) = bán kính palindrome tâm i. Dùng bất biến \`[l, r]\` (palindrome xa nhất) để **sao chép** giá trị đối xứng rồi mở rộng:

\`\`\`js
function manacher(s) {
  const n = s.length;
  const d1 = new Array(n).fill(0); // lẻ: bán kính
  let l = 0, r = -1;
  for (let i = 0; i < n; i++) {
    d1[i] = i > r ? 1 : Math.min(d1[l + r - i], r - i + 1);
    while (i - d1[i] >= 0 && i + d1[i] < n && s[i - d1[i]] === s[i + d1[i]]) d1[i]++;
    if (i + d1[i] - 1 > r) { l = i - d1[i] + 1; r = i + d1[i] - 1; }
  }
  return d1;
}
\`\`\`
Mỗi ký tự được mở rộng tối đa 1 lần → **O(n)**. Ứng dụng: xâu con palindrome dài nhất, đếm palindrome con.

## Suffix Array
Mảng chứa các **hậu tố sắp xếp theo thứ tự từ điển**. Xây bằng prefix-doubling O(n log n) hoặc DC3 O(n). Kết hợp **LCP array** (độ dài tiền tố chung của hậu tố liền kề):

- Số **xâu con phân biệt** = n(n+1)/2 − Σ LCP[i].
- Tìm xâu con lặp dài nhất = max LCP.
- Tìm kiếm chuỗi con trong O(m log n).

## Suffix Automaton (nhắc tới)
DAWG nhận diện mọi chuỗi con — O(n) dựng, trả lời nhiều câu hỏi tần suất/lặp/khác nhau nhanh chóng.

## Bài tập tự luyện
1. Xâu con palindrome **dài nhất** của chuỗi dài 10⁶ ký tự.
2. Đếm xâu con phân biệt của chuỗi dùng suffix array + LCP.
3. Tìm xâu con lặp dài nhất (overlap hoặc không overlap).

## Tài liệu tham khảo
- GeeksforGeeks — *Manacher's Algorithm*, *Suffix Array*
- cp-algorithms.com — *Manacher's algorithm*, *Suffix Array*
- CLRS 32.4–32.5 (mở rộng)`,
        },
        {
          title: 'Rolling hash nâng cao & double hash an toàn',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# Rolling hash nâng cao & double hash an toàn

## Mục tiêu bài học
- Hiểu rủi ro trùng hash và cách giảm bằng **double hash**.
- Dùng prefix hash để so sánh hai chuỗi con bất kỳ trong O(1).
- Áp dụng hash vào bài toán nhận dạng chuỗi con lặp, anagram.

## Prefix hash
\`h[i]\` = hash của \`s[0..i]\`. Hash chuỗi con \`s[l..r]\` trong O(1):
\`hash(l, r) = (h[r] − h[l−1]·base^(r−l+1)) mod MOD\`.

\`\`\`js
const MOD1 = 10 ** 9 + 7, MOD2 = 10 ** 9 + 9, BASE = 91138233 % MOD1;

function prefixHashes(s, MOD) {
  const h = [0];
  for (const ch of s) h.push((h[h.length - 1] * BASE + ch.charCodeAt(0)) % MOD);
  return h;
}
function subHash(h, pow, l, r, MOD) { // l, r 0-based inclusive
  return (h[r + 1] - (h[l] * pow[r - l + 1] % MOD) + MOD) % MOD;
}
\`\`\`

## Double hash
Dùng 2 cặp (BASE, MOD) nguyên tố khác nhau; hai chuỗi chỉ coi là bằng nhau khi **cả hai hash** trùng. Xác suất trùng giảm về ~1/MOD₁·MOD₂ — thực tế vô cùng nhỏ.

## Ứng dụng nâng cao
- **Xâu con lặp dài nhất** (binary search độ dài + hash set).
- **So khớp mảng** (băm mảng số, hash cửa sổ trượt).
- Tìm **anagram** của mẫu trong văn bản (hash đa thức bất biến với hoán vị).
- Kiểm tra hai cây **đẳng cấu** (hash cây — dùng cho problems about trees).

## Lưu ý kỹ thuật
- Chọn BASE là số lẻ lớn, MOD nguyên tố > 10⁹ để tránh nhân tràn (dùng BigInt trong JS nếu cần).
- Precompute lũy thừa \`pow[i]\` để subHash O(1).
- Với mảng số âm: thêm offset, băm từng phần tử.

## Bài tập tự luyện
1. Tìm xâu con lặp dài nhất trong chuỗi 10⁵ ký tự (hash + binary search).
2. Đếm xâu con phân biệt có độ dài L trong O(n).
3. Kiểm tra hai chuỗi con bất kỳ có bằng nhau không — truy vấn O(1) sau tiền xử lý.

## Tài liệu tham khảo
- cp-algorithms.com — *String Hashing*
- GeeksforGeeks — *String hashing using Polynomial rolling hash function*
- Competitive Programming 3 — *Hashing*`,
        },
      ],
    },
    {
      title: 'Chương 5: Toán rời rạc, Bit Tricks & Kỹ thuật phỏng vấn',
      description:
        'Tư duy bit, toán học số học nhanh, kỹ thuật chuẩn bị phỏng vấn và tổng kết roadmap luyện tập.',
      lessons: [
        {
          title: 'Bit Manipulation: mask, XOR tricks, số học bit',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# Bit Manipulation: mask, XOR tricks, số học bit

## Mục tiêu bài học
- Thành thạo các phép bit cơ bản và mẹo phổ biến.
- Dùng XOR giải bài toán "số xuất hiện một lần".
- Biến các bài toán đếm/set thành thao tác bit tốc độ cao.

## Bảng phép bit
| Phép | Ký hiệu | Ví dụ |
| :--- | :--- | :--- |
| AND | \`&\` | \`6 & 3 = 2\` |
| OR | \`\\|\` | \`6 | 3 = 7\` |
| XOR | \`^\` | \`6 ^ 3 = 5\` |
| NOT | \`~\` | \`~0 = -1\` |
| Dịch trái | \`<<\` | \`1 << 4 = 16\` |
| Dịch phải | \`>>\` | \`16 >> 3 = 2\` |

## Mẹo kinh điển
- Kiểm tra bit i: \`(x >> i) & 1\`.
- Bật bit i: \`x | (1 << i)\`; tắt: \`x & ~(1 << i)\`.
- Đếm bit 1: \`x & (x − 1)\` bỏ bit 1 thấp nhất (Brian Kernighan, O(bits)).
- Kiểm tra **lũy thừa của 2**: \`x > 0 && (x & (x − 1)) === 0\`.
- Lấy bit thấp nhất: \`x & (−x)\` (LSB).

## XOR magic
- \`x ^ x = 0\`, \`x ^ 0 = x\` → số xuất hiện **một lần** = XOR toàn bộ mảng.
- Hoán đổi không biến tạm: \`a ^= b; b ^= a; a ^= b\`.
- Tìm bit khác nhau đầu tiên giữa hai số: \`a ^ b\`.

\`\`\`js
function singleNumber(nums) {
  return nums.reduce((acc, x) => acc ^ x, 0);
}
\`\`\`

## Ứng dụng thực tế
- **Tổng không dùng +**: carry = (a & b) << 1, a ^= b — lặp.
- Chia/trừ bằng dịch bit cho số lớn.
- Biểu diễn tập hợp bằng int 32-bit (bitmask) — kiểm tra 32 trạng thái nhanh.
- DP trên tập con (đã học ở chương 3).

## Bài tập tự luyện
1. Tìm số thiếu trong mảng [0..n] có n phần tử (XOR).
2. Tìm hai số xuất hiện một lần trong mảng toàn số trùng cặp.
3. Đếm số bit 1 của mọi số từ 0 tới n trong O(n) (DP bit).

## Tài liệu tham khảo
- GeeksforGeeks — *Bit Tricks for Competitive Programming*
- LeetCode — *Single Number*, *Number of 1 Bits*
- Hacker's Delight (W. Hacker) — tài liệu tham khảo sâu`,
        },
        {
          title: 'Số học: lũy thừa nhanh, GCD/EGCD, số nguyên tố',
          sandboxType: 'dsa',
          xpReward: 40,
          contentMd: `# Số học: lũy thừa nhanh, GCD/EGCD, số nguyên tố

## Mục tiêu bài học
- Cài đặt **binary exponentiation** O(log n).
- Hiểu Extended Euclidean — nghịch đảo modulo, giải phương trình Diofant.
- Sàng Eratosthenes & phân tích thừa số nguyên tố.

## Lũy thừa nhanh
\`a^b mod m\` trong O(log b):
\`\`\`js
function modPow(a, b, m) {
  let res = 1;
  a %= m;
  while (b > 0) {
    if (b & 1) res = res * a % m;
    a = a * a % m;
    b >>= 1;
  }
  return res;
}
\`\`\`
Ứng dụng: modulo nghịch đảo \`a^(m−2)\` (Fermat), mã hóa RSA, DP nhanh trên ma trận (Fibonacci trong O(log n) với ma trận [[1,1],[1,0]]^n).

## GCD & Extended GCD
\`\`\`js
function egcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = egcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}
// egcd tìm x,y: a*x + b*y = gcd(a,b)
\`\`\`
- Nghịch đảo modulo a⁻¹ mod m: tồn tại khi gcd(a,m)=1; x chính là a⁻¹.
- Phương trình Diofant \`ax + by = c\`: vô nghiệm nếu c % gcd ≠ 0.

## Sàng Eratosthenes
\`\`\`js
function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) for (let j = i * i; j <= n; j += i) isPrime[j] = false;
  }
  return isPrime;
}
\`\`\`
O(n log log n). Mở rộng: **SPF sieve** (smallest prime factor) để phân tích thừa số nhanh.

## Bài tập tự luyện
1. Fibonacci thứ n (n ≤ 10¹⁸) bằng nhân ma trận + modPow.
2. Tìm nghịch đảo modulo của 5 theo mod 7.
3. Đếm số nguyên tố trong [1, 10⁷] bằng sàng — đo thời gian.

## Tài liệu tham khảo
- GeeksforGeeks — *Modular Exponentiation*, *Sieve of Eratosthenes*
- cp-algorithms.com — *Binary Exponentiation*, *Extended Euclidean Algorithm*
- CLRS 31: *Number-Theoretic Algorithms*`,
        },
        {
          title: 'Kỹ thuật chia để trị nâng cao & phỏng vấn',
          sandboxType: 'dsa',
          xpReward: 35,
          contentMd: `# Kỹ thuật chia để trị nâng cao & phỏng vấn

## Mục tiêu bài học
- Nhận diện bài toán chia để trị và phân tích bằng định lý Master.
- Giải các bài kinh điển: đảo nghịch thế, closest pair, majority element.
- Chiến lược tiếp cận bài toán lạ trong phỏng vấn.

## Định lý Master
Với \`T(n) = aT(n/b) + f(n)\`:
- \`f(n) = O(n^(log_b a − ε))\` → \`T(n) = Θ(n^(log_b a))\`.
- \`f(n) = Θ(n^(log_b a))\` → \`T(n) = Θ(n^(log_b a) log n)\`.
- \`f(n) = Ω(n^(log_b a + ε))\` + điều kiện đều → \`T(n) = Θ(f(n))\`.

## Đếm nghịch thế (inversion count)
Trong bước merge của merge sort, đếm \`arr[i] > arr[j]\` với i bên trái, j bên phải: \`count += mid − i + 1\` — tận dụng phần đã sắp.

## Closest Pair of Points
Sắp xếp theo x, chia đôi; so sánh min hai nửa d; quét dải giữa rộng 2d (chỉ xét điểm có y chênh ≤ d — bị chặn bởi hằng số). Tổng **O(n log n)**.

## Majority Element
Chia để trị: tìm majority từng nửa, kiểm tra tổng tần suất — O(n log n). (Còn có Boyer-Moore O(n).)

## Quy trình phỏng vấn 5 bước
1. **Clarify**: input/output/giới hạn, dữ liệu lớn cỡ nào?
2. **Brute force** trước — đúng là quan trọng nhất.
3. **Tối ưu**: nhìn hint — đã sắp? lặp? cần duy trì trạng thái?
4. **Khô chạy** (dry run) ví dụ nhỏ bằng tay.
5. **Trình bày** độ phức tạp + kiểm thử biên (empty, 1 phần tử, cực trị).

## Bài tập tự luyện
1. Đếm nghịch thế của mảng bằng merge sort.
2. Tìm cặp điểm gần nhất trong 10⁵ điểm.
3. Tìm majority element trong 1 lần duyệt (Boyer-Moore) — so sánh với chia để trị.

## Tài liệu tham khảo
- GeeksforGeeks — *Divide and Conquer*, *Closest Pair of Points*
- CLRS Chapter 4: *Divide-and-Conquer*
- MIT 6.006 Lecture 3: *Divide & Conquer*`,
        },
        {
          title: 'Roadmap luyện tập & tổng kết khóa học',
          sandboxType: 'dsa',
          xpReward: 25,
          contentMd: `# Roadmap luyện tập & tổng kết khóa học

## Mục tiêu bài học
- Hệ thống lại toàn bộ kiến thức 3 khóa học.
- Xây lộ trình luyện tập 12 tuần hiệu quả.
- Biết các nguồn luyện tập uy tín và cách tự đánh giá.

## Tổng kết kiến thức
| Nhóm | Kỹ thuật đã học |
| :--- | :--- |
| Cấu trúc | Mảng, LL, Stack/Queue, Hash, Heap, Trie, DSU, B-Tree |
| Cây | BST, AVL, Red-Black, duyệt cây, trie |
| Đồ thị | BFS/DFS, Topo, Dijkstra, Bellman-Ford, Floyd, MST, SCC, Max Flow |
| Sắp xếp | Merge, Quick, Heap, Counting, Radix |
| Kỹ thuật | Two pointers, Sliding window, Binary search, Chia để trị |
| DP | 1D, 2D, Knapsack, Interval, Bitmask, Digit, CHT |
| Chuỗi | KMP, Z, Manacher, Rabin-Karp, Suffix Array |
| Số học | ModPow, EGCD, Sàng |

## Lộ trình 12 tuần
1. **Tuần 1–2**: Ôn lại khóa Beginner — làm lại mọi bài tập.
2. **Tuần 3–4**: Sắp xếp + hai con trỏ + sliding window (20 bài).
3. **Tuần 5–6**: Cây + BST/AVL (15 bài).
4. **Tuần 7–8**: Đồ thị BFS/DFS/Dijkstra (15 bài).
5. **Tuần 9–10**: DP 1D/2D/Knapsack (15 bài).
6. **Tuần 11–12**: Chuỗi + bit + tổng hợp (15 bài) — mock interview mỗi tuần.

## Nguyên tắc luyện tập
- **Chất lượng hơn số lượng**: 2 bài hiểu sâu hơn 10 bài chép.
- **Ghi chép sai lầm**: một notebook lỗi + cách sửa — xem lại tuần.
- **Không xem lời giải trước 30 phút** suy nghĩ độc lập.
- **Giải lại** bài cũ sau 1 tuần — kiểm tra trí nhớ dài hạn.

## Nguồn luyện tập
- LeetCode (đề phỏng vấn chuẩn ngành), HackerRank, Codeforces.
- GeeksforGeeks Practice, CSES Problem Set.
- Mock interview: Pramp, interviewing.io.

## Chúc mừng!
Bạn đã hoàn thành lộ trình 3 khóa: **Nhập môn → Nâng cao → Chuyên sâu**. Hãy giữ thói quen giải 1–2 bài mỗi ngày để duy trì phản xạ giải thuật.

## Tài liệu tham khảo
- GeeksforGeeks — *DSA Roadmap*
- MIT 6.006 — *Introduction to Algorithms* (toàn khóa)
- CLRS — *Introduction to Algorithms* (tài liệu gốc)`,
        },
      ],
    },
  ],
};
