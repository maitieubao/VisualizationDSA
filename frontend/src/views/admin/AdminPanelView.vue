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

      
      <!-- AD-027: tablist chuẩn a11y — role=tab/aria-selected + phím ArrowLeft/ArrowRight -->
      <div
        ref="tabsNavRef"
        class="tabs-nav"
        role="tablist"
        aria-label="Khu vực quản trị"
        @keydown="onTabsKeydown"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.id }"
          role="tab"
          :id="'tab-' + tab.id"
          :aria-selected="activeTab === tab.id ? 'true' : 'false'"
          :aria-controls="'panel-' + tab.id"
          @click="setActiveTab(tab.id)"
        >
          <BaseIcon :name="tab.icon" style="width:16px;height:16px" />
          {{ tab.name }}
        </button>
      </div>
    </header>

    
    <div class="panel-content" role="tabpanel" :aria-labelledby="'tab-' + activeTab">
      <!-- AD-045: bỏ emit refresh-dashboard dead (tab v-if unmount → ref null) -->
      <AdminDashboardTab v-if="activeTab === 'dashboard'" />
      <AdminUsersTab v-else-if="activeTab === 'users'" />
      <AdminQuizzesTab v-else-if="activeTab === 'quizzes'" />
      <AdminSystemTab v-else-if="activeTab === 'system'" />
      <AdminAuditTab v-else-if="activeTab === 'audit'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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

const route = useRoute();
const router = useRouter();
const tabsNavRef = ref<HTMLElement | null>(null);

// AD-054: khôi phục tab từ query ?tab=... khi refresh — giữ trạng thái người dùng đang xem.
function readTabFromQuery(): string {
  const value = route.query.tab;
  return typeof value === 'string' && tabs.some(t => t.id === value) ? value : 'dashboard';
}

const activeTab = ref(readTabFromQuery());

// AD-054: lưu tab đang chọn vào route.query.tab để refresh không mất trạng thái.
function setActiveTab(tabId: string): void {
  activeTab.value = tabId;
  void router.replace({ query: { ...route.query, tab: tabId } });
}

// AD-027: điều hướng tab bằng phím ArrowLeft/ArrowRight (kèm focus theo).
function onTabsKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const currentIndex = tabs.findIndex(t => t.id === activeTab.value);
  if (currentIndex < 0) return;
  const delta = event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
  const nextTab = tabs[nextIndex];
  if (!nextTab) return;
  setActiveTab(nextTab.id);
  const buttons = tabsNavRef.value?.querySelectorAll<HTMLButtonElement>('.tab-btn');
  buttons?.[nextIndex]?.focus();
}

// AD-054: khi query thay đổi từ bên ngoài (back/forward) → đồng bộ lại tab đang hiển thị.
watch(() => route.query.tab, (value) => {
  const tabId = typeof value === 'string' && tabs.some(t => t.id === value) ? value : undefined;
  if (tabId && tabId !== activeTab.value) activeTab.value = tabId;
});
</script>

<style>
@import "./AdminPanelView.css";
</style>
