import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

export const visualizerMap: Record<string, Component> = {
  
  'bubble-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'quick-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'merge-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  'heap-sort': defineAsyncComponent(() => import('../../../views/sorting/SortingView.vue')),
  
  
  'bfs': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),
  'dfs': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),
  'dijkstra': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),

  
  'encapsulation': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'inheritance': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'polymorphism': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'abstraction': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  
  'srp': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'ocp': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'lsp': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),

  'strategy-pattern': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'observer-pattern': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  
  'lifetime-demo': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'cycle-detection': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),

  
  'round-robin-lb': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'db-replication': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
};
