import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../features/auth/store/useAuthStore';









const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // Cuộn về đầu trang khi chuyển route (DC-013); giữ nguyên hành vi khi có anchor hash
  // (scrollBehavior chỉ áp dụng cho navigation qua router, không phá TOC scrollIntoView).
  // Route docs: bỏ qua {el} vì heading chưa render lúc này (await shiki async) — DocsMarkdownRenderer
  // tự cuộn tới #section sau khi content vào DOM (DC-028).
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash && to.name !== 'docs') {
      return { el: to.hash, top: 88, behavior: 'smooth' };
    }
    return { top: 0 };
  },
});








router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  
  
  if (from.path.startsWith('/admin') && !to.path.startsWith('/admin') && authStore.isImpersonating) {
    authStore.stopImpersonating();
  }

  
  if ((to.name === 'landing' || to.path === '/') && authStore.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'landing' });
  }

  
  if (to.meta.requiresRole) {
    const requiredRole = to.meta.requiresRole as string;
    const userRole = authStore.userRole;

    const hasAccess =
      userRole === requiredRole ||
      (requiredRole === 'Teacher' && userRole === 'Admin');

    if (!hasAccess) {
      return next({ name: 'dashboard' });
    }
  }

  next();
});

export default router;
