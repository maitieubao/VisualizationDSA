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
    id: 'tree-graph-group',
    title: 'NHÓM CÂY & ĐỒ THỊ',
    children: [
      { id: 'tg-bst', title: 'Cây Nhị phân Tìm kiếm (BST)', path: '/docs/tree-graph/bst' },
      { id: 'tg-traversal', title: 'Duyệt cây (Pre/In/Post-order)', path: '/docs/tree-graph/tree-traversal' },
      { id: 'tg-bfs', title: 'Duyệt theo chiều rộng (BFS)', path: '/docs/tree-graph/bfs' },
      { id: 'tg-dfs', title: 'Duyệt theo chiều sâu (DFS)', path: '/docs/tree-graph/dfs' },
      { id: 'tg-dijkstra', title: 'Thuật toán Dijkstra', path: '/docs/tree-graph/dijkstra' },
      { id: 'tg-advanced', title: 'Cấu trúc Cây nâng cao', path: '/docs/tree-graph/advanced-trees' },
      { id: 'tg-summary', title: 'Tổng hợp ứng dụng Cây & Đồ thị', path: '/docs/tree-graph/tree-graph-summary' }
    ]
  },
  {
    id: 'oop-group',
    title: 'Lập trình Hướng đối tượng (OOP)',
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
    title: 'Nguyên lý SOLID',
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
    title: 'Mẫu thiết kế (Design Patterns)',
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
    title: 'Dependency Injection (DI)',
    children: [
      { id: 'di-basics', title: 'Cơ bản về DI & IoC', path: '/docs/di/basics' },
      { id: 'di-lifecycles', title: 'Vòng đời (Lifecycles)', path: '/docs/di/lifecycles' },
      { id: 'di-advanced', title: 'Các mẫu nâng cao', path: '/docs/di/advanced' },
      { id: 'di-keyed', title: 'Keyed Services (.NET 8)', path: '/docs/di/keyed-services' }
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

// Helper để tìm next/prev navigation
export function getNextPrevDocs(currentPath: string): { 
  prev: { path: string; title: string } | null;
  next: { path: string; title: string } | null;
} {
  const flatNav: { path: string; title: string }[] = [];
  
  // Hàm đệ quy làm phẳng cây menu
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
