# 📐 Kế Hoạch Phát Triển: Trực Quan Hóa Đồ Thị, Cây & Tìm Kiếm (Graph, Tree & Search Visualization)

## 🎯 Mục Tiêu Tổng Quát
Xây dựng hệ thống trực quan hóa **đồ thị (Graph)**, **cây (Tree)** và **tìm kiếm (Search)** có:
- **Animation mượt mà 60 FPS** với Lerp/Spring physics
- **UX/UI sạch đẹp, responsive** không bị lộn xộn
- **Layout thông minh** tách biệt Canvas (70%) - Sidebar Controls (30%)
- **Backend FrameDTO mở rộng** hỗ trợ graph edges, distances, queue/stack state

---

## 📋 Phân Tích Trạng Thái Hiện Tại (Current State Analysis)

### ✅ Đã Có (Working)
| Component | Status | Notes |
|-----------|--------|-------|
| Backend Strategies | ✅ 10 algorithms | Bubble, Quick, Merge, Heap, Radix, Counting, Bucket, Linear, Binary, Stack, Queue, Monotonic Stack, BST, BFS, DFS, Dijkstra |
| Frontend Catalog | ✅ 22 algorithms | Sorting (7), Searching (3), Stack-Queue (3), Tree (1), Graph (8) |
| TreeRenderer | ⚠️ Basic | Chỉ vẽ BST tĩnh, layout đơn giản, không animation |
| BoxArrayRenderer | ✅ Good | Có Lerp animation cho Binary Search |
| BarChartRenderer | ✅ Good | Cho Sorting |
| TubeRenderer | ✅ Good | Cho Stack/Queue |
| Layout DSAPlayer | ⚠️ Rigid | 65/35 split cứng, không responsive, theory panel chồng chéo |

### ❌ Thiếu / Cần Cải Thiện (Critical Gaps)
| Area | Missing |
|------|---------|
| **Graph Visualization** | Không có GraphRenderer - BFS/DFS/Dijkstra đang dùng TreeRenderer (sai ngữ cảnh) |
| **Tree Algorithms** | Chỉ có BST insert/search. Thiếu: AVL rotations, Red-Black, Heapify, Tree Traversals |
| **Search Algorithms** | Linear/Binary search cơ bản, thiếu: Interpolation Search, Exponential Search, Ternary Search |
| **FrameDTO** | Thiếu `graphEdges`, `adjacencyList`, `distances`, `queueState`, `stackState`, `path` |
| **Animation** | Không có spring physics cho graph nodes, không có staggered animation |
| **Layout** | Cần sidebar controls (speed, layout algorithm, highlight mode), responsive breakpoints |
| **UX** | Không có legend, tooltip, mini-map cho graph lớn, keyboard shortcuts chưa đầy đủ |

---

## 🏗️ Kiến Trúc Mới (Proposed Architecture)

### 1. Mở Rộng Type System (Frontend + Backend Sync)

```typescript
// frontend/src/features/dsa-modules/types/algorithm.types.ts (MỚI)
export interface GraphNodeDTO {
  id: number;
  value: number;
  x: number;
  y: number;
  label?: string;           // e.g., "A", "B", or "dist: 5"
}

export interface GraphEdgeDTO {
  from: number;
  to: number;
  weight?: number;
  directed?: boolean;
  highlighted?: boolean;    // current edge being relaxed
  inMST?: boolean;          // for Kruskal/Prim
}

export interface GraphFrameDTO extends FrameDTO {
  // Graph-specific state
  graphNodes?: GraphNodeDTO[];
  graphEdges?: GraphEdgeDTO[];
  distances?: Record<number, number>;     // Dijkstra distances
  predecessors?: Record<number, number>;  // path reconstruction
  queueState?: number[];                  // BFS/DFS queue/stack
  visitedSet?: number[];                  // visited nodes
  currentPath?: number[];                 // A* current path
  openSet?: number[];                     // A* open set
  closedSet?: number[];                   // A* closed set
  
  // Tree-specific (AVL, Red-Black)
  rotationInfo?: { type: 'LL'|'LR'|'RL'|'RR'; nodeId: number };
  balanceFactors?: Record<number, number>;
  
  // Heap
  heapArray?: number[];                   // array representation
  heapSize?: number;
}

// Backend: VisualizationDSA.Domain.Engine.FrameDTO (MỞ RỘNG)
public class FrameDTO {
    // ... existing fields
    public List<GraphNodeDTO>? GraphNodes { get; set; }
    public List<GraphEdgeDTO>? GraphEdges { get; set; }
    public Dictionary<int, int>? Distances { get; set; }
    public Dictionary<int, int>? Predecessors { get; set; }
    public List<int>? QueueState { get; set; }
    public List<int>? VisitedSet { get; set; }
    public List<int>? CurrentPath { get; set; }
    public Dictionary<int, int>? BalanceFactors { get; set; }
    public string? RotationInfo { get; set; }
    public int[]? HeapArray { get; set; }
    public int? HeapSize { get; set; }
}
```

### 2. Renderer Architecture (Strategy Pattern)

```
RendererFactory (by algorithm category)
├── BarChartRenderer          → Sorting (7 algos)
├── BoxArrayRenderer          → Searching (3 algos)  
├── TreeRenderer              → BST, AVL, Heap
├── GraphRenderer             → BFS, DFS, Dijkstra, Bellman-Ford, A*, MST
├── TubeRenderer              → Stack, Queue, Monotonic Stack
└── HeapRenderer              → Heap Sort, Heapify (array-based tree)
```

### 3. Layout System (Responsive)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Algorithm Selector + Speed + Layout Options        │
├─────────────────────────────────────────────────────────────┤
│  Sidebar (30%)          │  Canvas (70%)                     │
│  ┌──────────────────┐   │  ┌────────────────────────────┐  │
│  │ Controls         │   │  │                            │  │
│  │ - Layout Algo    │   │  │      GraphRenderer /       │  │
│  │ - Highlight Mode │   │  │      TreeRenderer /        │  │
│  │ - Show:          │   │  │      BoxArrayRenderer      │  │
│  │   • Distances    │   │  │                            │  │
│  │   • Queue/Stack  │   │  │                            │  │
│  │   • Edge Weights │   │  │                            │  │
│  │   • Balance Fact.│   │  │                            │  │
│  ├──────────────────┤   │  ├────────────────────────────┤  │
│  │ Pseudocode       │   │  │ Legend + Mini-map          │  │
│  │ (highlighted)    │   │  │ (Graph only)               │  │
│  ├──────────────────┤   │  ├────────────────────────────┤  │
│  │ Input Form       │   │  │ VCR Controls (bottom)      │  │
│  └──────────────────┘   │  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Breakpoints:**
- `< 1024px`: Stack vertically (Canvas full width, Sidebar collapsible drawer)
- `1024px - 1440px`: Sidebar 35%, Canvas 65%
- `> 1440px`: Sidebar 30%, Canvas 70% + Theory panel optional

---

## 📦 Sprint Breakdown (4 Sprints = 8 Tuần)

### Sprint 1: Foundation & Graph Core (Tuần 1-2)
**Goal**: Xây dựng GraphRenderer, mở rộng FrameDTO, backend support

| Task | Owner | Deliverable |
|------|-------|-------------|
| BE-1.1: Mở rộng FrameDTO + GraphNodeDTO/GraphEdgeDTO | Backend | `FrameDTO.cs` mới |
| BE-1.2: Cập nhật BFSStrategy/DFSStrategy sinh graph frames | Backend | QueueState, VisitedSet, GraphEdges |
| BE-1.3: Cập nhật DijkstraStrategy sinh distances + path | Backend | Distances, Predecessors, Edge relaxation highlights |
| BE-1.4: Thêm BellmanFord, Kruskal, Prim, A* strategies | Backend | 4 strategies mới |
| FE-1.1: Tạo GraphRenderer.vue (Canvas + Force-directed layout) | Frontend | Component base |
| FE-1.2: Implement force-directed layout (D3-force style) | Frontend | `useGraphLayout.ts` composable |
| FE-1.3: Graph node animation (spring physics) | Frontend | Smooth enter/exit/move |
| FE-1.4: Edge rendering với weight labels, directed arrows | Frontend | `drawEdge` nâng cấp |
| FE-1.5: Legend component (Visited/Queue/Current/Path colors) | Frontend | Reusable Legend.vue |
| **Test**: Unit tests cho GraphRenderer, layout engine | QA | 30+ tests |

### Sprint 2: Tree Algorithms & Advanced Renderers (Tuần 3-4)
**Goal**: AVL, Red-Black, Heap, Tree Traversals

| Task | Owner | Deliverable |
|------|-------|-------------|
| BE-2.1: AVLStrategy (insert + rotations LL/LR/RL/RR) | Backend | Rotation frames, balance factors |
| BE-2.2: RedBlackStrategy (insert + fixup) | Backend | Color flips, rotations |
| BE-2.3: HeapStrategy (heapify, insert, extract-max) | Backend | Array + tree dual view |
| BE-2.4: TreeTraversalStrategy (In/Pre/Post-order) | Backend | Recursive stack frames |
| FE-2.1: TreeRenderer v2 - Reingold-Tilford layout | Frontend | Better spacing, no overlap |
| FE-2.2: Animation cho rotations (LL/LR/RL/RR) | Frontend | Smooth subtree rotation |
| FE-2.3: HeapRenderer (array + tree sync view) | Frontend | Dual visualization |
| FE-2.4: TreeTraversalRenderer (recursion stack viz) | Frontend | Call stack animation |
| FE-2.5: Balance factor badges on AVL/Red-Black nodes | Frontend | Visual indicators |
| **Test**: Integration tests tree algorithms | QA | 40+ tests |

### Sprint 3: Search Algorithms & Layout Polish (Tuần 5-6)
**Goal**: Complete Search algorithms, responsive layout, UX polish

| Task | Owner | Deliverable |
|------|-------|-------------|
| BE-3.1: InterpolationSearch, ExponentialSearch, TernarySearch | Backend | 3 strategies mới |
| BE-3.2: Jump Search, Fibonacci Search | Backend | 2 strategies mới |
| FE-3.1: BoxArrayRenderer v2 - interpolated search visualization | Frontend | Probe positions animation |
| FE-3.2: Search complexity comparison panel | Frontend | Side-by-side Big-O |
| FE-3.3: Responsive DSAPlayer layout (CSS Grid + breakpoints) | Frontend | Mobile-friendly |
| FE-3.4: Collapsible sidebar drawer (< 1024px) | Frontend | Touch-friendly |
| FE-3.5: Keyboard shortcuts panel (?) | Frontend | Help overlay |
| FE-3.6: Mini-map cho GraphRenderer (> 20 nodes) | Frontend | Navigation aid |
| FE-3.7: Tooltip trên hover node/edge (show distance, weight) | Frontend | Rich hover info |
| **Test**: E2E tests critical paths | QA | Playwright tests |

### Sprint 4: Polish, Performance & Documentation (Tuần 7-8)
**Goal**: Production-ready, documented, performant

| Task | Owner | Deliverable |
|------|-------|-------------|
| FE-4.1: Web Worker cho force-directed layout (off-main-thread) | Frontend | 60 FPS guaranteed |
| FE-4.2: Virtualized rendering (large graphs > 100 nodes) | Frontend | Viewport culling |
| FE-4.3: Animation performance profiling + optimization | Frontend | < 16ms/frame |
| FE-4.4: Theme-aware colors (CSS variables only, no hardcode) | Frontend | Consistent theming |
| FE-4.5: Export SVG/PNG cho Graph/Tree | Frontend | Share feature |
| FE-4.6: Accessibility (ARIA labels, focus management) | Frontend | WCAG AA |
| DOC-4.1: Algorithm visualization guide (per algorithm) | Docs | Markdown per algo |
| DOC-4.2: Architecture decision records (ADR) for renderers | Docs | ADR-XX |
| **Test**: Full regression suite | QA | 100% pass |

---

## 🎨 Chi Tiết Kỹ Thuật Mỗi Renderer

### 1. GraphRenderer.vue (MỚI - QUAN TRỌNG NHẤT)

```vue
<!-- Features -->
<script setup lang="ts">
// Props
interface Props {
  frame: GraphFrameDTO | null;
  options: {
    layout: 'force' | 'hierarchical' | 'circular' | 'grid';
    showDistances: boolean;
    showQueue: boolean;
    showEdgeWeights: boolean;
    highlightMode: 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'mst';
  };
}

// State
const nodePositions = ref<Map<number, {x, y, vx, vy}>>(new Map());
const simulation = useGraphSimulation(); // Web Worker

// Spring physics cho smooth animation
function updatePositions(deltaTime: number) {
  // Coulomb repulsion + Hooke attraction + damping
  // Chạy trong Web Worker, chỉ gửi positions về main thread
}

// Render loop (requestAnimationFrame)
function render() {
  // 1. Clear canvas
  // 2. Draw edges (with weights, highlighted path)
  // 3. Draw nodes (with status colors: visited/queue/current/path)
  // 4. Draw distance labels (Dijkstra/A*)
  // 5. Draw queue/stack overlay (BFS/DFS)
  // 6. Draw legend
}
</script>
```

**Layout Algorithms:**
- **Force-directed** (default): D3-style simulation, good for general graphs
- **Hierarchical** (Sugiyama): For trees, DAGs, MST
- **Circular**: For small graphs, cycle detection
- **Grid**: For matrix-like graphs

**Color Coding (CSS Variables):**
```css
:root {
  --graph-node-default: #334155;      /* Slate */
  --graph-node-visited: #059669;      /* Emerald */
  --graph-node-queue: #0891b2;        /* Cyan */
  --graph-node-current: #f59e0b;      /* Amber */
  --graph-node-path: #6366f1;         /* Indigo */
  --graph-node-start: #22c55e;        /* Green */
  --graph-node-target: #ef4444;       /* Red */
  --graph-edge-default: #475569;
  --graph-edge-highlighted: #f59e0b;
  --graph-edge-mst: #a855f7;          /* Purple */
}
```

### 2. TreeRenderer v2 (Nâng Cấp)

**Layout:** Reingold-Tilford (tidy tree) - O(n) optimal spacing
```typescript
// treeLayout.ts
interface TreeNode { id, value, left?, right?, x?, y?, mod?, thread? }

function buchheim(root: TreeNode): void {
  // First walk: compute preliminary x positions
  // Second walk: apply modifiers, center subtrees
  // Third walk: finalize positions
}
```

**Animations:**
- Node insert: fade in + slide from parent
- Rotation (AVL): subtree rotate around pivot with spring
- Color transition: default → active → visited (Lerp 300ms)

### 3. HeapRenderer (MỚI)

**Dual View:** Array representation (horizontal bars) + Tree representation (complete binary tree)
```vue
<!-- Sync highlighting: click array index → highlight tree node and vice versa -->
<div class="grid grid-cols-2 gap-4">
  <ArrayView :heapArray="heapArray" :highlighted="[currentIndex, parentIndex]" />
  <TreeView :heapArray="heapArray" :heapSize="heapSize" />
</div>
```

### 4. BoxArrayRenderer v2 (Search Algorithms)

**Enhancements:**
- Probe animation: "laser" beam from low/high to mid
- Found: pulse green + confetti
- Not found: shake red
- Complexity badge: O(log N), O(N), etc.

---

## 🔧 Backend Implementation Details

### FrameDTO Extensions (C#)

```csharp
// VisualizationDSA.Domain.Engine/GraphFrameDTO.cs
public class GraphFrameDTO : FrameDTO
{
    public List<GraphNodeDTO>? GraphNodes { get; set; }
    public List<GraphEdgeDTO>? GraphEdges { get; set; }
    public Dictionary<int, int>? Distances { get; set; }       // Dijkstra
    public Dictionary<int, int>? Predecessors { get; set; }    // Path reconstruction
    public List<int>? QueueState { get; set; }                 // BFS/DFS
    public List<int>? VisitedSet { get; set; }
    public List<int>? CurrentPath { get; set; }                // A*
    public List<int>? OpenSet { get; set; }
    public List<int>? ClosedSet { get; set; }
    public Dictionary<int, int>? BalanceFactors { get; set; }  // AVL/RB
    public string? RotationInfo { get; set; }                  // "LL", "LR", etc.
    public int[]? HeapArray { get; set; }                      // Heap
    public int? HeapSize { get; set; }
}

public class GraphNodeDTO
{
    public int Id { get; set; }
    public int Value { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public string? Label { get; set; }
}

public class GraphEdgeDTO
{
    public int From { get; set; }
    public int To { get; set; }
    public int? Weight { get; set; }
    public bool Directed { get; set; } = false;
    public bool Highlighted { get; set; } = false;
    public bool InMST { get; set; } = false;
}
```

### Strategy Implementation Pattern

```csharp
// Base class helper methods
protected FrameDTO CreateGraphFrame(
    int stepId, 
    int activeLine, 
    string explanation,
    int[] dataState,
    HighlightIndices highlights,
    List<GraphNodeDTO> nodes,
    List<GraphEdgeDTO> edges,
    Dictionary<int, int>? distances = null,
    List<int>? queueState = null,
    List<int>? visitedSet = null)
{
    return new GraphFrameDTO {
        StepId = stepId,
        ActiveLine = activeLine,
        Explanation = explanation,
        DataState = dataState,
        Highlights = highlights,
        GraphNodes = nodes,
        GraphEdges = edges,
        Distances = distances,
        QueueState = queueState,
        VisitedSet = visitedSet
    };
}
```

---

## 📐 Layout & UX Specifications

### Responsive Breakpoints

```scss
// styles/layout.scss
$breakpoint-sm: 640px;
$breakpoint-md: 1024px;
$breakpoint-lg: 1440px;
$breakpoint-xl: 1920px;

.dsa-player {
  display: grid;
  grid-template-rows: auto 1fr auto;  // Header, Content, Controls
  grid-template-columns: 1fr;
  height: 100vh;
  gap: 1rem;
  padding: 1rem;

  @media (min-width: #{$breakpoint-md}) {
    grid-template-columns: 320px 1fr;  // Sidebar + Canvas
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
      "header header"
      "sidebar canvas"
      "controls controls";
  }

  @media (min-width: #{$breakpoint-xl}) {
    grid-template-columns: 380px 1fr;
  }
}

.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  
  @media (max-width: #{$breakpoint-md}) {
    position: fixed;
    right: 0; top: 0; bottom: 0;
    width: 320px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 50;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-subtle);
    &.open { transform: translateX(0); }
  }
}

.canvas-area {
  grid-area: canvas;
  min-height: 0;  // Critical for flex child scrolling
  position: relative;
}

.controls {
  grid-area: controls;
}
```

### Sidebar Components (Priority Order)

1. **Algorithm Info Card** - Name, complexity, description (collapsible)
2. **Visualization Controls** 
   - Layout selector (Force/Hierarchical/Circular) - Graph only
   - Speed slider (0.25x - 4x)
   - Highlight toggles (Distances, Queue, Edge Weights, Path)
3. **Pseudocode Viewer** - Synced highlighting, click-to-seek
4. **Input Form** - Smart defaults per algorithm
5. **Legend** - Color coding reference (always visible on graph)

### Canvas Overlay Elements

```
┌─────────────────────────────────────────┐
│  [Algorithm Name]    Step 5/23    2.0x  │  ← HUD (top-left)
│  Explanation text here...               │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         GRAPH / TREE CANVAS             │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ◄◄  ⏸  ►►  ►►  [████████░░]  45%      │  ← VCR Controls (bottom)
└─────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria (Definition of Done)

### Per Algorithm
- [ ] Backend strategy generates valid FrameDTO with all required fields
- [ ] Frontend renderer displays correctly on 1366px, 1920px, 390px (mobile)
- [ ] Animation: 60 FPS, no jank (Chrome DevTools Performance)
- [ ] Step-forward/backward works correctly
- [ ] Scrubber seeks to exact frame
- [ ] Pseudocode highlights sync with animation
- [ ] Keyboard shortcuts work (Space, ←/→, Shift+←/→, R)
- [ ] Legend visible and accurate
- [ ] Tooltip on hover shows relevant info (distance, weight, balance factor)
- [ ] Unit tests: ≥ 10 tests per algorithm (renderer + store)
- [ ] Integration test: full playback from API

### Layout & UX
- [ ] Sidebar collapses to drawer on mobile (< 1024px)
- [ ] Canvas maintains aspect ratio, no overflow
- [ ] No horizontal scroll on any breakpoint
- [ ] Theme switch (Light/Dark) updates all renderers instantly
- [ ] Reduced motion preference respected (prefers-reduced-motion)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces frame changes (live region)

---

## 📊 Metrics & Monitoring

| Metric | Target | Tool |
|--------|--------|------|
| Frame time (P95) | < 16ms | Chrome Performance |
| Bundle size (dsa-modules) | < 150KB gzipped | Vite bundle analyzer |
| Test coverage | > 90% | Vitest --coverage |
| Lighthouse Performance | > 90 | CI |
| Accessibility score | 100 | axe-core |

---

## 🚀 Quick Wins (Có Thể Làm Ngay Tuần Này)

1. **Fix Layout**: Chuyển DSAPlayer sang CSS Grid responsive
2. **GraphRenderer Stub**: Tạo component rỗng, replace TreeRenderer cho BFS/DFS/Dijkstra
3. **Legend Component**: Tạo Legend.vue dùng chung
4. **FrameDTO Types**: Cập nhật TypeScript interfaces
5. **CSS Variables**: Chuẩn hóa màu graph/node/tree trong `:root`

---

## 📝 Ghi Chú Triển Khai

### Thứ Tự Ưu Tiên (Priority Order)
1. **GraphRenderer** - Blocking cho 8 graph algorithms
2. **TreeRenderer v2** - Cần cho AVL/Red-Black/Heap
3. **Responsive Layout** - UX foundation
4. **Backend FrameDTO** - Unblock frontend
5. **Search Algorithms** - Lower priority (already partially working)

### Dependencies
- GraphRenderer cần `useGraphSimulation` composable (Web Worker)
- TreeRenderer v2 cần `treeLayout.ts` (pure TS, no Vue)
- Backend phải deploy trước khi frontend test integration

### Risk Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Force-directed layout jank | High | High | Web Worker + requestIdleCallback |
| Large graph (>100 nodes) OOM | Medium | High | Viewport culling + level-of-detail |
| Rotation animation complexity | Medium | Medium | Start with simple Lerp, upgrade to Spring |
| Mobile layout regression | High | Medium | Test on real devices weekly |

---

## 📚 Tài Liệu Tham Khảo

1. **Reingold-Tilford Algorithm**: "Tidier Drawings of Trees" (1981)
2. **D3 Force Simulation**: https://github.com/d3/d3-force
3. **Graph Drawing**: "Handbook of Graph Drawing and Visualization" (Tamassia)
4. **Spring Physics**: "Real-Time Animation of Cloth" (Baraff & Witkin)
5. **Vue 3 Composables**: https://vuejs.org/guide/reusability/composables.html

---

*Document Version: 1.0*  
*Created: 2026-07-29*  
*Status: READY FOR SPRINT PLANNING*