<template>
  <section class="tab-section fade-in">
    <div class="card card--audit-logs bg-bg-secondary/40 border border-border-subtle rounded-3xl p-6">
      <div class="card-header-row flex justify-between items-center mb-6">
        <h3 class="card-heading flex items-center gap-2 m-0 text-text-primary text-base font-black">
          <BaseIcon name="shield" style="width:18px;height:18px;color:#f87171" />
          Nhật ký Hoạt động Quản trị (Admin Audit Logs)
        </h3>
        <button class="btn-create-user flex items-center gap-1 bg-bg-hover border border-border-subtle px-3 py-1.5 rounded-xl text-xs text-white hover:bg-bg-hover transition-all font-bold cursor-pointer" @click="loadAuditLogs">
          Làm mới ↻
        </button>
      </div>

      <div class="table-container">
        <div v-if="loadingAuditLogs" class="loading-state py-12 text-center text-text-muted text-xs">
          <div class="spinner inline-block w-6 h-6 border-2 border-accent/20 border-t-indigo-400 rounded-full animate-spin mr-2"></div>
          Đang tải nhật ký kiểm toán...
        </div>
        <div v-else-if="auditLogsList.length === 0" class="empty-state py-12 text-center text-text-muted text-xs">
          Chưa ghi nhận hoạt động quản trị nào.
        </div>
        <div v-else class="table-responsive overflow-x-auto">
          <table class="data-table w-full text-left border-collapse">
            <thead>
              <tr class="text-text-muted text-xs border-b border-border-subtle">
                <th class="pb-3">Thời gian</th><th class="pb-3">Hành động</th>
                <th class="pb-3">Quản trị viên</th><th class="pb-3">Đối tượng tác động (Target ID)</th>
                <th class="pb-3">Chi tiết mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditLogsList" :key="log.id" class="border-b border-border-subtle text-xs hover:bg-white/[0.02] transition-colors">
                <td class="py-3 font-mono text-text-muted whitespace-nowrap">{{ formatAuditDate(log.createdAt) }}</td>
                <td class="py-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" :class="getAuditActionClass(log.action)">{{ log.action }}</span>
                </td>
                <td class="py-3 font-bold text-white">{{ log.actorName }} <span class="text-[10px] text-text-muted font-mono">({{ log.actorId.substring(0,8) }}...)</span></td>
                <td class="py-3 font-mono text-text-muted">{{ log.targetId ? log.targetId.substring(0,8) + '...' : '—' }}</td>
                <td class="py-3 text-text-secondary">{{ log.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';

const { BASE_URL, getAuthHeaders } = useAdminApi();

interface AuditLogItem { id: string; action: string; actorId: string; actorName: string; targetId: string | null; details: string; createdAt: string; }

const auditLogsList = ref<AuditLogItem[]>([]);
const loadingAuditLogs = ref(false);

async function loadAuditLogs() {
  loadingAuditLogs.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/audit-logs?page=1&pageSize=100`, { headers: getAuthHeaders() });
    if (res.ok) { const data = await res.json(); auditLogsList.value = data.logs ?? []; }
  } catch (err) { console.error('Failed to load audit logs:', err); }
  finally { loadingAuditLogs.value = false; }
}

function formatAuditDate(dateStr: string) {
  try { return new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return dateStr; }
}

function getAuditActionClass(action: string) {
  switch (action) {
    case 'CreateUser': return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
    case 'DeleteUser': return 'bg-accent-red/10 text-accent-red border border-accent-red/20';
    case 'ResetPassword': return 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20';
    case 'UpdateUserRole': return 'bg-accent/10 text-accent border border-accent/20';
    case 'TogglePremium': return 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20';
    case 'ImpersonateUser': return 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20';
    default: return 'bg-slate-500/10 text-text-muted border border-slate-500/20';
  }
}

onMounted(() => loadAuditLogs());
</script>
