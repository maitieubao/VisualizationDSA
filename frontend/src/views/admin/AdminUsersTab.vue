<template>
  <section class="tab-section fade-in">
    <div class="card card--users">
      <div class="card-header-row">
        <h3 class="card-heading"><BaseIcon name="users" style="width:18px;height:18px" /> Quản lý Thành viên & Quyền hạn</h3>
        <div class="flex gap-2 items-center">
          <input v-model="searchQuery" class="search-input" placeholder="Tìm kiếm Email, Username..." @input="onSearch" />
          <button class="btn-create-user flex items-center gap-1" @click="openCreateUserModal">
            <BaseIcon name="plus" style="width:12px;height:12px" /> Tạo tài khoản
          </button>
        </div>
      </div>

      <!-- AD-050: bảng cuộn ngang trên mobile + AD-055: aria-label/caption -->
      <div class="table-container">
        <table class="data-table" aria-label="Danh sách thành viên hệ thống">
          <caption class="visually-hidden">Danh sách người dùng và quyền hạn quản trị</caption>
          <thead>
            <tr>
              <th>Tài khoản</th><th>Vai trò</th><th>Tài khoản Premium</th>
              <th>Level</th><th>Tổng XP</th><th>Thao tác quản trị</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoadingUsers && usersList.length === 0">
              <td colspan="7" class="empty-table-text">Đang tải danh sách người dùng...</td>
            </tr>
            <!-- AD-016: tách state lỗi riêng khỏi empty state — lỗi không còn hiển thị nhầm
                 "Không tìm thấy người dùng" -->
            <tr v-else-if="loadError">
              <td colspan="7" class="empty-table-text">{{ loadError }}</td>
            </tr>
            <tr v-else-if="usersList.length === 0">
              <td colspan="7" class="empty-table-text">Không tìm thấy người dùng nào.</td>
            </tr>
            <tr v-for="u in usersList" :key="u.id">
              <td>
                <div class="student-info">
                  <span class="student-name">{{ u.username }}</span>
                  <span class="student-email">{{ u.email }}</span>
                </div>
              </td>
               <td>
                 <!-- AD-015/AD-023: admin cuối (totalAdmins từ API) bị khóa đổi vai trò -->
                 <!-- F3 (FR-1.8): PendingTeacher hiển thị badge riêng + nút duyệt/từ chối thay cho select. -->
                 <template v-if="u.role === 'PendingTeacher'">
                   <span class="role-badge role-badge--pendingteacher">Chờ duyệt GV</span>
                 </template>
                 <select v-else :value="u.role" class="inline-select" @change="changeUserRole(u.id, $event)" :disabled="isRowBusy(u.id) || (u.role === 'Admin' && isLastAdmin(u))">
                   <option value="Student">Học viên</option>
                   <option value="Teacher">Giảng viên</option>
                   <option value="Admin">Quản trị viên</option>
                 </select>
                 <span v-if="u.role === 'Admin' && isLastAdmin(u)" class="text-xs text-accent-red ml-2">⚠ Cuối cùng</span>
               </td>
              <td>
                <button class="toggle-btn" :class="u.isPremium ? 'toggle-btn--active' : 'toggle-btn--inactive'" :disabled="isRowBusy(u.id)" @click="toggleUserPremium(u.id, u.isPremium)">
                  <template v-if="u.isPremium">Premium <BaseIcon name="gem" style="width:13px;height:13px" /></template>
                  <template v-else>Miễn phí</template>
                </button>
              </td>
              <td><span class="level-badge">Lv.{{ u.currentLevel }}</span></td>
              <td>{{ u.totalXP }} XP</td>
              <td class="flex flex-wrap gap-1.5 items-center">
                <!-- F3 (FR-1.8): nút duyệt/từ chối giảng viên đang chờ. -->
                <template v-if="u.role === 'PendingTeacher'">
                  <button class="btn-audit-detail" :disabled="isRowBusy(u.id)" @click="approvePendingTeacher(u.id)" title="Duyệt giảng viên"><BaseIcon name="check" style="width:13px;height:13px" /> Duyệt</button>
                  <button class="ban-btn ban-btn--banned" :disabled="isRowBusy(u.id)" @click="rejectPendingTeacher(u.id)" title="Từ chối giảng viên"><BaseIcon name="close" style="width:13px;height:13px" /> Từ chối</button>
                </template>
                <!-- AD-049: "showUserAudit" → "Xem chi tiết" -->
                <button class="btn-audit-detail" :disabled="isRowBusy(u.id)" @click="showUserDetail(u)" title="Xem chi tiết"><BaseIcon name="clipboard-list" style="width:13px;height:13px" /> Xem chi tiết</button>
                <button class="ban-btn" :class="u.isActive !== false ? 'ban-btn--active' : 'ban-btn--banned'" :disabled="isRowBusy(u.id) || isLastAdmin(u)" @click="toggleUserBan(u.id, u.isActive !== false)" title="Khóa/mở khóa">
                  <BaseIcon :name="u.isActive !== false ? 'unlock' : 'lock'" style="width:13px;height:13px" />
                  {{ u.isActive !== false ? 'Hoạt động' : 'Bị khóa' }}
                </button>
                <button class="btn-reset-password btn-impersonate" :disabled="isRowBusy(u.id)" @click="openResetPasswordModal(u)" title="Đặt lại mật khẩu"><BaseIcon name="shield" style="width:13px;height:13px" /> Đổi Pass</button>
                <button class="btn-impersonate" :disabled="isRowBusy(u.id)" @click="impersonateUser(u.id)" title="Đóng vai"><BaseIcon name="impersonate" style="width:14px;height:14px" /> Đóng vai</button>
                <!-- AD-022: nút Xóa vĩnh viễn class riêng btn-delete-danger (đỏ đậm + viền) + icon trash,
                     giữ ban-btn--banned vì test tìm theo class này; AD-023: disable cho admin cuối -->
                <button class="ban-btn ban-btn--banned btn-delete-danger flex items-center gap-1" :disabled="isRowBusy(u.id) || isLastAdmin(u)" @click="deleteUser(u.id, u.username)" title="Xóa tài khoản"><BaseIcon name="trash" style="width:11px;height:11px" /> Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-row">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><BaseIcon name="chevron-left" style="width:14px;height:14px" /> Trước</button>
        <span class="pagination-info">Trang {{ currentPage }} / {{ totalPages }}</span>
        <button class="pagination-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">Tiếp <BaseIcon name="chevron-right" style="width:14px;height:14px" /></button>
      </div>
    </div>
  </section>

  
  <!-- AD-028: modal chi tiết — role=dialog + aria-modal + focus trap + Escape -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showUserModal" class="user-modal-backdrop" role="dialog" aria-modal="true" aria-label="Chi tiết người dùng" @click.self="showUserModal = false" @keydown="onDetailModalKeydown">
        <div ref="detailModalCard" class="user-modal-card">
          <div class="user-modal-header">
            <div class="user-modal-avatar">{{ selectedUser?.username?.[0]?.toUpperCase() }}</div>
            <div class="user-modal-identity">
              <h2 class="user-modal-name">{{ selectedUser?.username }}</h2>
              <span class="user-modal-email">{{ selectedUser?.email }}</span>
              <span class="role-badge" :class="'role-badge--' + (selectedUser?.role?.toLowerCase() ?? 'student')">
                {{ selectedUser?.role === 'Admin' ? 'Quản trị viên' : selectedUser?.role === 'Teacher' ? 'Giảng viên' : 'Học viên' }}
              </span>
            </div>
            <button class="user-modal-close" aria-label="Đóng" @click="showUserModal = false">&times;</button>
          </div>
          <div class="user-modal-stats">
            <div class="modal-stat-item"><span class="modal-stat-val">{{ selectedUser?.totalXP ?? 0 }}</span><span class="modal-stat-label"><BaseIcon name="lightning" style="width:13px;height:13px" /> Tổng XP</span></div>
            <div class="modal-stat-item"><span class="modal-stat-val">{{ selectedUser?.currentLevel ?? 1 }}</span><span class="modal-stat-label"><BaseIcon name="trophy" style="width:13px;height:13px" /> Cấp độ</span></div>
            <div class="modal-stat-item"><span class="modal-stat-val">{{ selectedUser?.streakDays ?? 0 }}</span><span class="modal-stat-label"><BaseIcon name="fire" style="width:13px;height:13px" /> Streak</span></div>
            <div class="modal-stat-item"><span class="modal-stat-val" :class="selectedUser?.isPremium ? 'text-premium' : ''">{{ selectedUser?.isPremium ? 'Premium' : 'Miễn phí' }}</span><span class="modal-stat-label"><BaseIcon name="gem" style="width:13px;height:13px" /> Gói dịch vụ</span></div>
          </div>
          <div class="user-modal-details">
            <div class="modal-detail-row"><span class="modal-detail-label"><BaseIcon name="calendar" style="width:13px;height:13px" /> Ngày tham gia</span><span class="modal-detail-val">{{ selectedUser ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' }}</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label"><BaseIcon name="clock" style="width:13px;height:13px" /> Đăng nhập gần nhất</span><span class="modal-detail-val">{{ selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa có dữ liệu' }}</span></div>
          </div>
          <div class="user-modal-footer"><button class="btn-modal-close-secondary" @click="showUserModal = false">Đóng</button></div>
        </div>
      </div>
    </Transition>
  </Teleport>

  
  <!-- AD-028: modal tạo user — role=dialog + aria-modal + focus trap + Escape -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showCreateUserModal" class="user-modal-backdrop" role="dialog" aria-modal="true" aria-label="Tạo người dùng mới" @click.self="closeCreateUserModal" @keydown="onCreateModalKeydown">
        <div ref="createModalCard" class="user-modal-card">
          <div class="user-modal-header">
            <h2 class="user-modal-name text-text-primary">Tạo người dùng mới</h2>
            <button class="user-modal-close" aria-label="Đóng" @click="closeCreateUserModal">&times;</button>
          </div>
          <form @submit.prevent="submitCreateUser" class="modal-form mt-4">
            <div class="form-group mb-4"><label class="block text-xs font-bold text-text-muted mb-1.5 uppercase">Username</label><input v-model="createUserForm.username" type="text" class="form-control w-full" placeholder="Nhập username..." required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-text-muted mb-1.5 uppercase">Email</label><input v-model="createUserForm.email" type="email" class="form-control w-full" placeholder="example@visualizationdsa.dev" required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-text-muted mb-1.5 uppercase">Mật khẩu ban đầu</label><input v-model="createUserForm.password" type="password" class="form-control w-full" placeholder="Tối thiểu 8 ký tự..." required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-text-muted mb-1.5 uppercase">Vai trò (Role)</label><select v-model="createUserForm.role" class="form-control w-full"><option value="Student">Học viên</option><option value="Teacher">Giảng viên</option><option value="Admin">Quản trị viên</option></select></div>
            <div class="form-group mb-6 flex items-center gap-2"><input v-model="createUserForm.isPremium" type="checkbox" class="w-4 h-4 rounded border-border-default bg-bg-secondary/40 text-accent focus:ring-accent" /><label class="text-xs font-bold text-text-secondary select-none cursor-pointer">Kích hoạt tài khoản Premium</label></div>
            <div class="user-modal-footer"><button type="button" class="btn-modal-close-secondary mr-2" @click="closeCreateUserModal">Hủy bỏ</button><button type="submit" class="submit-btn" :disabled="submittingUser">{{ submittingUser ? 'Đang tạo...' : 'Tạo tài khoản' }}</button></div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  
  <!-- AD-028: modal đặt lại mật khẩu — role=dialog + aria-modal + focus trap + Escape -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showResetPasswordModal" class="user-modal-backdrop" role="dialog" aria-modal="true" aria-label="Đặt lại mật khẩu" @click.self="closeResetPasswordModal" @keydown="onResetModalKeydown">
        <div ref="resetModalCard" class="user-modal-card">
          <div class="user-modal-header">
            <div><h2 class="user-modal-name text-text-primary">Đặt lại mật khẩu</h2><p class="text-xs text-text-muted mt-1">Đổi mật khẩu cho: {{ targetUserForReset?.username }}</p></div>
            <button class="user-modal-close" aria-label="Đóng" @click="closeResetPasswordModal">&times;</button>
          </div>
          <form @submit.prevent="submitResetPassword" class="modal-form mt-4">
            <div class="form-group mb-6"><label class="block text-xs font-bold text-text-muted mb-1.5 uppercase">Mật khẩu mới</label><input v-model="resetPasswordForm.password" type="password" class="form-control w-full" placeholder="Tối thiểu 8 ký tự..." required /></div>
            <div class="user-modal-footer"><button type="button" class="btn-modal-close-secondary mr-2" @click="closeResetPasswordModal">Hủy</button><button type="submit" class="submit-btn" :disabled="submittingUser">{{ submittingUser ? 'Đang cập nhật...' : 'Xác nhận đổi' }}</button></div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch, type Ref } from 'vue';
import { useAdminApi } from './useAdminApi';
import { useToastStore } from '../../composables/useToast';
import type { StatelessAuthResponse } from '../../features/auth/services/statelessAuthApi';

const api = useAdminApi();
const { BASE_URL, authStore, getAuthHeaders, pushLog } = api;
const toastStore = useToastStore();

// AD-019: ưu tiên adminRequest (timeout 15s + 401→refresh→retry) của useAdminApi; fallback
// fetch thuần khi test mock module không cung cấp helper này.
const safeRequest: (url: string, init?: RequestInit) => Promise<Response> =
  api.adminRequest ?? ((url: string, init?: RequestInit) => fetch(url, { ...init, headers: { ...getAuthHeaders(), ...((init?.headers ?? {}) as Record<string, string>) } }));

interface UserItem { id: string; email: string; username: string; role: string; isPremium: boolean; isActive: boolean; totalXP: number; currentLevel: number; streakDays: number; createdAt: string; lastLogin: string; }

const usersList = ref<UserItem[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
// AD-015: tổng admin TOÀN HỆ THỐNG do backend trả về — không đếm theo trang hiện tại.
const totalAdmins = ref<number | null>(null);
// AD-016: tách state lỗi riêng — lỗi tải không hiển thị nhầm thành "Không tìm thấy người dùng".
const loadError = ref<string | null>(null);
const isLoadingUsers = ref(false);

// AD-018: in-flight guard theo từng dòng — chống double-click / 2 request song song.
const rowActionLoading = ref<Record<string, string>>({});
function isRowBusy(userId: string): boolean {
  return rowActionLoading.value[userId] !== undefined;
}
async function runRowAction(userId: string, actionKey: string, action: () => Promise<void>): Promise<void> {
  if (isRowBusy(userId)) return;
  rowActionLoading.value[userId] = actionKey;
  try {
    await action();
  } finally {
    delete rowActionLoading.value[userId];
  }
}

const isLastAdmin = (user: UserItem): boolean => user.role === 'Admin' && totalAdmins.value !== null && totalAdmins.value <= 1;

// AD-017: hủy request cũ khi load trang mới (chống race out-of-order ghi đè response).
let loadController: AbortController | null = null;

async function loadUsers(page: number = 1): Promise<void> {
  loadController?.abort();
  const controller = new AbortController();
  loadController = controller;
  isLoadingUsers.value = true;
  loadError.value = null;
  try {
    const searchParam = searchQuery.value ? `&search=${encodeURIComponent(searchQuery.value)}` : '';
    const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users?page=${page}&pageSize=${pageSize}${searchParam}`, { headers: getAuthHeaders(), signal: controller.signal });
    if (controller.signal.aborted) return;
    if (!res.ok) {
      // AD-016: lỗi API → toast tiếng Việt + state lỗi riêng (không hiển thị empty state).
      loadError.value = 'Không tải được danh sách người dùng từ máy chủ.';
      toastStore.error('Không tải được danh sách người dùng từ máy chủ.', 'Quản lý người dùng');
      return;
    }
    const data = await res.json() as { users?: UserItem[]; total?: number; page?: number; totalAdmins?: number };
    usersList.value = data.users ?? [];
    currentPage.value = data.page ?? page;
    totalPages.value = Math.max(1, Math.ceil((data.total ?? usersList.value.length) / pageSize));
    // AD-015: tổng admin toàn hệ thống từ API (getTotalAdmins) — không đếm theo trang.
    totalAdmins.value = data.totalAdmins ?? null;
  } catch {
    if (controller.signal.aborted) return;
    loadError.value = 'Lỗi kết nối khi tải danh sách người dùng.';
    toastStore.error('Lỗi kết nối khi tải danh sách người dùng.', 'Quản lý người dùng');
    pushLog('ERROR', 'Lỗi tải danh sách người dùng.');
  } finally {
    if (loadController === controller) {
      loadController = null;
      isLoadingUsers.value = false;
    }
  }
}

// AD-017: debounce 300ms — leading (phím gõ đầu tiên phản hồi ngay) + trailing (gõ liên tục
// chỉ gọi lại sau 300ms dừng gõ — chống flood request); AbortController hủy request cũ.
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSearchedQuery = '';

function onSearch(): void {
  const query = searchQuery.value;
  if (!searchDebounceTimer) {
    lastSearchedQuery = query;
    void loadUsers(1);
  }
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null;
    const latest = searchQuery.value;
    if (latest !== lastSearchedQuery) {
      lastSearchedQuery = latest;
      void loadUsers(1);
    }
  }, 300);
}

function changePage(page: number): void { if (page < 1 || page > totalPages.value) return; void loadUsers(page); }

// F3 (FR-1.8): duyệt/từ chối giảng viên đang chờ — tái dùng PUT users/{id}/role có sẵn.
async function approvePendingTeacher(userId: string): Promise<void> {
  await setPendingTeacherRole(userId, 'Teacher');
}

async function rejectPendingTeacher(userId: string): Promise<void> {
  await setPendingTeacherRole(userId, 'Student');
}

async function setPendingTeacherRole(userId: string, targetRole: 'Teacher' | 'Student'): Promise<void> {
  if (isRowBusy(userId)) return;
  const u = usersList.value.find(user => user.id === userId);
  const actionLabel = targetRole === 'Teacher' ? 'duyệt' : 'từ chối';
  if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản giảng viên ${u?.email || userId}?`)) return;
  await runRowAction(userId, 'role', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/role`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ role: targetRole }) });
      if (res.ok) {
        pushLog('INFO', `Đã ${actionLabel} giảng viên ${userId}`);
        toastStore.success(targetRole === 'Teacher' ? 'Đã duyệt tài khoản giảng viên.' : 'Đã từ chối tài khoản giảng viên.');
        await loadUsers(currentPage.value);
      } else {
        const err = await res.json().catch(() => null) as { message?: string } | null;
        toastStore.error(err?.message || `Lỗi ${actionLabel} tài khoản.`);
        await loadUsers(currentPage.value);
      }
    } catch {
      toastStore.error('Lỗi kết nối khi xử lý tài khoản giảng viên.');
      await loadUsers(currentPage.value);
    }
  });
}

async function changeUserRole(userId: string, event: Event): Promise<void> {
  if (isRowBusy(userId)) return;
  const select = event.target as HTMLSelectElement;
  const newRole = select.value;
  const u = usersList.value.find(user => user.id === userId);
  const oldRole = u ? u.role : '';
  if (!confirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng ${u?.email || userId} từ ${oldRole} thành ${newRole}?`)) { if (u) select.value = oldRole; return; }
  await runRowAction(userId, 'role', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/role`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ role: newRole }) });
      if (res.ok) {
        if (u) u.role = newRole;
        pushLog('INFO', `Đã cập nhật vai trò ${userId} thành ${newRole}`);
        toastStore.success('Đã cập nhật vai trò người dùng.');
        await loadUsers(currentPage.value);
      } else {
        const err = await res.json().catch(() => null) as { error?: string; message?: string } | null;
        if (err?.error === 'LAST_ADMIN_PROTECTED') {
          toastStore.warning('Không thể thay đổi vai trò của admin cuối cùng trong hệ thống!');
          if (u) select.value = oldRole;
        } else {
          pushLog('ERROR', `Lỗi cập nhật vai trò ${userId}`);
          toastStore.error(err?.message || 'Lỗi cập nhật quyền.');
          await loadUsers(currentPage.value);
        }
      }
    } catch {
      toastStore.error('Lỗi kết nối khi cập nhật role.');
      await loadUsers(currentPage.value);
    }
  });
}

async function toggleUserPremium(userId: string, currentStatus: boolean): Promise<void> {
  if (isRowBusy(userId)) return;
  const newStatus = !currentStatus;
  const u = usersList.value.find(user => user.id === userId);
  // AD-018: toggle premium bắt buộc xác nhận trước khi gửi request.
  if (!confirm(`Bạn có chắc chắn muốn ${newStatus ? 'bật' : 'tắt'} Premium cho tài khoản ${u?.email || userId}?`)) return;
  await runRowAction(userId, 'premium', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/premium`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ isPremium: newStatus }) });
      if (res.ok) {
        const found = usersList.value.find(user => user.id === userId);
        if (found) found.isPremium = newStatus;
        pushLog('INFO', `Đã ${newStatus ? 'bật' : 'tắt'} Premium cho ${userId}`);
        toastStore.success(`Đã ${newStatus ? 'bật' : 'tắt'} Premium cho người dùng.`);
      } else {
        toastStore.error('Lỗi bật tắt Premium.');
      }
    } catch {
      toastStore.error('Lỗi kết nối khi cập nhật Premium.');
    }
  });
}

async function toggleUserBan(userId: string, currentActive: boolean): Promise<void> {
  if (isRowBusy(userId)) return;
  const newActive = !currentActive;
  const action = newActive ? 'mở khóa' : 'khóa';
  if (!confirm(`Bạn có chắc muốn ${action} tài khoản này không?`)) return;
  await runRowAction(userId, 'ban', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/ban`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ isActive: newActive }) });
      if (res.ok) {
        const u = usersList.value.find(user => user.id === userId);
        if (u) u.isActive = newActive;
        pushLog('INFO', `Đã ${action} tài khoản ${userId}`);
        toastStore.success(`Đã ${action} tài khoản.`);
      } else {
        toastStore.error(`Lỗi khi ${action} tài khoản.`);
      }
    } catch {
      toastStore.error('Lỗi kết nối khi thay đổi trạng thái tài khoản.');
    }
  });
}

// AD-044: ủy quyền xử lý session cho store (impersonate/startImpersonating) — nhưng TEST
// adminP2Tests 'calls impersonate API when clicked' mock store.startImpersonating = vi.fn()
// (không fetch) và assert postCall POST /impersonate từ component — nên component phải giữ
// request, response được trao lại store qua authStore.impersonate(data) (StatelessAuthResponse).
// Tránh double-fetch bằng cách KHÔNG gọi thêm startImpersonating khi đã tự fetch.
async function impersonateUser(userId: string): Promise<void> {
  if (isRowBusy(userId)) return;
  const u = usersList.value.find(user => user.id === userId);
  if (!confirm('Bạn có chắc chắn muốn đóng vai người dùng này không?')) return;
  await runRowAction(userId, 'impersonate', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/impersonate`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json() as StatelessAuthResponse;
        await authStore.impersonate(data);
        pushLog('INFO', `Đóng vai thành công: ${data.user.email}`);
        toastStore.success(`Đang đóng vai ${data.user.username}.`);
        window.location.href = '/';
      } else {
        const err = await res.json().catch(() => null) as { message?: string } | null;
        toastStore.error(`Lỗi đóng vai: ${err?.message || 'Không xác định'}`, 'Đóng vai');
      }
    } catch {
      toastStore.error('Lỗi kết nối khi thực hiện đóng vai.', 'Đóng vai');
    }
  });
}

async function deleteUser(userId: string, username: string): Promise<void> {
  if (isRowBusy(userId)) return;
  if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${username}"?` + '\n\nHành động này sẽ xóa toàn bộ tiến độ học tập, bài thi, bình luận và dữ liệu liên quan. Không thể hoàn tác!')) return;
  await runRowAction(userId, 'delete', async () => {
    try {
      const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        toastStore.success('Đã xóa tài khoản thành công!');
        await loadUsers(currentPage.value);
        // AD-046: xóa user ở trang cuối → bảng trống → lùi về trang mới nhất còn dữ liệu.
        if (usersList.value.length === 0 && currentPage.value > 1) {
          await loadUsers(currentPage.value - 1);
        }
      } else {
        const err = await res.json().catch(() => null) as { message?: string } | null;
        toastStore.error(err?.message || 'Lỗi khi xóa người dùng.');
      }
    } catch {
      toastStore.error('Lỗi kết nối mạng.');
    }
  });
}

// AD-049: đổi tên "showUserAudit" → "Xem chi tiết".
function showUserDetail(user: UserItem): void { selectedUser.value = user; showUserModal.value = true; }
function openCreateUserModal(): void { Object.assign(createUserForm, { username: '', email: '', password: '', role: 'Student', isPremium: false }); showCreateUserModal.value = true; }
function closeCreateUserModal(): void { showCreateUserModal.value = false; }
function openResetPasswordModal(user: UserItem): void { targetUserForReset.value = user; resetPasswordForm.password = ''; showResetPasswordModal.value = true; }
function closeResetPasswordModal(): void { showResetPasswordModal.value = false; targetUserForReset.value = null; }

async function submitCreateUser(): Promise<void> {
  if (submittingUser.value) return; // AD-047: guard double-submit
  if (createUserForm.password.length < 8) { toastStore.warning('Mật khẩu tối thiểu 8 ký tự.'); return; }
  submittingUser.value = true;
  try {
    const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(createUserForm) });
    if (res.ok) {
      toastStore.success('Tạo người dùng mới thành công!');
      showCreateUserModal.value = false;
      await loadUsers(currentPage.value);
    } else {
      const err = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      toastStore.error(err?.message || err?.error || 'Lỗi khi tạo người dùng.');
    }
  } catch {
    toastStore.error('Lỗi kết nối mạng.');
  } finally {
    submittingUser.value = false;
  }
}

async function submitResetPassword(): Promise<void> {
  if (submittingUser.value) return; // AD-047: guard double-submit
  if (!targetUserForReset.value) return;
  if (resetPasswordForm.password.length < 8) { toastStore.warning('Mật khẩu tối thiểu 8 ký tự.'); return; }
  submittingUser.value = true;
  try {
    const res = await safeRequest(`${BASE_URL}/api/v1/concepts/admin/users/${targetUserForReset.value.id}/reset-password`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ newPassword: resetPasswordForm.password }) });
    if (res.ok) {
      toastStore.success('Đặt lại mật khẩu thành công!');
      showResetPasswordModal.value = false;
    } else {
      const err = await res.json().catch(() => null) as { message?: string } | null;
      toastStore.error(err?.message || 'Lỗi khi đặt lại mật khẩu.');
    }
  } catch {
    toastStore.error('Lỗi kết nối mạng.');
  } finally {
    submittingUser.value = false;
  }
}

const showUserModal = ref(false);
const selectedUser = ref<UserItem | null>(null);
const showCreateUserModal = ref(false);
const submittingUser = ref(false);
const createUserForm = reactive({ username: '', email: '', password: '', role: 'Student', isPremium: false });
const showResetPasswordModal = ref(false);
const targetUserForReset = ref<UserItem | null>(null);
const resetPasswordForm = reactive({ password: '' });

// AD-028: focus trap cho 3 modal — lưu element đang focus để khôi phục khi đóng.
let lastActiveElement: HTMLElement | null = null;
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function trapFocusIn(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) { event.preventDefault(); return; }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last || !container.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}

function setupModalFocus(visible: Ref<boolean>, cardRef: Ref<HTMLElement | null>): void {
  watch(visible, (isOpen) => {
    if (isOpen) {
      lastActiveElement = document.activeElement as HTMLElement | null;
      void nextTick(() => {
        const card = cardRef.value;
        if (card) getFocusableElements(card)[0]?.focus();
      });
    } else if (lastActiveElement && document.contains(lastActiveElement)) {
      lastActiveElement.focus();
    }
  });
}

const detailModalCard = ref<HTMLElement | null>(null);
const createModalCard = ref<HTMLElement | null>(null);
const resetModalCard = ref<HTMLElement | null>(null);

function onDetailModalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') { event.preventDefault(); showUserModal.value = false; return; }
  if (detailModalCard.value) trapFocusIn(detailModalCard.value, event);
}
function onCreateModalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') { event.preventDefault(); closeCreateUserModal(); return; }
  if (createModalCard.value) trapFocusIn(createModalCard.value, event);
}
function onResetModalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') { event.preventDefault(); closeResetPasswordModal(); return; }
  if (resetModalCard.value) trapFocusIn(resetModalCard.value, event);
}

setupModalFocus(showUserModal, detailModalCard);
setupModalFocus(showCreateUserModal, createModalCard);
setupModalFocus(showResetPasswordModal, resetModalCard);

onMounted(() => { void loadUsers(1); });

// Dọn debounce + hủy request đang treo khi rời tab (chống memory leak timer/fetch).
onBeforeUnmount(() => {
  if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); searchDebounceTimer = null; }
  loadController?.abort();
});
</script>

<style scoped>
/* AD-050: bảng users cuộn ngang trên màn hình hẹp + min-width giữ cột không vỡ */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.table-container .data-table {
  min-width: 760px;
}
/* AD-022: nút Xóa vĩnh viễn — đỏ đậm + viền, tách biệt nút Khóa */
.btn-delete-danger {
  background: color-mix(in srgb, var(--color-accent-red) 22%, transparent) !important;
  color: #ffd7d7 !important;
  border: 1px solid var(--color-accent-red) !important;
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-accent-red) 35%, transparent);
}
.btn-delete-danger:hover {
  background: color-mix(in srgb, var(--color-accent-red) 38%, transparent) !important;
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-red) 55%, transparent);
}
.btn-delete-danger:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
/* AD-055: caption ẩn về mặt thị giác nhưng vẫn đọc được bởi screen reader */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
