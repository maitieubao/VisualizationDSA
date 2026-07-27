import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

export const visualizerMap: Record<string, Component> = {
  // Sắp xếp
  'bubble-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'quick-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'merge-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'heap-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  
  // Đồ thị
  'bfs': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),
  'dfs': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),
  'dijkstra': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),

  // Kiến trúc / Thiết kế
  'encapsulation': defineAsyncComponent(() => import('../../../views/oop/OOPVisualizationView.vue')),
  'inheritance': defineAsyncComponent(() => import('../../../views/oop/OOPVisualizationView.vue')),
  'polymorphism': defineAsyncComponent(() => import('../../../views/oop/OOPVisualizationView.vue')),
  'abstraction': defineAsyncComponent(() => import('../../../views/oop/OOPVisualizationView.vue')),
  
  'srp': defineAsyncComponent(() => import('../../../views/solid/SOLIDVisualizationView.vue')),
  'ocp': defineAsyncComponent(() => import('../../../views/solid/SOLIDVisualizationView.vue')),
  'lsp': defineAsyncComponent(() => import('../../../views/solid/SOLIDVisualizationView.vue')),

  'strategy-pattern': defineAsyncComponent(() => import('../../../views/patterns/PatternsView.vue')),
  'observer-pattern': defineAsyncComponent(() => import('../../../views/patterns/PatternsView.vue')),
  
  'lifetime-demo': defineAsyncComponent(() => import('../../../views/di/DIView.vue')),
  'cycle-detection': defineAsyncComponent(() => import('../../../views/di/DIView.vue')),

  'round-robin-lb': defineAsyncComponent(() => import('../../../views/system-design/SystemDesignVizView.vue')),
  'db-replication': defineAsyncComponent(() => import('../../../views/system-design/SystemDesignVizView.vue')),
};
