<template>
  <section class="tab-section fade-in">
    <div v-if="dashboardError" class="dashboard-error mb-6 p-4 rounded-xl bg-bg-hover border border-accent-red/30 text-sm text-text-primary flex items-center justify-between gap-4">
      <span>Không tải được dữ liệu tổng quan từ máy chủ.</span>
      <button class="btn-retry-list px-3 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-xs text-text-primary font-bold hover:bg-bg-active transition-all" @click="loadDashboardData">Thử lại</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardLoading ? '…' : dashboardData.users.total }}</span>
        <span class="stat-card__label">Tổng Người dùng</span>
        <div class="stat-card__breakdown">
          <span><BaseIcon name="academic" style="width:12px;height:12px" /> {{ dashboardLoading ? '…' : dashboardData.users.students }} HS</span>
           <span><BaseIcon name="teacher" style="width:12px;height:12px" /> {{ dashboardLoading ? '…' : dashboardData.users.teachers }} GV</span>
           <span><BaseIcon name="key" style="width:12px;height:12px" /> {{ dashboardLoading ? '…' : dashboardData.users.admins }} Admin</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardLoading ? '…' : dashboardData.users.premium }}</span>
        <span class="stat-card__label">Thành viên Premium</span>
        <span class="stat-card__subtext">{{ premiumSubtext }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardLoading ? '…' : dashboardData.quizzes.total }}</span>
        <span class="stat-card__label">Tổng số Quiz</span>
        <span class="stat-card__subtext">Dữ liệu từ CSDL</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ dashboardLoading ? '…' : `${dashboardData.orders.paid} / ${dashboardData.orders.total}` }}</span>
        <span class="stat-card__label">Đơn hàng đã thanh toán</span>
        <span class="stat-card__subtext">{{ conversionSubtext }}</span>
      </div>
    </div>

    <div class="dashboard-charts grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card card--chart">
        <h3 class="card-heading">
          <BaseIcon name="chart-bar" style="width:18px;height:18px;color:var(--color-accent-cyan)" />
          Lượng học viên đăng ký mới (7 ngày gần nhất)
        </h3>
        <div v-if="dashboardData.registrationsLast7Days && dashboardData.registrationsLast7Days.length > 0" class="p-4">
          <svg viewBox="0 0 500 200" class="w-full h-48">
            <line x1="40" y1="20" x2="480" y2="20" stroke="var(--color-border-subtle)" stroke-dasharray="4" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="var(--color-border-subtle)" stroke-dasharray="4" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="var(--color-border-subtle)" stroke-dasharray="4" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="var(--color-border-default)" />
            <text x="32" y="24" fill="var(--color-text-muted)" font-size="9" text-anchor="end">{{ maxRegistrations }}</text>
            <text x="32" y="174" fill="var(--color-text-muted)" font-size="9" text-anchor="end">0</text>
            <text x="26" y="100" fill="var(--color-text-muted)" font-size="9" transform="rotate(-90 26 100)" text-anchor="middle">Lượt đăng ký</text>
            <text v-for="(day, idx) in dashboardData.registrationsLast7Days" :key="idx"
              :x="60 + idx * 65" y="190" fill="var(--color-text-secondary)" font-size="9" text-anchor="middle">
              {{ formatDateLabel(day.date) }}
            </text>
            <g v-for="(day, idx) in dashboardData.registrationsLast7Days" :key="'bar-' + idx">
              <rect :x="60 + idx * 65 - 15" :y="chartBarY(day.count)"
                width="30" :height="chartBarHeight(day.count)"
                rx="4" fill="url(#chartGrad)" class="transition-all duration-500 hover:opacity-80" />
              <text :x="60 + idx * 65" :y="chartBarY(day.count) - 5"
                fill="var(--color-accent-cyan)" font-weight="bold" font-size="10" text-anchor="middle">{{ day.count }}</text>
            </g>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-accent-cyan)" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          <p class="chart-legend text-center text-[10px] text-text-muted mt-2">Trục ngang: 7 ngày gần nhất · Trục dọc: số lượt đăng ký mới</p>
        </div>
        <div v-else class="text-center text-xs text-text-muted py-10">Chưa có dữ liệu đăng ký 7 ngày.</div>
      </div>

      <div class="card card--chart">
        <h3 class="card-heading">
          <BaseIcon name="collection" style="width:18px;height:18px;color:var(--color-accent-purple)" />
          Khóa học phổ biến nhất (Lượt tương tác)
        </h3>
        <div class="course-stats-container p-6 space-y-4">
          <div v-for="course in dashboardData.popularCourses" :key="course.courseId" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-text-primary">{{ course.title }}</span>
              <span class="text-accent-purple font-semibold">{{ course.enrollmentsCount }} lượt học</span>
            </div>
            <div class="w-full bg-bg-secondary rounded-full h-3 overflow-hidden border border-border-subtle">
              <div class="bg-gradient-to-r from-accent-purple to-accent h-full rounded-full transition-all duration-1000"
                :style="{ width: getCoursePercentage(course.enrollmentsCount) + '%' }"></div>
            </div>
          </div>
          <div v-if="!dashboardData.popularCourses || dashboardData.popularCourses.length === 0" class="text-center text-xs text-text-muted py-8">
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
              <tr v-if="dashboardData.topUsers.length === 0"><td colspan="4" class="empty-table-text">Chưa có dữ liệu.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card card--logs">
        <h3 class="card-heading"><BaseIcon name="clipboard-list" style="width:18px;height:18px" /> Nhật ký hệ thống mới nhất</h3>
        <div class="console-box">
          <div v-if="logsLoading" class="console-line">
            <span class="console-time">Đang tải nhật ký hệ thống...</span>
          </div>
          <div v-else-if="logsError" class="console-line">
            <span class="console-tag console-tag--ERROR">ERROR</span>
            <span class="console-msg">Không tải được nhật ký hệ thống.</span>
          </div>
          <template v-else-if="systemLogs.length > 0">
            <div v-for="(log, idx) in systemLogs" :key="idx" class="console-line">
              <span class="console-time">[{{ log.time }}]</span>
              <span class="console-tag" :class="'console-tag--' + log.type">{{ log.type }}</span>
              <span class="console-msg" v-html="parseEmojiToSvg(escapeHtmlText(log.message))"></span>
            </div>
          </template>
          <div v-else class="console-line">
            <span class="console-time">Chưa có nhật ký hệ thống.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';
import { useToastStore } from '../../composables/useToast';
import { parseEmojiToSvg, escapeHtmlText } from '../../utils/emojiParser';

const { BASE_URL, getAuthHeaders } = useAdminApi();
const toastStore = useToastStore();

interface DashboardData {
  users: { total: number; students: number; teachers: number; admins: number; premium: number };
  quizzes: { total: number };
  orders: { total: number; paid: number };
  topUsers: Array<{ email: string; username: string; totalXP: number; currentLevel: number; role: string }>;
  registrationsLast7Days?: Array<{ date: string; count: number }>;
  popularCourses?: Array<{ courseId: string; title: string; enrollmentsCount: number }>;
}

interface DashboardAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  targetId: string | null;
  details: string;
  createdAt: string;
}

interface ConsoleLog {
  time: string;
  type: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

const dashboardData = ref<DashboardData>({
  users: { total: 0, students: 0, teachers: 0, admins: 0, premium: 0 },
  quizzes: { total: 0 }, orders: { total: 0, paid: 0 },
  topUsers: [], registrationsLast7Days: [], popularCourses: []
});
const dashboardLoading = ref(true);
const dashboardError = ref(false);
const logsLoading = ref(true);
const logsError = ref(false);
const systemLogs = ref<ConsoleLog[]>([]);

const premiumRatio = computed(() => {
  if (dashboardData.value.users.total === 0) return 0;
  return Math.round((dashboardData.value.users.premium / dashboardData.value.users.total) * 100);
});
const conversionRate = computed(() => {
  if (dashboardData.value.orders.total === 0) return 0;
  return Math.round((dashboardData.value.orders.paid / dashboardData.value.orders.total) * 100);
});
const premiumSubtext = computed(() =>
  dashboardData.value.users.total === 0 ? 'Chưa có dữ liệu' : `Tỷ lệ: ${premiumRatio.value}%`
);
const conversionSubtext = computed(() =>
  dashboardData.value.orders.total === 0 ? 'Chưa có dữ liệu' : `Tỷ lệ chuyển đổi: ${conversionRate.value}%`
);

const maxRegistrations = computed(() =>
  Math.max(...(dashboardData.value.registrationsLast7Days ?? []).map(d => d.count), 1)
);

function chartBarHeight(count: number): number {
  return Math.max(2, Math.round((count / maxRegistrations.value) * 150));
}

function chartBarY(count: number): number {
  return 170 - chartBarHeight(count);
}

function formatDateLabel(dateStr: string): string {
  try { const parts = dateStr.split('-'); return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : dateStr; } catch { return dateStr; }
}

function getCoursePercentage(count: number): number {
  if (!dashboardData.value.popularCourses || dashboardData.value.popularCourses.length === 0) return 0;
  const max = Math.max(...dashboardData.value.popularCourses.map(c => c.enrollmentsCount), 1);
  return Math.min(100, Math.round((count / max) * 100));
}

function formatLogTime(createdAt: string): string {
  try {
    return new Date(createdAt).toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return '--:--:--'; }
}

function mapAuditToConsoleLog(log: DashboardAuditLog): ConsoleLog {
  const isDestructive = log.action === 'BanUser' || log.action === 'UnbanUser' || log.action === 'DeleteUser' || log.action === 'ImpersonateUser';
  return {
    time: formatLogTime(log.createdAt),
    type: isDestructive ? 'WARN' : 'INFO',
    message: log.details || `${log.action} — ${log.actorName}`
  };
}

async function loadDashboardData(): Promise<void> {
  dashboardLoading.value = true;
  dashboardError.value = false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) {
      dashboardError.value = true;
      toastStore.error('Không tải được dữ liệu tổng quan từ máy chủ.', 'Bảng điều khiển');
      return;
    }
    dashboardData.value = await res.json();
  } catch {
    dashboardError.value = true;
    toastStore.error('Lỗi kết nối khi tải dữ liệu tổng quan.', 'Bảng điều khiển');
  } finally {
    dashboardLoading.value = false;
  }
}

async function loadSystemLogs(): Promise<void> {
  logsLoading.value = true;
  logsError.value = false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/audit-logs?page=1&pageSize=10`, { headers: getAuthHeaders() });
    if (!res.ok) {
      logsError.value = true;
      toastStore.error('Không tải được nhật ký hệ thống từ máy chủ.', 'Nhật ký hệ thống');
      return;
    }
    const data = await res.json() as { logs?: DashboardAuditLog[] };
    systemLogs.value = (data.logs ?? []).map(mapAuditToConsoleLog);
  } catch {
    logsError.value = true;
    toastStore.error('Lỗi kết nối khi tải nhật ký hệ thống.', 'Nhật ký hệ thống');
  } finally {
    logsLoading.value = false;
  }
}

defineExpose({ loadDashboardData });
onMounted(() => {
  loadDashboardData();
  loadSystemLogs();
});
</script>
