<template>
  <div class="admin-panel max-w-[1280px] mx-auto">
    
    <header class="panel-header">
      <div class="header-main">
        <h1 class="panel-title">
          <BaseIcon name="shield" style="width:28px;height:28px;color:#f87171" />
          Hệ thống Quản trị Admin
          <span class="panel-title__badge">Super Admin</span>
        </h1>
        <p class="panel-subtitle">Quản lý toàn bộ người dùng, quyền hệ thống, dữ liệu quiz và theo dõi doanh thu thanh toán.</p>
      </div>

      
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

    
    <div class="panel-content">
      <AdminDashboardTab v-if="activeTab === 'dashboard'" ref="dashboardTabRef" />
      <AdminUsersTab v-else-if="activeTab === 'users'" @refresh-dashboard="refreshDashboard" />
      <AdminQuizzesTab v-else-if="activeTab === 'quizzes'" @refresh-dashboard="refreshDashboard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminDashboardTab from './AdminDashboardTab.vue';
import AdminUsersTab from './AdminUsersTab.vue';
import AdminQuizzesTab from './AdminQuizzesTab.vue';

interface Tab {
  id: string;
  name: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'dashboard', name: 'Tổng quan', icon: 'chart-bar' },
  { id: 'users', name: 'Người dùng & Giảng viên', icon: 'users' },
  { id: 'quizzes', name: 'Ngân hàng Quiz', icon: 'clipboard-list' }
];

const activeTab = ref('dashboard');
const dashboardTabRef = ref<InstanceType<typeof AdminDashboardTab> | null>(null);

function refreshDashboard() {
  if (dashboardTabRef.value) {
    dashboardTabRef.value.loadDashboardData();
  }
}
</script>

<style>
@import "./AdminPanelView.css";
</style>
