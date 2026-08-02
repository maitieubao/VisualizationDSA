<template>
  <div class="admin-roadmap-approvals admin-tab-content">
    <div class="header-section">
      <h3>Duyệt Lộ trình Học tập (Roadmaps)</h3>
      <p>Danh sách các lộ trình khóa học do Giảng viên yêu cầu xuất bản ra hệ thống.</p>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Tên Lộ trình</th>
            <th>Giảng viên</th>
            <th>Thể loại</th>
            <th>Ngày yêu cầu</th>
            <th>Trạng thái</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rm in roadmaps" :key="rm.id">
            <td>
              <span class="font-bold text-text-primary">{{ rm.title }}</span>
            </td>
            <td>{{ rm.author }}</td>
            <td>
              <span class="px-2 py-1 bg-bg-hover rounded text-xs text-text-secondary">{{ rm.category }}</span>
            </td>
            <td>{{ new Date(rm.requestedAt).toLocaleDateString() }}</td>
            <td>
              <span class="px-2 py-1 rounded text-[10px] font-bold" 
                    :class="rm.status === 'Pending' ? 'bg-accent-warm/20 text-accent-warm' : 'bg-bg-hover text-text-secondary'">
                {{ rm.status }}
              </span>
            </td>
            <td class="text-right">
              <div class="flex gap-2 justify-end">
                <button @click="approveRoadmap(rm.id)" class="px-3 py-1 bg-accent-green hover:bg-accent-green text-text-primary rounded text-xs font-bold transition-colors">
                  Xuất bản
                </button>
                <button @click="rejectRoadmap(rm.id)" class="px-3 py-1 bg-accent-red hover:bg-accent-red text-text-primary rounded text-xs font-bold transition-colors">
                  Từ chối
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="roadmaps.length === 0">
            <td colspan="6" class="text-center py-8 text-text-muted">Không có lộ trình nào chờ duyệt.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const roadmaps = ref([
  { id: 'rm_1', title: 'Cấu trúc Dữ liệu Nâng cao', author: 'teacher_john', category: 'Data Structure', requestedAt: '2026-08-01T10:00:00Z', status: 'Pending' },
  { id: 'rm_2', title: 'Dynamic Programming Masterclass', author: 'teacher_jane', category: 'Algorithm', requestedAt: '2026-07-29T10:00:00Z', status: 'Pending' }
]);

function approveRoadmap(id: string) {
  roadmaps.value = roadmaps.value.filter(r => r.id !== id);
  alert('Đã duyệt và xuất bản Lộ trình.');
}

function rejectRoadmap(id: string) {
  roadmaps.value = roadmaps.value.filter(r => r.id !== id);
  alert('Đã từ chối Lộ trình.');
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
