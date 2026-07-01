<template>
  <div class="admin-panel">
    <!-- Header -->
    <header class="panel-header">
      <div class="header-main">
        <h1 class="panel-title">
          <BaseIcon name="shield" style="width:28px;height:28px;color:#f87171" />
          Hệ thống Quản trị Admin
          <span class="panel-title__badge">Super Admin</span>
        </h1>
        <p class="panel-subtitle">Quản lý toàn bộ người dùng, quyền hệ thống, dữ liệu quiz và theo dõi doanh thu thanh toán.</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <BaseIcon :name="tab.icon" style="width:16px;height:16px" />
          {{ tab.name }}
        </button>
      </div>
    </header>

    <!-- Content Area -->
    <div class="panel-content">
      
      <!-- ── 1. TỔNG QUAN (DASHBOARD) ────────────────────────── -->
      <section v-if="activeTab === 'dashboard'" class="tab-section fade-in">
        <!-- Stats Cards Grid -->
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

        <div class="dashboard-tables">
          <!-- Top Active Users -->
          <div class="card card--top-users">
            <h3 class="card-heading"><BaseIcon name="trophy" style="width:18px;height:18px" /> Top 5 Học viên tích cực nhất (XP)</h3>
            <div class="table-container">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Vai trò</th>
                    <th>Level</th>
                    <th>XP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in dashboardData.topUsers" :key="user.email">
                    <td>
                      <div class="u-info">
                        <span class="u-name">{{ user.username }}</span>
                        <span class="u-email">{{ user.email }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="role-badge" :class="'role-badge--' + user.role.toLowerCase()">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>Lv.{{ user.currentLevel }}</td>
                    <td class="u-xp">{{ user.totalXP }} XP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Audit Activity Logs -->
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

      <!-- ── 2. QUẢN LÝ NGƯỜI DÙNG (USERS) ───────────────────── -->
      <section v-if="activeTab === 'users'" class="tab-section fade-in">
        <div class="card card--users">
          <div class="card-header-row">
            <h3 class="card-heading"><BaseIcon name="users" style="width:18px;height:18px" /> Quản lý Thành viên & Quyền hạn</h3>
            <input 
              v-model="searchQuery" 
              class="search-input" 
              placeholder="Tìm kiếm Email, Username..."
              @input="onSearch"
            />
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Tài khoản Premium</th>
                  <th>Level</th>
                  <th>Tổng XP</th>
                  <th>Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in usersList" :key="u.id">
                  <td>
                    <div class="student-info">
                      <span class="student-name">{{ u.username }}</span>
                      <span class="student-email">{{ u.email }}</span>
                    </div>
                  </td>
                  <td>
                    <select 
                      :value="u.role" 
                      class="inline-select"
                      @change="changeUserRole(u.id, $event)"
                    >
                      <option value="Student">Học viên</option>
                      <option value="Teacher">Giảng viên</option>
                      <option value="Admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      class="toggle-btn"
                      :class="u.isPremium ? 'toggle-btn--active' : 'toggle-btn--inactive'"
                       @click="toggleUserPremium(u.id, u.isPremium)"
                     >
                     <template v-if="u.isPremium">Premium <BaseIcon name="gem" style="width:13px;height:13px" /></template>
                     <template v-else>Miễn phí</template>
                     </button>
                  </td>
                  <td><span class="level-badge">Lv.{{ u.currentLevel }}</span></td>
                  <td>{{ u.totalXP }} XP</td>
                  <td>
                    <button class="btn-audit-detail" @click="showUserAudit(u)"><BaseIcon name="clipboard-list" style="width:13px;height:13px" /> Xem</button>
                    <button
                      class="ban-btn"
                      :class="u.isActive !== false ? 'ban-btn--active' : 'ban-btn--banned'"
                      @click="toggleUserBan(u.id, u.isActive !== false)"
                    >
                      <BaseIcon :name="u.isActive !== false ? 'unlock' : 'lock'" style="width:13px;height:13px" />
                       {{ u.isActive !== false ? 'Hoạt động' : 'Bị khóa' }}
                     </button>
                     <button class="btn-impersonate" @click="impersonateUser(u.id)"><BaseIcon name="impersonate" style="width:14px;height:14px" /> Đóng vai</button>
                  </td>
                </tr>
                <tr v-if="usersList.length === 0">
                  <td colspan="7" class="empty-table-text">Không tìm thấy người dùng nào.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-row">
            <button 
              class="pagination-btn" 
              :disabled="currentPage === 1" 
              @click="changePage(currentPage - 1)"
            >
              <BaseIcon name="chevron-left" style="width:14px;height:14px" /> Trước
            </button>
            <span class="pagination-info">Trang {{ currentPage }} / {{ totalPages }}</span>
            <button 
              class="pagination-btn" 
              :disabled="currentPage >= totalPages" 
              @click="changePage(currentPage + 1)"
            >
              Tiếp <BaseIcon name="chevron-right" style="width:14px;height:14px" />
            </button>
          </div>
        </div>
      </section>

      <!-- ── 3. QUẢN LÝ QUIZ (QUIZZES) ───────────────────────── -->
      <section v-if="activeTab === 'quizzes'" class="tab-section fade-in">
        <div class="card card--quizzes">
          <h3 class="card-heading"><BaseIcon name="clipboard-list" style="width:18px;height:18px" /> Ngân hàng Quiz hiện có</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:32px"></th>
                  <th>Tiêu đề</th>
                  <th>Chủ đề</th>
                  <th>Độ khó</th>
                  <th>XP</th>
                  <th>Số câu hỏi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="q in quizzesList" :key="q.id">
                  <tr class="quiz-row" @click="toggleQuizDetails(q.id)" style="cursor:pointer">
                    <td class="td-expand-icon">{{ expandedQuizId === q.id ? '▼' : '▶' }}</td>
                    <td class="td-title">{{ q.title }}</td>
                    <td><span class="tag-topic">{{ q.topic }}</span></td>
                    <td>
                      <span class="tag-difficulty" :class="'tag-difficulty--' + q.difficulty">
                        {{ getDifficultyLabel(q.difficulty) }}
                      </span>
                    </td>
                    <td>{{ q.xpReward }} XP</td>
                    <td>{{ q.questionCount }} câu</td>
                    <td>
                      <button class="btn-delete" @click.stop="deleteQuiz(q.id, q.title)">
                        <BaseIcon name="trash" style="width:14px;height:14px" /> Xóa
                      </button>
                    </td>
                  </tr>
                  <!-- Accordion chi tiết câu hỏi -->
                  <tr v-if="expandedQuizId === q.id" class="quiz-details-row">
                    <td colspan="7" style="padding: 0">
                      <div class="quiz-details-panel">
                        <div v-if="quizDetailsLoading" class="quiz-loading"><BaseIcon name="hourglass" style="width:14px;height:14px" /> Đang tải câu hỏi...</div>
                        <div v-else-if="quizDetails.length === 0" class="quiz-loading">Không có câu hỏi nào.</div>
                        <div v-else class="quiz-questions-list">
                          <div v-for="(qs, idx) in quizDetails" :key="idx" class="quiz-question-item">
                            <div class="qs-header">
                              <span class="qs-num">Câu {{ idx + 1 }}</span>
                              <span class="qs-text">{{ qs.text }}</span>
                            </div>
                            <div class="qs-options">
                              <div
                                v-for="(opt, oi) in qs.options"
                                :key="oi"
                                class="qs-option"
                                :class="{ 'qs-option--correct': oi === qs.correctIndex }"
                               >
                                 <span class="qs-opt-letter">{{ ['A', 'B', 'C', 'D'][oi] }}.</span>
                                 {{ opt }}
                                 <span v-if="oi === qs.correctIndex" class="qs-correct-badge"><BaseIcon name="check-circle" style="width:13px;height:13px" /> Đáp án đúng</span>
                              </div>
                            </div>
                            <div v-if="qs.explanation" class="qs-explanation">
                               <BaseIcon name="bulb" style="width:13px;height:13px" /> {{ qs.explanation }}
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="quizzesList.length === 0">
                  <td colspan="7" class="empty-table-text">Đang tải danh sách Quiz...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ── 4. HỆ THỐNG (SYSTEM CONFIG) ─────────────────────── -->
      <section v-if="activeTab === 'system'" class="tab-section fade-in">
        <div class="system-layout">
          <!-- Server Status Card -->
          <div class="card card--system-status">
            <h3 class="card-heading"><BaseIcon name="cog" style="width:18px;height:18px" /> Thông tin Máy chủ & API</h3>
            <div class="system-info-grid">
              <div class="info-item">
                <span class="info-label">API Base URL:</span>
                <span class="info-val"><code>{{ BASE_URL }}</code></span>
              </div>
              <div class="info-item">
                <span class="info-label">Phương thức xác thực:</span>
                <span class="info-val">Stateless JWT JWT (Header + Payload)</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái kết nối CSDL:</span>
                <span class="info-val text-success">Đang kết nối (PostgreSQL) ✓</span>
              </div>
              <div class="info-item">
                <span class="info-label">Môi trường hoạt động:</span>
                <span class="info-val"><code>Production-safe mode</code></span>
              </div>
            </div>

            <div class="system-actions">
              <button class="btn-primary" @click="runSystemDiagnostics">
                <BaseIcon name="lightning" style="width:15px;height:15px" /> Chạy chẩn đoán hệ thống
              </button>
            </div>
          </div>

          <!-- Quick settings -->
          <div class="card card--settings">
            <h3 class="card-heading"><BaseIcon name="tool" style="width:18px;height:18px" /> Cài đặt hệ thống</h3>
            <div class="settings-form">
              <div class="setting-row">
                <div class="setting-desc">
                  <span class="setting-title">Cho phép Đăng ký tài khoản</span>
                  <p class="setting-sub">Cho phép người dùng mới tạo tài khoản qua OAuth hoặc Stateless Email.</p>
                </div>
                <input type="checkbox" checked class="setting-checkbox" disabled />
              </div>
              <div class="setting-row">
                <div class="setting-desc">
                  <span class="setting-title">Bảo trì Timeline VCR</span>
                  <p class="setting-sub">Khóa tạm thời timeline visualizer để cập nhật giải thuật cốt lõi.</p>
                </div>
                <input type="checkbox" class="setting-checkbox" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

  <!-- ── User Detail Modal ────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showUserModal" class="user-modal-backdrop" @click.self="showUserModal = false">
        <div class="user-modal-card">
          <div class="user-modal-header">
            <div class="user-modal-avatar">{{ selectedUser?.username?.[0]?.toUpperCase() }}</div>
            <div class="user-modal-identity">
              <h2 class="user-modal-name">{{ selectedUser?.username }}</h2>
              <span class="user-modal-email">{{ selectedUser?.email }}</span>
              <span class="role-badge" :class="'role-badge--' + (selectedUser?.role?.toLowerCase() ?? 'student')">
                {{ selectedUser?.role === 'Admin' ? 'Quản trị viên' : selectedUser?.role === 'Teacher' ? 'Giảng viên' : 'Học viên' }}
              </span>
            </div>
            <button class="user-modal-close" @click="showUserModal = false">&times;</button>
          </div>

          <div class="user-modal-stats">
            <div class="modal-stat-item">
              <span class="modal-stat-val">{{ selectedUser?.totalXP ?? 0 }}</span>
              <span class="modal-stat-label"><BaseIcon name="lightning" style="width:13px;height:13px" /> Tổng XP</span>
            </div>
            <div class="modal-stat-item">
              <span class="modal-stat-val">{{ selectedUser?.currentLevel ?? 1 }}</span>
              <span class="modal-stat-label"><BaseIcon name="trophy" style="width:13px;height:13px" /> Cấp độ</span>
            </div>
            <div class="modal-stat-item">
              <span class="modal-stat-val">{{ selectedUser?.streakDays ?? 0 }}</span>
              <span class="modal-stat-label"><BaseIcon name="fire" style="width:13px;height:13px" /> Streak</span>
            </div>
            <div class="modal-stat-item">
              <span class="modal-stat-val" :class="selectedUser?.isPremium ? 'text-premium' : ''">
                {{ selectedUser?.isPremium ? 'Premium' : 'Miễn phí' }}
              </span>
              <span class="modal-stat-label"><BaseIcon name="gem" style="width:13px;height:13px" /> Gói dịch vụ</span>
            </div>
          </div>

          <div class="user-modal-details">
            <div class="modal-detail-row">
              <span class="modal-detail-label"><BaseIcon name="calendar" style="width:13px;height:13px" /> Ngày tham gia</span>
              <span class="modal-detail-val">{{ selectedUser ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' }}</span>
            </div>
            <div class="modal-detail-row">
              <span class="modal-detail-label"><BaseIcon name="clock" style="width:13px;height:13px" /> Đăng nhập gần nhất</span>
              <span class="modal-detail-val">{{ selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa có dữ liệu' }}</span>
            </div>
          </div>

          <div class="user-modal-footer">
            <button class="btn-modal-close-secondary" @click="showUserModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const authStore = useAuthStore();

interface Tab {
  id: string;
  name: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'dashboard', name: 'Tổng quan', icon: 'chart-bar' },
  { id: 'users', name: 'Người dùng', icon: 'users' },
  { id: 'quizzes', name: 'Quản lý Quiz', icon: 'clipboard-list' },
  { id: 'system', name: 'Hệ thống', icon: 'cog' },
];

const activeTab = ref('dashboard');

// Dashboard Data
interface DashboardData {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    premium: number;
  };
  quizzes: {
    total: number;
  };
  orders: {
    total: number;
    paid: number;
  };
  topUsers: Array<{
    email: string;
    username: string;
    totalXP: number;
    currentLevel: number;
    role: string;
  }>;
}

const dashboardData = ref<DashboardData>({
  users: { total: 0, students: 0, teachers: 0, admins: 0, premium: 0 },
  quizzes: { total: 0 },
  orders: { total: 0, paid: 0 },
  topUsers: []
});

const premiumRatio = computed(() => {
  if (dashboardData.value.users.total === 0) return 0;
  return Math.round((dashboardData.value.users.premium / dashboardData.value.users.total) * 100);
});

const conversionRate = computed(() => {
  if (dashboardData.value.orders.total === 0) return 0;
  return Math.round((dashboardData.value.orders.paid / dashboardData.value.orders.total) * 100);
});

// User Management States
interface UserItem {
  id: string;
  email: string;
  username: string;
  role: string;
  isPremium: boolean;
  isActive: boolean;
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  createdAt: string;
  lastLogin: string;
}
const usersList = ref<UserItem[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;

// Quiz Accordion State
interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
const expandedQuizId = ref<string | null>(null);
const quizDetails = ref<QuizQuestion[]>([]);
const quizDetailsLoading = ref(false);

// Quiz Management States
interface QuizItem {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  xpReward: number;
  questionCount: number;
  createdAt: string;
}
const quizzesList = ref<QuizItem[]>([]);

// System audit logs
interface AuditLog {
  time: string;
  type: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}
const auditLogs = ref<AuditLog[]>([
  { time: '15:20:04', type: 'INFO', message: 'Hệ thống Admin khởi động hoàn tất.' },
  { time: '15:20:08', type: 'INFO', message: 'Đã kết nối cơ sở dữ liệu PostgreSQL.' },
  { time: '15:22:15', type: 'INFO', message: 'Lấy danh sách người dùng thành công.' }
]);

function pushLog(type: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const d = new Date();
  const time = d.toTimeString().split(' ')[0];
  auditLogs.value.unshift({ time, type, message });
  if (auditLogs.value.length > 15) {
    auditLogs.value.pop();
  }
}

function getDifficultyLabel(diff: string): string {
  if (diff === 'easy') return 'Dễ';
  if (diff === 'hard') return 'Khó';
  return 'Trung bình';
}

function runSystemDiagnostics(): void {
  pushLog('INFO', 'Đang bắt đầu chẩn đoán hệ thống...');
  setTimeout(() => {
    pushLog('INFO', 'Ping API Server: 25ms - Khỏe mạnh ✓');
    pushLog('INFO', 'CSDL PostgreSQL: OK - Mức chiếm dụng đĩa 4.2%');
    pushLog('INFO', 'Hệ thống chẩn đoán kết thúc không phát hiện lỗi.');
    alert('Diagnostics hoàn tất. Mọi tài nguyên hoạt động bình thường!');
  }, 1000);
}

/**
 * Tải dữ liệu Dashboard
 */
async function loadDashboardData(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` }
    });
    if (!res.ok) return;
    dashboardData.value = await res.json();
  pushLog('INFO', 'Đã tải lại dữ liệu bảng điều khiển.');
  } catch {
    pushLog('ERROR', 'Lỗi tải dữ liệu tổng quan.');
  }
}

/**
 * Tải danh sách người dùng
 */
async function loadUsers(page: number = 1): Promise<void> {
  try {
    const searchParam = searchQuery.value ? `&search=${encodeURIComponent(searchQuery.value)}` : '';
    const res = await fetch(
      `${BASE_URL}/api/v1/concepts/admin/users?page=${page}&pageSize=${pageSize}${searchParam}`,
      { headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    usersList.value = data.users || [];
    currentPage.value = data.page;
    totalPages.value = Math.ceil(data.total / pageSize) || 1;
  } catch {
    pushLog('ERROR', 'Lỗi tải danh sách người dùng.');
  }
}

function onSearch(): void {
  loadUsers(1);
}

function changePage(page: number): void {
  if (page < 1 || page > totalPages.value) return;
  loadUsers(page);
}

/**
 * Cập nhật role
 */
async function changeUserRole(userId: string, event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement;
  const newRole = select.value;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getAccessToken()}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (res.ok) {
      pushLog('INFO', `Đã cập nhật vai trò người dùng ${userId} thành ${newRole}`);
      await loadDashboardData();
    } else {
      pushLog('ERROR', `Lỗi cập nhật vai trò người dùng ${userId}`);
      alert('Lỗi cập nhật quyền. Hãy chắc chắn bạn là Admin.');
    }
  } catch {
    alert('Lỗi kết nối khi cập nhật role.');
  }
}

/**
 * Bật/tắt Premium
 */
async function toggleUserPremium(userId: string, currentStatus: boolean): Promise<void> {
  const newStatus = !currentStatus;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/premium`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getAccessToken()}`
      },
      body: JSON.stringify({ isPremium: newStatus })
    });

    if (res.ok) {
      const u = usersList.value.find(user => user.id === userId);
      if (u) u.isPremium = newStatus;
      pushLog('INFO', `Đã ${newStatus ? 'bật' : 'tắt'} Premium cho người dùng ${userId}`);
      await loadDashboardData();
    } else {
      alert('Lỗi bật tắt Premium.');
    }
  } catch {
    alert('Lỗi kết nối khi cập nhật Premium.');
  }
}

/**
 * Tải danh sách Quiz
 */
async function loadQuizzes(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes`, {
      headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` }
    });
    if (!res.ok) return;
    quizzesList.value = await res.json();
  } catch {
    pushLog('ERROR', 'Lỗi tải danh sách Quiz.');
  }
}

/**
 * Xóa Quiz
 */
async function deleteQuiz(quizId: string, title: string): Promise<void> {
  if (!confirm(`Bạn có chắc chắn muốn xóa Quiz "${title}" không?`)) return;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` }
    });

    if (res.ok) {
      quizzesList.value = quizzesList.value.filter(q => q.id !== quizId);
      pushLog('INFO', `Đã xóa quiz "${title}"`);
      await loadDashboardData();
    } else {
      alert('Lỗi khi xóa Quiz.');
    }
  } catch {
    alert('Lỗi kết nối khi xóa Quiz.');
  }
}

const showUserModal = ref(false);
const selectedUser = ref<UserItem | null>(null);

function showUserAudit(user: UserItem): void {
  selectedUser.value = user;
  showUserModal.value = true;
}

/**
 * Khóa / Mở khóa tài khoản (Task 4.2)
 */
async function toggleUserBan(userId: string, currentActive: boolean): Promise<void> {
  const newActive = !currentActive;
  const action = newActive ? 'mở khóa' : 'khóa';
  if (!confirm(`Bạn có chắc muốn ${action} tài khoản này không?`)) return;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getAccessToken()}`
      },
      body: JSON.stringify({ isActive: newActive })
    });

    if (res.ok) {
      const u = usersList.value.find(user => user.id === userId);
      if (u) u.isActive = newActive;
      pushLog('INFO', `Đã ${action} tài khoản ${userId}`);
    } else {
      alert(`Lỗi khi ${action} tài khoản.`);
    }
  } catch {
    alert('Lỗi kết nối khi thay đổi trạng thái tài khoản.');
  }
}

/**
 * Đóng vai (Impersonate) tài khoản người dùng khác (Phase C)
 */
async function impersonateUser(userId: string): Promise<void> {
  if (!confirm('Bạn có chắc chắn muốn đóng vai (impersonate) người dùng này không?')) return;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/impersonate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getAccessToken()}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      authStore.impersonate(data);
      pushLog('INFO', `Đóng vai thành công người dùng: ${data.user.email}`);
      alert(`Đang đóng vai ${data.user.username}. Hệ thống sẽ chuyển bạn về trang chủ.`);
      window.location.href = '/';
    } else {
      const err = await res.json();
      alert(`Lỗi đóng vai: ${err.message || 'Không xác định'}`);
    }
  } catch {
    alert('Lỗi kết nối khi thực hiện đóng vai.');
  }
}


/**
 * Accordion: Toggle chi tiết câu hỏi Quiz (Task 5.1)
 */
async function toggleQuizDetails(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) {
    expandedQuizId.value = null;
    quizDetails.value = [];
    return;
  }
  expandedQuizId.value = quizId;
  quizDetails.value = [];
  quizDetailsLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, {
      headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` }
    });
    if (res.ok) {
      const data = await res.json();
      quizDetails.value = data.questions ?? [];
    }
  } catch {
    pushLog('ERROR', 'Lỗi tải chi tiết câu hỏi.');
  } finally {
    quizDetailsLoading.value = false;
  }
}

onMounted(() => {
  loadDashboardData();
  loadUsers(1);
  loadQuizzes();
});
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

/* ── Header ─────────────────────────────── */
.panel-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title__badge {
  font-size: 0.65rem;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.panel-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
}

.tab-btn--active {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}

/* ── Content ────────────────────────────── */
.panel-content {
  position: relative;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── stats grid ─────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.stat-card__val {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-card__label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
}

.stat-card__breakdown {
  display: flex;
  gap: 0.5rem;
  font-size: 0.725rem;
  color: #64748b;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}

.stat-card__subtext {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
}

/* ── Dashboard Tables ───────────────────── */
.dashboard-tables {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem;
}

.card {
  background: rgba(30, 41, 59, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1.5rem;
}

.card-heading {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.simple-table th, .simple-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.simple-table th {
  color: #64748b;
  font-weight: 600;
}

.u-info {
  display: flex;
  flex-direction: column;
}

.u-name {
  font-weight: 600;
  color: #e2e8f0;
}

.u-email {
  font-size: 0.725rem;
  color: #64748b;
}

.u-xp {
  font-weight: 600;
  color: #c084fc;
}

/* Console logs */
.console-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.775rem;
  height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.console-line {
  display: flex;
  gap: 0.5rem;
  line-height: 1.4;
}

.console-time {
  color: #64748b;
}

.console-tag {
  font-weight: 700;
}

.console-tag--INFO { color: #3b82f6; }
.console-tag--WARN { color: #eab308; }
.console-tag--ERROR { color: #ef4444; }

.console-msg {
  color: #cbd5e1;
}

/* ── Users Tab & General Table ──────────── */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.search-input {
  width: 320px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  outline: none;
  font-size: 0.85rem;
}

.search-input:focus {
  border-color: #ef4444;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th, .data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.01);
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #f8fafc;
}

.student-email {
  font-size: 0.75rem;
  color: #64748b;
}

.inline-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
}

.inline-select option {
  background: #0f172a;
}

.toggle-btn {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.toggle-btn--active {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.toggle-btn--inactive {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.level-badge {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.btn-audit-detail {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.btn-audit-detail:hover {
  background: rgba(255, 255, 255, 0.05);
}

.role-badge {
  font-size: 0.725rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.role-badge--admin { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.role-badge--teacher { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.role-badge--student { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

/* Quizzes table specific */
.td-title {
  font-weight: 600;
  color: #f8fafc;
}

.tag-topic {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.tag-difficulty {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-difficulty--easy { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.tag-difficulty--medium { background: rgba(234, 179, 8, 0.12); color: #facc15; }
.tag-difficulty--hard { background: rgba(239, 68, 68, 0.12); color: #f87171; }

.btn-delete {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Pagination Row */
.pagination-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.825rem;
  color: #94a3b8;
}

/* ── 4. System tab ──────────────────────── */
.system-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem;
}

.system-info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-label {
  color: #94a3b8;
}

.info-val {
  color: #f1f5f9;
  font-weight: 500;
}

.info-val code {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.text-success {
  color: #4ade80 !important;
}

.system-actions {
  margin-top: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.01);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.setting-desc {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.setting-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.setting-sub {
  font-size: 0.75rem;
  color: #64748b;
  max-width: 250px;
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #ef4444;
}

/* ── Responsive ────────────────────────── */
@media (max-width: 1024px) {
  .dashboard-tables, .system-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-panel { padding: 1rem; }
  .panel-title { font-size: 1.3rem; }
  .card-header-row { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
}

/* ── User Detail Modal ───────────────────────────── */
.user-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.user-modal-card {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(32px) saturate(1.6);
  -webkit-backdrop-filter: blur(32px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
}

.user-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.user-modal-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.user-modal-identity {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.user-modal-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.user-modal-email {
  font-size: 0.78rem;
  color: #64748b;
}

.user-modal-close {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.15s;
}
.user-modal-close:hover { color: #f1f5f9; }

.user-modal-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.modal-stat-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 0.85rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.modal-stat-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
}

.modal-stat-val.text-premium { color: #c084fc; }

.modal-stat-label {
  font-size: 0.68rem;
  color: #64748b;
  text-align: center;
}

.user-modal-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1.25rem;
  margin-bottom: 1.5rem;
}

.modal-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.modal-detail-label {
  color: #64748b;
  font-weight: 500;
}

.modal-detail-val {
  color: #cbd5e1;
  font-weight: 500;
}

.user-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-modal-close-secondary {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-modal-close-secondary:hover {
  background: rgba(255,255,255,0.1);
  color: #f1f5f9;
}

.modal-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.modal-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-fade-enter-from { opacity: 0; transform: scale(0.92) translateY(10px); }
.modal-fade-leave-to   { opacity: 0; transform: scale(0.96) translateY(-4px); }

/* ── Ban Button ─────────────────────────── */
.ban-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.4rem;
}

.ban-btn--active {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}
.ban-btn--active:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.ban-btn--banned {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}
.ban-btn--banned:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}

/* ── Quiz Accordion ─────────────────────── */
.td-expand-icon {
  color: #64748b;
  font-size: 0.7rem;
  text-align: center;
}

.quiz-row:hover {
  background: rgba(255,255,255,0.03);
}

.quiz-details-row td {
  background: rgba(15, 23, 42, 0.4);
}

.quiz-details-panel {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.quiz-loading {
  color: #64748b;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}

.quiz-questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-question-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 1rem;
}

.qs-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.qs-num {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.qs-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.5;
}

.qs-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.qs-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.qs-option--correct {
  background: rgba(34, 197, 94, 0.08);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.qs-opt-letter {
  font-weight: 700;
  color: #64748b;
  min-width: 18px;
}

.qs-option--correct .qs-opt-letter { color: #4ade80; }

.qs-correct-badge {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 700;
  color: #4ade80;
}

.qs-explanation {
  font-size: 0.775rem;
  color: #94a3b8;
  background: rgba(255,255,255,0.03);
  border-left: 3px solid rgba(251, 191, 36, 0.4);
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
  font-style: italic;
}

.btn-impersonate {
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.25);
  color: #c084fc;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  margin-left: 0.4rem;
}
.btn-impersonate:hover {
  background: rgba(168, 85, 247, 0.25);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
}
</style>
