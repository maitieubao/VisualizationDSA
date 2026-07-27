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

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tài khoản</th><th>Vai trò</th><th>Tài khoản Premium</th>
              <th>Level</th><th>Tổng XP</th><th>Thao tác quản trị</th>
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
                <select :value="u.role" class="inline-select" @change="changeUserRole(u.id, $event)">
                  <option value="Student">Học viên</option>
                  <option value="Teacher">Giảng viên</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </td>
              <td>
                <button class="toggle-btn" :class="u.isPremium ? 'toggle-btn--active' : 'toggle-btn--inactive'" @click="toggleUserPremium(u.id, u.isPremium)">
                  <template v-if="u.isPremium">Premium <BaseIcon name="gem" style="width:13px;height:13px" /></template>
                  <template v-else>Miễn phí</template>
                </button>
              </td>
              <td><span class="level-badge">Lv.{{ u.currentLevel }}</span></td>
              <td>{{ u.totalXP }} XP</td>
              <td class="flex flex-wrap gap-1.5 items-center">
                <button class="btn-audit-detail" @click="showUserAudit(u)" title="Xem chi tiết"><BaseIcon name="clipboard-list" style="width:13px;height:13px" /> Xem</button>
                <button class="ban-btn" :class="u.isActive !== false ? 'ban-btn--active' : 'ban-btn--banned'" @click="toggleUserBan(u.id, u.isActive !== false)" title="Khóa/mở khóa">
                  <BaseIcon :name="u.isActive !== false ? 'unlock' : 'lock'" style="width:13px;height:13px" />
                  {{ u.isActive !== false ? 'Hoạt động' : 'Bị khóa' }}
                </button>
                <button class="btn-reset-password btn-impersonate" @click="openResetPasswordModal(u)" title="Đặt lại mật khẩu"><BaseIcon name="shield" style="width:13px;height:13px" /> Đổi Pass</button>
                <button class="btn-impersonate" @click="impersonateUser(u.id)" title="Đóng vai"><BaseIcon name="impersonate" style="width:14px;height:14px" /> Đóng vai</button>
                <button class="ban-btn ban-btn--banned flex items-center gap-1" @click="deleteUser(u.id, u.username)" title="Xóa tài khoản"><BaseIcon name="close" style="width:11px;height:11px" /> Xóa</button>
              </td>
            </tr>
            <tr v-if="usersList.length === 0"><td colspan="7" class="empty-table-text">Không tìm thấy người dùng nào.</td></tr>
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

  <!-- User Detail Modal -->
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

  <!-- Create User Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showCreateUserModal" class="user-modal-backdrop" @click.self="closeCreateUserModal">
        <div class="user-modal-card">
          <div class="user-modal-header">
            <h2 class="user-modal-name text-white">Tạo người dùng mới</h2>
            <button class="user-modal-close" @click="closeCreateUserModal">&times;</button>
          </div>
          <form @submit.prevent="submitCreateUser" class="modal-form mt-4">
            <div class="form-group mb-4"><label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Username</label><input v-model="createUserForm.username" type="text" class="form-control w-full" placeholder="Nhập username..." required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Email</label><input v-model="createUserForm.email" type="email" class="form-control w-full" placeholder="example@visualizationdsa.dev" required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Mật khẩu ban đầu</label><input v-model="createUserForm.password" type="password" class="form-control w-full" placeholder="Tối thiểu 8 ký tự..." required /></div>
            <div class="form-group mb-4"><label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Vai trò (Role)</label><select v-model="createUserForm.role" class="form-control w-full"><option value="Student">Học viên</option><option value="Teacher">Giảng viên</option><option value="Admin">Quản trị viên</option></select></div>
            <div class="form-group mb-6 flex items-center gap-2"><input v-model="createUserForm.isPremium" type="checkbox" class="w-4 h-4 rounded border-slate-700 bg-slate-950/40 text-indigo-500 focus:ring-indigo-500" /><label class="text-xs font-bold text-slate-300 select-none cursor-pointer">Kích hoạt tài khoản Premium</label></div>
            <div class="user-modal-footer"><button type="button" class="btn-modal-close-secondary mr-2" @click="closeCreateUserModal">Hủy bỏ</button><button type="submit" class="submit-btn" :disabled="submittingUser">{{ submittingUser ? 'Đang tạo...' : 'Tạo tài khoản' }}</button></div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Reset Password Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showResetPasswordModal" class="user-modal-backdrop" @click.self="closeResetPasswordModal">
        <div class="user-modal-card">
          <div class="user-modal-header">
            <div><h2 class="user-modal-name text-white">Đặt lại mật khẩu</h2><p class="text-xs text-slate-400 mt-1">Đổi mật khẩu cho: {{ targetUserForReset?.username }}</p></div>
            <button class="user-modal-close" @click="closeResetPasswordModal">&times;</button>
          </div>
          <form @submit.prevent="submitResetPassword" class="modal-form mt-4">
            <div class="form-group mb-6"><label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Mật khẩu mới</label><input v-model="resetPasswordForm.password" type="password" class="form-control w-full" placeholder="Tối thiểu 8 ký tự..." required /></div>
            <div class="user-modal-footer"><button type="button" class="btn-modal-close-secondary mr-2" @click="closeResetPasswordModal">Hủy</button><button type="submit" class="submit-btn" :disabled="submittingUser">{{ submittingUser ? 'Đang cập nhật...' : 'Xác nhận đổi' }}</button></div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';

const emit = defineEmits<{ (e: 'refresh-dashboard'): void }>();

const { BASE_URL, authStore, getAuthHeaders, pushLog } = useAdminApi();

interface UserItem { id: string; email: string; username: string; role: string; isPremium: boolean; isActive: boolean; totalXP: number; currentLevel: number; streakDays: number; createdAt: string; lastLogin: string; }

const usersList = ref<UserItem[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
const showUserModal = ref(false);
const selectedUser = ref<UserItem | null>(null);
const showCreateUserModal = ref(false);
const submittingUser = ref(false);
const createUserForm = reactive({ username: '', email: '', password: '', role: 'Student', isPremium: false });
const showResetPasswordModal = ref(false);
const targetUserForReset = ref<UserItem | null>(null);
const resetPasswordForm = reactive({ password: '' });

async function loadUsers(page: number = 1): Promise<void> {
  try {
    const searchParam = searchQuery.value ? `&search=${encodeURIComponent(searchQuery.value)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users?page=${page}&pageSize=${pageSize}${searchParam}`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    usersList.value = data.users || [];
    currentPage.value = data.page;
    totalPages.value = Math.ceil(data.total / pageSize) || 1;
  } catch { pushLog('ERROR', 'Lỗi tải danh sách người dùng.'); }
}

function onSearch(): void { loadUsers(1); }
function changePage(page: number): void { if (page < 1 || page > totalPages.value) return; loadUsers(page); }

async function changeUserRole(userId: string, event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement; const newRole = select.value;
  const u = usersList.value.find(user => user.id === userId); const oldRole = u ? u.role : '';
  if (!confirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng ${u?.email || userId} từ ${oldRole} thành ${newRole}?`)) { if (u) select.value = oldRole; return; }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/role`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ role: newRole }) });
    if (res.ok) { pushLog('INFO', `Đã cập nhật vai trò ${userId} thành ${newRole}`); if (u) u.role = newRole; emit('refresh-dashboard'); await loadUsers(currentPage.value); }
    else { pushLog('ERROR', `Lỗi cập nhật vai trò ${userId}`); alert('Lỗi cập nhật quyền.'); await loadUsers(currentPage.value); }
  } catch { alert('Lỗi kết nối khi cập nhật role.'); await loadUsers(currentPage.value); }
}

async function toggleUserPremium(userId: string, currentStatus: boolean): Promise<void> {
  const newStatus = !currentStatus;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/premium`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ isPremium: newStatus }) });
    if (res.ok) { const u = usersList.value.find(user => user.id === userId); if (u) u.isPremium = newStatus; pushLog('INFO', `Đã ${newStatus ? 'bật' : 'tắt'} Premium cho ${userId}`); emit('refresh-dashboard'); }
    else alert('Lỗi bật tắt Premium.');
  } catch { alert('Lỗi kết nối khi cập nhật Premium.'); }
}

async function toggleUserBan(userId: string, currentActive: boolean): Promise<void> {
  const newActive = !currentActive; const action = newActive ? 'mở khóa' : 'khóa';
  if (!confirm(`Bạn có chắc muốn ${action} tài khoản này không?`)) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/ban`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ isActive: newActive }) });
    if (res.ok) { const u = usersList.value.find(user => user.id === userId); if (u) u.isActive = newActive; pushLog('INFO', `Đã ${action} tài khoản ${userId}`); }
    else alert(`Lỗi khi ${action} tài khoản.`);
  } catch { alert('Lỗi kết nối khi thay đổi trạng thái tài khoản.'); }
}

async function impersonateUser(userId: string): Promise<void> {
  if (!confirm('Bạn có chắc chắn muốn đóng vai người dùng này không?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}/impersonate`, { method: 'POST', headers: getAuthHeaders() });
    if (res.ok) { const data = await res.json(); authStore.impersonate(data); pushLog('INFO', `Đóng vai thành công: ${data.user.email}`); alert(`Đang đóng vai ${data.user.username}.`); window.location.href = '/'; }
    else { const err = await res.json(); alert(`Lỗi đóng vai: ${err.message || 'Không xác định'}`); }
  } catch { alert('Lỗi kết nối khi thực hiện đóng vai.'); }
}

async function deleteUser(userId: string, username: string) {
  if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${username}"?`)) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { alert('Đã xóa tài khoản thành công!'); emit('refresh-dashboard'); await loadUsers(currentPage.value); }
    else { const err = await res.json(); alert(err.message || 'Lỗi khi xóa người dùng.'); }
  } catch { alert('Lỗi kết nối mạng.'); }
}

function showUserAudit(user: UserItem): void { selectedUser.value = user; showUserModal.value = true; }
function openCreateUserModal() { Object.assign(createUserForm, { username: '', email: '', password: '', role: 'Student', isPremium: false }); showCreateUserModal.value = true; }
function closeCreateUserModal() { showCreateUserModal.value = false; }
function openResetPasswordModal(user: UserItem) { targetUserForReset.value = user; resetPasswordForm.password = ''; showResetPasswordModal.value = true; }
function closeResetPasswordModal() { showResetPasswordModal.value = false; targetUserForReset.value = null; }

async function submitCreateUser() {
  if (createUserForm.password.length < 8) { alert('Mật khẩu tối thiểu 8 ký tự.'); return; }
  submittingUser.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(createUserForm) });
    if (res.ok) { alert('Tạo người dùng mới thành công!'); showCreateUserModal.value = false; emit('refresh-dashboard'); await loadUsers(currentPage.value); }
    else { const err = await res.json(); alert(err.message || 'Lỗi khi tạo người dùng.'); }
  } catch { alert('Lỗi kết nối mạng.'); } finally { submittingUser.value = false; }
}

async function submitResetPassword() {
  if (!targetUserForReset.value) return;
  if (resetPasswordForm.password.length < 8) { alert('Mật khẩu tối thiểu 8 ký tự.'); return; }
  submittingUser.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${targetUserForReset.value.id}/reset-password`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ newPassword: resetPasswordForm.password }) });
    if (res.ok) { alert('Đặt lại mật khẩu thành công!'); showResetPasswordModal.value = false; }
    else { const err = await res.json(); alert(err.message || 'Lỗi khi đặt lại mật khẩu.'); }
  } catch { alert('Lỗi kết nối mạng.'); } finally { submittingUser.value = false; }
}

onMounted(() => loadUsers(1));
</script>
