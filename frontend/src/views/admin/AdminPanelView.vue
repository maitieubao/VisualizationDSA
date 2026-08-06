<template>
  <div class="admin-panel">
    
    <header class="panel-header">
      <div class="header-main">
        <h1 class="panel-title">
          <BaseIcon name="shield" style="width:28px;height:28px;color:var(--color-accent-red)" />
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
      <AdminSystemTab v-else-if="activeTab === 'system'" />
      <AdminAuditTab v-else-if="activeTab === 'audit'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminDashboardTab from './AdminDashboardTab.vue';
import AdminUsersTab from './AdminUsersTab.vue';
import AdminQuizzesTab from './AdminQuizzesTab.vue';
import AdminSystemTab from './AdminSystemTab.vue';
import AdminAuditTab from './AdminAuditTab.vue';

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
  { id: 'audit', name: 'Nhật ký Quản trị', icon: 'shield' },
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
