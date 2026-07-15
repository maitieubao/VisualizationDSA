import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    icon?: string;
    public?: boolean;
    requiresAuth?: boolean;
    requiresRole?: string;
  }
}
