<template>
  <section class="tab-section fade-in">
    <div class="system-layout">
      <div class="card card--system-status">
        <h3 class="card-heading"><BaseIcon name="cog" style="width:18px;height:18px" /> Thông tin Máy chủ & API</h3>
        <div class="system-info-grid">
          <div class="info-item"><span class="info-label">API Base URL:</span><span class="info-val"><code>{{ BASE_URL }}</code></span></div>
          <div class="info-item"><span class="info-label">Phương thức xác thực:</span><span class="info-val">Stateless JWT (Header + Payload)</span></div>
          <div class="info-item">
            <span class="info-label">Trạng thái kết nối CSDL:</span>
            <span class="info-val" :class="{ 'text-success': dbState === 'connected' }" :style="dbState === 'error' ? 'color: var(--color-accent-red)' : undefined">
              <template v-if="dbState === 'checking'">Đang kết nối (PostgreSQL) — đang xác minh...</template>
              <template v-else-if="dbState === 'connected'">Đang kết nối (PostgreSQL) <BaseIcon name="check" style="width:12px;height:12px" /> <span v-if="dbLatency !== null">(phản hồi {{ dbLatency }}ms)</span></template>
              <template v-else-if="dbState === 'error'">Mất kết nối (PostgreSQL) <BaseIcon name="warning" style="width:12px;height:12px" /></template>
              <template v-else>Không xác minh được (API /health không phản hồi)</template>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Môi trường hoạt động:</span>
            <span class="info-val"><code>{{ envLabel }}</code></span>
          </div>
        </div>
        <p class="system-note mt-3 text-[11px] text-text-muted">
          Số liệu trạng thái được đo thật từ endpoint <code>/health</code> và <code>/api/v1/diagnostics/health</code> của hệ thống (không phải dữ liệu mẫu).
        </p>
        <div class="system-actions">
          <button class="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="running" @click="runSystemDiagnostics">
            <BaseIcon v-if="running" name="spinner" class="animate-spin" style="width:15px;height:15px" />
            <BaseIcon v-else name="lightning" style="width:15px;height:15px" />
            {{ running ? 'Đang chạy chẩn đoán...' : 'Chạy chẩn đoán hệ thống' }}
          </button>
        </div>
        <div v-if="diagResults.length > 0" class="diag-results mt-4 rounded-xl border border-border-subtle p-3 font-mono text-xs space-y-1" style="background: var(--color-bg-terminal)">
          <div v-for="(line, idx) in diagResults" :key="idx" class="diag-line">
            <span class="console-tag console-tag--INFO">DIAG</span>
            <span class="console-msg">{{ line }}</span>
          </div>
        </div>
      </div>
      <div class="card card--settings">
        <h3 class="card-heading"><BaseIcon name="tool" style="width:18px;height:18px" /> Cài đặt hệ thống</h3>
        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-desc"><span class="setting-title">Cho phép Đăng ký tài khoản <span class="tag-topic">Sắp có</span></span><p class="setting-sub">Cho phép người dùng mới tạo tài khoản qua OAuth hoặc Stateless Email.</p></div>
            <input type="checkbox" checked class="setting-checkbox" disabled title="Sắp có — tính năng tùy chỉnh này đang phát triển" />
          </div>
          <div class="setting-row">
            <div class="setting-desc"><span class="setting-title">Bảo trì Timeline VCR <span class="tag-topic">Sắp có</span></span><p class="setting-sub">Khóa tạm thời timeline visualizer để cập nhật giải thuật cốt lõi.</p></div>
            <input type="checkbox" class="setting-checkbox" disabled title="Sắp có — tính năng tùy chỉnh này đang phát triển" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAdminApi } from './useAdminApi';
import { useToastStore } from '../../composables/useToast';

const { BASE_URL, getAuthHeaders, pushLog } = useAdminApi();
const toastStore = useToastStore();

interface HealthCheckItem { name: string; status: string; latency: number; }
interface HealthReport { status?: string; checks?: HealthCheckItem[]; totalDuration?: number; }
interface DiagnosticsHealth { success?: boolean; message?: string; environment?: string; }

type DbState = 'checking' | 'connected' | 'error' | 'unknown';

const dbState = ref<DbState>('checking');
const dbLatency = ref<number | null>(null);
const envLabel = ref('Đang xác minh...');
const running = ref(false);
const diagResults = ref<string[]>([]);

let alive = true;

async function fetchDbHealth(): Promise<{ state: DbState; latency: number | null }> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { headers: getAuthHeaders() });
    if (!res.ok) return { state: 'unknown', latency: null };
    const data = await res.json() as HealthReport;
    if (data.status === 'Healthy') {
      const dbCheck = (data.checks ?? []).find(c => c.name.toLowerCase().includes('database'));
      return { state: 'connected', latency: dbCheck ? Math.round(dbCheck.latency) : Math.round(data.totalDuration ?? 0) };
    }
    if (data.status === 'Unhealthy') return { state: 'error', latency: null };
    return { state: 'unknown', latency: null };
  } catch {
    return { state: 'unknown', latency: null };
  }
}

async function fetchEnvironment(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/diagnostics/health`, { headers: getAuthHeaders() });
    if (!res.ok) return 'Không xác định';
    const data = await res.json() as DiagnosticsHealth;
    return data.environment || 'Không xác định';
  } catch {
    return 'Không xác định';
  }
}

async function loadSystemHealth(): Promise<void> {
  const [dbResult, environment] = await Promise.all([fetchDbHealth(), fetchEnvironment()]);
  if (!alive) return;
  dbState.value = dbResult.state;
  dbLatency.value = dbResult.latency;
  envLabel.value = environment;
}

async function runSystemDiagnostics(): Promise<void> {
  if (running.value) return;
  running.value = true;
  diagResults.value = [];
  pushLog('INFO', 'Đang bắt đầu chẩn đoán hệ thống...');
  try {
    const [dbResult, environment] = await Promise.all([fetchDbHealth(), fetchEnvironment()]);
    if (!alive) return;
    const apiLine = dbResult.state === 'connected'
      ? `API Server: Khỏe mạnh (phản hồi ${dbResult.latency ?? 0}ms) ✓`
      : dbResult.state === 'error'
        ? 'API Server: Phản hồi nhưng CSDL mất kết nối ✗'
        : 'API Server: Không xác minh được (thiếu phản hồi /health)';
    const dbLine = dbResult.state === 'connected'
      ? 'CSDL PostgreSQL: OK (kết nối thành công)'
      : dbResult.state === 'error'
        ? 'CSDL PostgreSQL: Mất kết nối ✗'
        : 'CSDL PostgreSQL: Không xác minh được';
    diagResults.value = [
      apiLine,
      dbLine,
      `Môi trường hoạt động: ${environment}`,
      'Hệ thống chẩn đoán kết thúc.'
    ];
    toastStore.success('Chẩn đoán hoàn tất — kết quả dựa trên phản hồi thật của /health.', 'Chẩn đoán hệ thống');
  } catch {
    if (!alive) return;
    diagResults.value = ['Chẩn đoán thất bại — không nhận được phản hồi từ API.'];
    toastStore.error('Không nhận được phản hồi từ API khi chạy chẩn đoán.', 'Chẩn đoán hệ thống');
  } finally {
    if (alive) running.value = false;
  }
}

onMounted(() => loadSystemHealth());
onBeforeUnmount(() => { alive = false; });
</script>
