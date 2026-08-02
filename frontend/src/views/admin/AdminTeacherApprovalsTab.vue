<template>
  <div class="admin-teacher-approvals admin-tab-content">
    <div class="header-section">
      <h3>Duyệt đơn Giảng viên</h3>
      <p>Danh sách các đơn đăng ký trở thành giảng viên chờ duyệt.</p>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Tài khoản</th>
            <th>Email</th>
            <th>Hồ sơ / Bio</th>
            <th>Ngày nộp đơn</th>
            <th>Trạng thái</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>
              <div class="flex items-center gap-2">
                <span class="font-bold text-text-primary">{{ app.username }}</span>
              </div>
            </td>
            <td>{{ app.email }}</td>
            <td class="max-w-xs truncate text-xs">{{ app.bio }}</td>
            <td>{{ new Date(app.appliedAt).toLocaleDateString() }}</td>
            <td>
              <span class="px-2 py-1 rounded text-[10px] font-bold" 
                    :class="app.status === 'Pending' ? 'bg-accent-warm/20 text-accent-warm' : 'bg-bg-hover text-text-secondary'">
                {{ app.status }}
              </span>
            </td>
            <td class="text-right">
              <div class="flex gap-2 justify-end">
                <button @click="approveApp(app.id)" class="px-3 py-1 bg-accent-green hover:bg-accent-green text-text-primary rounded text-xs font-bold transition-colors">
                  Duyệt
                </button>
                <button @click="rejectApp(app.id)" class="px-3 py-1 bg-accent-red hover:bg-accent-red text-text-primary rounded text-xs font-bold transition-colors">
                  Từ chối
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="applications.length === 0">
            <td colspan="6" class="text-center py-8 text-text-muted">Không có đơn nào chờ duyệt.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const applications = ref([
  { id: '1', username: 'pro_coder', email: 'pro@coder.com', bio: 'Senior Engineer at FPT, wants to teach DSA.', appliedAt: '2026-08-01T10:00:00Z', status: 'Pending' },
  { id: '2', username: 'algorithm_ninja', email: 'ninja@algo.com', bio: 'Competitive Programmer, ACM ICPC Finalist.', appliedAt: '2026-07-30T10:00:00Z', status: 'Pending' }
]);

function approveApp(id: string) {
  applications.value = applications.value.filter(a => a.id !== id);
  alert('Đã duyệt đơn đăng ký.');
}

function rejectApp(id: string) {
  applications.value = applications.value.filter(a => a.id !== id);
  alert('Đã từ chối đơn đăng ký.');
}
</script>

<style scoped>
.admin-tab-content { padding: 1.5rem; }
.header-section { margin-bottom: 1.5rem; }
.header-section h3 { font-size: 1.25rem; font-weight: bold; color: white; margin-bottom: 0.25rem; }
.header-section p { font-size: 0.875rem; color: #94a3b8; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.admin-table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
.admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }
</style>
