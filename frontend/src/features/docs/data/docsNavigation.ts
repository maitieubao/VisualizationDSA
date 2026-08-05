import type { NavItem } from '../types/docs.types';

export const docsNavigation: NavItem[] = [
  {
    id: 'intro-group',
    title: 'GIỚI THIỆU & NỀN TẢNG',
    children: [
      { id: 'intro', title: 'Giới thiệu & Hướng dẫn', path: '/docs/intro/intro' },
      { id: 'intro-big-o', title: 'Độ phức tạp & Ký hiệu O lớn', path: '/docs/intro/big-o' },
      { id: 'intro-memory', title: 'Bộ nhớ & Luồng thực thi', path: '/docs/intro/memory' }
    ]
  },
  {
    id: 'sorting-group',
    title: 'NHÓM SẮP XẾP',
    children: [
      { id: 'sort-selection', title: 'Sắp xếp Chọn (Selection Sort)', path: '/docs/sorting/selection-sort' },
      { id: 'sort-insertion', title: 'Sắp xếp Chèn (Insertion Sort)', path: '/docs/sorting/insertion-sort' },
      { id: 'sort-bubble', title: 'Sắp xếp Nổi bọt (Bubble Sort)', path: '/docs/sorting/bubble-sort' },
      { id: 'sort-quick', title: 'Sắp xếp Nhanh (Quick Sort)', path: '/docs/sorting/quick-sort' },
      { id: 'sort-merge', title: 'Sắp xếp Trộn (Merge Sort)', path: '/docs/sorting/merge-sort' },
      { id: 'sort-heap', title: 'Sắp xếp Đống (Heap Sort)', path: '/docs/sorting/heap-sort' },
      { id: 'sort-radix', title: 'Sắp xếp Cơ số (Radix Sort)', path: '/docs/sorting/radix-sort' },
      { id: 'sort-counting', title: 'Sắp xếp Đếm (Counting Sort)', path: '/docs/sorting/counting-sort' },
      { id: 'sort-bucket', title: 'Sắp xếp theo Xô (Bucket Sort)', path: '/docs/sorting/bucket-sort' },
      { id: 'sort-summary', title: 'Tổng hợp thuật toán Sắp xếp', path: '/docs/sorting/sorting-summary' }
    ]
  },
  {
    id: 'searching-group',
    title: 'NHÓM TÌM KIẾM',
    children: [
      { id: 'search-linear', title: 'Tìm kiếm Tuần tự (Linear Search)', path: '/docs/searching/linear-search' },
      { id: 'search-binary', title: 'Tìm kiếm Nhị phân (Binary Search)', path: '/docs/searching/binary-search' },
      { id: 'search-two-pointers', title: 'Kỹ thuật Hai con trỏ (Two Pointers)', path: '/docs/searching/two-pointers' },
      { id: 'search-sliding-window', title: 'Kỹ thuật Cửa sổ trượt (Sliding Window)', path: '/docs/searching/sliding-window' },
      { id: 'search-summary', title: 'Tổng hợp ứng dụng Tìm kiếm', path: '/docs/searching/searching-summary' }
    ]
  },
  {
    id: 'stack-queue-group',
    title: 'CẤU TRÚC TUYẾN TÍNH',
    children: [
      { id: 'sq-stack', title: 'Ngăn xếp (Stack)', path: '/docs/stack-queue/stack' },
      { id: 'sq-queue', title: 'Hàng đợi (Queue)', path: '/docs/stack-queue/queue' },
      { id: 'sq-monotonic', title: 'Ngăn xếp đơn điệu (Monotonic Stack)', path: '/docs/stack-queue/monotonic-stack' },
      { id: 'sq-deque', title: 'Hàng đợi hai đầu (Deque)', path: '/docs/stack-queue/deque' },
      { id: 'sq-summary', title: 'Tổng hợp ứng dụng Stack & Queue', path: '/docs/stack-queue/stack-queue-summary' }
    ]
  },
  {
    id: 'linked-list-group',
    title: 'NHÓM DANH SÁCH LIÊN KẾT',
    children: [
      { id: 'll-basics', title: 'Khái niệm & Phân loại', path: '/docs/linked-list/linked-list-basics' },
      { id: 'll-operations', title: 'Thao tác cơ bản', path: '/docs/linked-list/linked-list-operations' }
    ]
  },
  {
    id: 'hash-table-group',
    title: 'NHÓM BẢNG BĂM',
    children: [
      { id: 'ht-theory', title: 'Lý thuyết Bảng Băm', path: '/docs/hash-table/hash-table-theory' },
      { id: 'ht-csharp', title: 'Dictionary & HashSet trong C#', path: '/docs/hash-table/csharp-hash-collections' }
    ]
  },
  {
    id: 'tree-graph-group',
    title: 'NHÓM CÂY & ĐỒ THỊ',
    children: [
      { id: 'tg-bst', title: 'Cây Nhị phân Tìm kiếm (BST)', path: '/docs/tree-graph/bst' },
      { id: 'tg-avl', title: 'Cây AVL tự cân bằng', path: '/docs/tree-graph/avl-tree' },
      { id: 'tg-traversal', title: 'Duyệt cây (Pre/In/Post-order)', path: '/docs/tree-graph/tree-traversal' },
      { id: 'tg-bfs', title: 'Duyệt theo chiều rộng (BFS)', path: '/docs/tree-graph/bfs' },
      { id: 'tg-dfs', title: 'Duyệt theo chiều sâu (DFS)', path: '/docs/tree-graph/dfs' },
      { id: 'tg-cycle', title: 'Phát hiện chu trình (Cycle Detection)', path: '/docs/tree-graph/cycle-detection' },
      { id: 'tg-dijkstra', title: 'Thuật toán Dijkstra', path: '/docs/tree-graph/dijkstra' },
      { id: 'tg-advanced', title: 'Cấu trúc Cây nâng cao', path: '/docs/tree-graph/advanced-trees' },
      { id: 'tg-summary', title: 'Tổng hợp ứng dụng Cây & Đồ thị', path: '/docs/tree-graph/tree-graph-summary' }
    ]
  },
  {
    id: 'trees-group',
    title: 'CẤU TRÚC CÂY NÂNG CAO',
    children: [
      { id: 'tr-heap', title: 'Heap & Priority Queue', path: '/docs/trees/heap-priority-queue' },
      { id: 'tr-trie', title: 'Trie (Cây tiền tố)', path: '/docs/trees/trie-prefix-tree' },
      { id: 'tr-segment', title: 'Segment Tree (Cây đoạn)', path: '/docs/trees/segment-tree' },
      { id: 'tr-fenwick', title: 'Fenwick Tree (BIT)', path: '/docs/trees/fenwick-tree' },
      { id: 'tr-union-find', title: 'Union-Find (Disjoint Set)', path: '/docs/trees/union-find' }
    ]
  },
  {
    id: 'oop-group',
    title: 'LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)',
    children: [
      { id: 'oop-encapsulation', title: 'Tính Đóng gói', path: '/docs/oop/encapsulation' },
      { id: 'oop-inheritance', title: 'Tính Kế thừa', path: '/docs/oop/inheritance' },
      { id: 'oop-polymorphism', title: 'Tính Đa hình', path: '/docs/oop/polymorphism' },
      { id: 'oop-abstraction', title: 'Tính Trừu tượng', path: '/docs/oop/abstraction' },
      { id: 'oop-interface', title: 'Interface', path: '/docs/oop/interface' }
    ]
  },
  {
    id: 'solid-group',
    title: 'NGUYÊN LÝ SOLID',
    children: [
      { id: 'solid-srp', title: 'Single Responsibility', path: '/docs/solid/srp' },
      { id: 'solid-ocp', title: 'Open-Closed', path: '/docs/solid/ocp' },
      { id: 'solid-lsp', title: 'Liskov Substitution', path: '/docs/solid/lsp' },
      { id: 'solid-isp', title: 'Interface Segregation', path: '/docs/solid/isp' },
      { id: 'solid-dip', title: 'Dependency Inversion', path: '/docs/solid/dip' }
    ]
  },
  {
    id: 'patterns-group',
    title: 'MẪU THIẾT KẾ (DESIGN PATTERNS)',
    children: [
      { id: 'dp-singleton', title: 'Singleton Pattern', path: '/docs/patterns/singleton' },
      { id: 'dp-factory', title: 'Factory Method', path: '/docs/patterns/factory' },
      { id: 'dp-observer', title: 'Observer Pattern', path: '/docs/patterns/observer' },
      { id: 'dp-strategy', title: 'Strategy Pattern', path: '/docs/patterns/strategy' },
      { id: 'dp-decorator', title: 'Decorator Pattern', path: '/docs/patterns/decorator' }
    ]
  },
  {
    id: 'di-group',
    title: 'DEPENDENCY INJECTION (DI)',
    children: [
      { id: 'di-basics', title: 'Cơ bản về DI & IoC', path: '/docs/di/basics' },
      { id: 'di-lifecycles', title: 'Vòng đời (Lifecycles)', path: '/docs/di/lifecycles' },
      { id: 'di-advanced', title: 'Các mẫu nâng cao', path: '/docs/di/advanced' },
      { id: 'di-keyed', title: 'Keyed Services (.NET 8)', path: '/docs/di/keyed-services' }
    ]
  },
  {
    id: 'system-design-group',
    title: 'THIẾT KẾ HỆ THỐNG',
    children: [
      { id: 'sd-intro', title: 'Giới thiệu Thiết kế Hệ thống', path: '/docs/system-design/system-design-intro' },
      { id: 'sd-lb', title: 'Load Balancer & Round-Robin', path: '/docs/system-design/load-balancer' },
      { id: 'sd-health', title: 'Server Health & Failover', path: '/docs/system-design/server-health' },
      { id: 'sd-packet', title: 'Network Packet Routing', path: '/docs/system-design/packet-routing' },
      { id: 'sd-replication', title: 'Database Replication & Lag', path: '/docs/system-design/replication-lag' },
      { id: 'sd-failure', title: 'Failure Handling & Smoke', path: '/docs/system-design/failure-handling' }
    ]
  },
  {
    id: 'practice-group',
    title: 'THỰC HÀNH & TỔNG KẾT',
    children: [
      { id: 'pr-leetcode', title: 'Giải mẫu LeetCode', path: '/docs/practice/leetcode-examples' },
      { id: 'pr-roadmap', title: 'Lộ trình tiếp theo', path: '/docs/practice/final-roadmap' }
    ]
  }
];


export function getNextPrevDocs(currentPath: string): { 
  prev: { path: string; title: string } | null;
  next: { path: string; title: string } | null;
} {
  const flatNav: { path: string; title: string }[] = [];
  
  
  const flatten = (items: NavItem[]) => {
    items.forEach(item => {
      if (item.path) {
        flatNav.push({ path: item.path, title: item.title });
      }
      if (item.children) {
        flatten(item.children);
      }
    });
  };
  
  flatten(docsNavigation);

  const currentIndex = flatNav.findIndex(nav => nav.path === currentPath);
  if (currentIndex === -1) return { prev: null, next: null };

  return {
    prev: currentIndex > 0 ? flatNav[currentIndex - 1] : null,
    next: currentIndex < flatNav.length - 1 ? flatNav[currentIndex + 1] : null
  };
}
