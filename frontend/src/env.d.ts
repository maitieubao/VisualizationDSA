
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@dnd-kit/sortable' {
  export * from '@dnd-kit/sortable';
}
