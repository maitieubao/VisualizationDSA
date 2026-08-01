<template>
  <section class="tab-section fade-in">
    
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardData.users.total }}</span>
        <span class="stat-card__label">Tổng Người dùng</span>
        <div class="stat-card__breakdown">
          <span><BaseIcon name="academic" style="width:12px;height:12px" /> {{ dashboardData.users.students }} HS</span>
           <span><BaseIcon name="teacher" style="width:12px;height:12px" /> {{ dashboardData.users.teachers }} GV</span>
           <span><BaseIcon name="key" style="width:12px;height:12px" /> {{ dashboardData.users.admins }} Admin</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardData.users.premium }}</span>
        <span class="stat-card__label">Thành viên Premium</span>
        <span class="stat-card__subtext">Tỷ lệ: {{ premiumRatio }}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardData.quizzes.total }}</span>
        <span class="stat-card__label">Tổng số Quiz</span>
        <span class="stat-card__subtext">Dữ liệu từ CSDL</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardData.orders.paid }} / {{ dashboardData.orders.total }}</span>
        <span class="stat-card__label">Đơn hàng đã thanh toán</span>
        <span class="stat-card__subtext">Tỷ lệ chuyển đổi: {{ conversionRate }}%</span>
      </div>
    </div>

    
    <div class="dashboard-charts grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card card--chart">
        <h3 class="card-heading">
          <BaseIcon name="chart-bar" style="width:18px;height:18px;color:#38bdf8" />
          Lượng học viên đăng ký mới (7 ngày gần nhất)
        </h3>
        <div class="chart-container flex items-center justify-center p-4">
          <svg viewBox="0 0 500 200" class="w-full h-48">
            <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />
            <text v-for="(day, idx) in dashboardData.registrationsLast7Days" :key="idx"
              :x="60 + idx * 65" y="190" fill="#64748b" font-size="9" text-anchor="middle">
              {{ formatDateLabel(day.date) }}
            </text>
            <g v-for="(day, idx) in dashboardData.registrationsLast7Days" :key="'bar-' + idx">
              <rect :x="60 + idx * 65 - 15" :y="170 - Math.min(5, Math.max(0.2, day.count)) * 25"
                width="30" :height="Math.min(5, Math.max(0.2, day.count)) * 25"
                rx="4" fill="url(#chartGrad)" class="transition-all duration-500 hover:opacity-80" />
              <text :x="60 + idx * 65" :y="160 - Math.min(5, Math.max(0.2, day.count)) * 25"
                fill="#38bdf8" font-weight="bold" font-size="10" text-anchor="middle">{{ day.count }}</text>
            </g>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#06b6d4" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div class="card card--chart">
        <h3 class="card-heading">
          <BaseIcon name="collection" style="width:18px;height:18px;color:#a855f7" />
          Khóa học phổ biến nhất (Lượt tương tác)
        </h3>
        <div class="course-stats-container p-6 space-y-4">
          <div v-for="course in dashboardData.popularCourses" :key="course.courseId" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200">{{ course.title }}</span>
              <span class="text-purple-400 font-semibold">{{ course.enrollmentsCount }} lượt học</span>
            </div>
            <div class="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden border border-white/5">
              <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                :style="{ width: getCoursePercentage(course.enrollmentsCount) + '%' }"></div>
            </div>
          </div>
          <div v-if="!dashboardData.popularCourses || dashboardData.popularCourses.length === 0" class="text-center text-xs text-slate-500 py-8">
            Chưa có dữ liệu khóa học tương tác.
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-tables">
      <div class="card card--top-users">
        <h3 class="card-heading"><BaseIcon name="trophy" style="width:18px;height:18px" /> Top 5 Học viên tích cực nhất (XP)</h3>
        <div class="table-container">
          <table class="simple-table">
            <thead><tr><th>Học viên</th><th>Vai trò</th><th>Level</th><th>XP</th></tr></thead>
            <tbody>
              <tr v-for="user in dashboardData.topUsers" :key="user.email">
                <td><div class="u-info"><span class="u-name">{{ user.username }}</span><span class="u-email">{{ user.email }}</span></div></td>
                <td><span class="role-badge" :class="'role-badge--' + user.role.toLowerCase()">{{ user.role }}</span></td>
                <td>Lv.{{ user.currentLevel }}</td>
                <td class="u-xp">{{ user.totalXP }} XP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card card--logs">
        <h3 class="card-heading"><BaseIcon name="clipboard-list" style="width:18px;height:18px" /> Nhật ký hệ thống mới nhất</h3>
        <div class="console-box">
          <div v-for="(log, idx) in auditLogs" :key="idx" class="console-line">
            <span class="console-time">[{{ log.time }}]</span>
            <span class="console-tag" :class="'console-tag--' + log.type">{{ log.type }}</span>
            <span class="console-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';

const { BASE_URL, getAuthHeaders, auditLogs, pushLog } = useAdminApi();

interface DashboardData {
  users: { total: number; students: number; teachers: number; admins: number; premium: number };
  quizzes: { total: number };
  orders: { total: number; paid: number };
  topUsers: Array<{ email: string; username: string; totalXP: number; currentLevel: number; role: string }>;
  registrationsLast7Days?: Array<{ date: string; count: number }>;
  popularCourses?: Array<{ courseId: string; title: string; enrollmentsCount: number }>;
}

const dashboardData = ref<DashboardData>({
  users: { total: 0, students: 0, teachers: 0, admins: 0, premium: 0 },
  quizzes: { total: 0 }, orders: { total: 0, paid: 0 },
  topUsers: [], registrationsLast7Days: [], popularCourses: []
});

const premiumRatio = computed(() => {
  if (dashboardData.value.users.total === 0) return 0;
  return Math.round((dashboardData.value.users.premium / dashboardData.value.users.total) * 100);
});
const conversionRate = computed(() => {
  if (dashboardData.value.orders.total === 0) return 0;
  return Math.round((dashboardData.value.orders.paid / dashboardData.value.orders.total) * 100);
});

function formatDateLabel(dateStr: string): string {
  try { const parts = dateStr.split('-'); return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : dateStr; } catch { return dateStr; }
}

function getCoursePercentage(count: number): number {
  if (!dashboardData.value.popularCourses || dashboardData.value.popularCourses.length === 0) return 0;
  const max = Math.max(...dashboardData.value.popularCourses.map(c => c.enrollmentsCount), 1);
  return Math.min(100, Math.round((count / max) * 100));
}

async function loadDashboardData(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    dashboardData.value = await res.json();
    pushLog('INFO', 'Đã tải lại dữ liệu bảng điều khiển.');
  } catch { pushLog('ERROR', 'Lỗi tải dữ liệu tổng quan.'); }
}

defineExpose({ loadDashboardData });
onMounted(() => loadDashboardData());
</script>
