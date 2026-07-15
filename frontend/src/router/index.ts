import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../features/auth/store/useAuthStore';

/**
 * Router cấu hình lazy loading cho từng feature tab.
 *
 * Nguyên tắc:
 * - Mỗi tab là một route riêng → code-splitting tự động qua Vite
 * - Dùng createWebHashHistory (#) để tương thích với SPA không cần server config
 * - Tất cả components được import động () => import(...) → lazy load on demand
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/**
 * Global navigation guard — role-based access control.
 * - Landing page (`/`) redirects to `/dashboard` when authenticated
 * - `/dashboard` redirects to `/` when not authenticated
 * - `/teacher` requires Teacher hoặc Admin role
 * - `/admin` requires Admin role
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // If leaving /admin route AND currently impersonating, stop impersonating to sanitize session.
  // Only trigger when vdsa_admin_access_token exists — prevents state mutation for normal Admin navigation.
  if (from.path.startsWith('/admin') && !to.path.startsWith('/admin') && authStore.isImpersonating) {
    authStore.stopImpersonating();
  }

  // Authenticated users visiting landing → redirect to dashboard
  if ((to.name === 'landing' || to.path === '/') && authStore.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  // Routes requiring auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'landing' });
  }

  // Routes requiring specific role (Admin can access Teacher pages too)
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
