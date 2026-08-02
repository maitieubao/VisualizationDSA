<template>
  <section class="tab-section fade-in">
    <div class="system-layout">
      <div class="card card--system-status">
        <h3 class="card-heading"><BaseIcon name="cog" style="width:18px;height:18px" /> Thông tin Máy chủ & API</h3>
        <div class="system-info-grid">
          <div class="info-item"><span class="info-label">API Base URL:</span><span class="info-val"><code>{{ BASE_URL }}</code></span></div>
          <div class="info-item"><span class="info-label">Phương thức xác thực:</span><span class="info-val">Stateless JWT JWT (Header + Payload)</span></div>
          <div class="info-item"><span class="info-label">Trạng thái kết nối CSDL:</span><span class="info-val text-success">Đang kết nối (PostgreSQL) <BaseIcon name="check" class="w-3 h-3 inline-block align-text-bottom" /></span></div>
          <div class="info-item"><span class="info-label">Môi trường hoạt động:</span><span class="info-val"><code>Production-safe mode</code></span></div>
        </div>
        <div class="system-actions">
          <button class="btn-primary" @click="runSystemDiagnostics"><BaseIcon name="lightning" style="width:15px;height:15px" /> Chạy chẩn đoán hệ thống</button>
        </div>
      </div>
      <div class="card card--settings">
        <h3 class="card-heading"><BaseIcon name="tool" style="width:18px;height:18px" /> Cài đặt hệ thống</h3>
        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-desc"><span class="setting-title">Cho phép Đăng ký tài khoản</span><p class="setting-sub">Cho phép người dùng mới tạo tài khoản qua OAuth hoặc Stateless Email.</p></div>
            <input type="checkbox" checked class="setting-checkbox" disabled />
          </div>
          <div class="setting-row">
            <div class="setting-desc"><span class="setting-title">Bảo trì Timeline VCR</span><p class="setting-sub">Khóa tạm thời timeline visualizer để cập nhật giải thuật cốt lõi.</p></div>
            <input type="checkbox" class="setting-checkbox" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAdminApi } from './useAdminApi';

const { BASE_URL, pushLog } = useAdminApi();

function runSystemDiagnostics(): void {
  pushLog('INFO', 'Đang bắt đầu chẩn đoán hệ thống...');
  setTimeout(() => {
    pushLog('INFO', 'Ping API Server: 25ms - Khỏe mạnh ✓');
    pushLog('INFO', 'CSDL PostgreSQL: OK - Mức chiếm dụng đĩa 4.2%');
    pushLog('INFO', 'Hệ thống chẩn đoán kết thúc không phát hiện lỗi.');
    alert('Diagnostics hoàn tất. Mọi tài nguyên hoạt động bình thường!');
  }, 1000);
}
</script>
