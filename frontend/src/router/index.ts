import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../features/auth/store/useAuthStore';









const router = createRouter({
  history: createWebHistory(),
  routes,
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
