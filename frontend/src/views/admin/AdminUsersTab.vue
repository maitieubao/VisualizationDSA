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

      <div class="overflow-x-auto rounded-xl border border-border-default/50 bg-bg-surface shadow-xl mt-4">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-bg-surface border-b border-border-default">
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tài khoản</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Vai trò</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Trạng thái Premium</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Cấp độ</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tổng XP</th>
              <th class="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Thao tác quản trị</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-for="u in usersList" :key="u.id" class="hover:bg-bg-hover/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-text-primary font-bold shadow-md">
                    {{ u.username[0].toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-text-primary text-sm">{{ u.username }}</span>
                    <span class="text-xs text-text-secondary">{{ u.email }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <select :value="u.role" class="bg-bg-hover border border-border-default text-text-secondary text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-accent/50 outline-none transition-all" @change="changeUserRole(u.id, $event)">
                  <option value="Student">Học viên</option>
                  <option value="Teacher">Giảng viên</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <button 
                  class="px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5" 
                  :class="u.isPremium ? 'bg-accent-warm/20 text-accent-warm border border-accent-warm/30 hover:bg-accent-warm/30' : 'bg-bg-hover text-text-secondary border border-border-default hover:bg-bg-hover'" 
                  @click="toggleUserPremium(u.id, u.isPremium)"
                >
                  <template v-if="u.isPremium">
                    <span>Premium</span>
                    <BaseIcon name="gem" class="w-3 h-3" />
                  </template>
                  <template v-else>Miễn phí</template>
                </button>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-bold border border-border-accent">
                  Lv.{{ u.currentLevel }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono font-bold text-accent-purple text-sm">
                {{ u.totalXP.toLocaleString() }} XP
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <button class="p-1.5 rounded-lg bg-bg-hover text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors" @click="showUserAudit(u)" title="Xem chi tiết">
                    <BaseIcon name="clipboard-list" class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 rounded-lg transition-colors" :class="u.isActive !== false ? 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20' : 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'" @click="toggleUserBan(u.id, u.isActive !== false)" :title="u.isActive !== false ? 'Đang hoạt động (Nhấn để khóa)' : 'Đã khóa (Nhấn để mở)'">
                    <BaseIcon :name="u.isActive !== false ? 'unlock' : 'lock'" class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors" @click="openResetPasswordModal(u)" title="Đặt lại mật khẩu">
                    <BaseIcon name="shield" class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors" @click="impersonateUser(u.id)" title="Đóng vai người dùng">
                    <BaseIcon name="impersonate" class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-text-primary transition-colors ml-2" @click="deleteUser(u.id, u.username)" title="Xóa tài khoản vĩnh viễn">
                    <BaseIcon name="trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="usersList.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-text-muted">
                <BaseIcon name="users" class="w-12 h-12 mx-auto mb-3 opacity-20" />
                Không tìm thấy người dùng nào.
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

  
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showCreateUserModal" class="user-modal-backdrop" @click.self="closeCreateUserModal">
        <div class="user-modal-card">
          <div class="user-modal-header">
            <h2 class="user-modal-name text-text-primary">Tạo người dùng mới</h2>
            <button class="user-modal-close" @click="closeCreateUserModal">&times;</button>
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

  
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showResetPasswordModal" class="user-modal-backdrop" @click.self="closeResetPasswordModal">
        <div class="user-modal-card">
          <div class="user-modal-header">
            <div><h2 class="user-modal-name text-white">Đặt lại mật khẩu</h2><p class="text-xs text-text-muted mt-1">Đổi mật khẩu cho: {{ targetUserForReset?.username }}</p></div>
            <button class="user-modal-close" @click="closeResetPasswordModal">&times;</button>
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
