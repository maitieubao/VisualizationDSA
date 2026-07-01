<template>
  <div class="ocp-panel flex flex-col gap-4">
    <!-- OCP Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="isExtended ? 'bg-accent-green' : 'bg-accent-yellow'" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          OCP — Open/Closed Principle
        </span>
      </div>
      <span
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
        :class="isExtended
          ? 'bg-accent-green/50 text-accent-green border border-accent-green/40'
          : 'bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/40'"
      >
        {{ isExtended ? 'EXTENDED ✓' : 'OPEN FOR EXTENSION' }}
      </span>
    </div>

    <!-- Concept Explainer -->
    <div class="ocp-explainer">
      <div class="ocp-rule">
        <span class="rule-icon open"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> OPEN</span>
        <span class="rule-text">Mở rộng hành vi bằng cách thêm Class chiến lược chiết khấu mới</span>
      </div>
      <div class="ocp-rule">
        <span class="rule-icon closed"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> CLOSED</span>
        <span class="rule-text">Đóng mã nguồn lõi DiscountCalculator tránh nguy cơ lỗi</span>
      </div>
    </div>

    <!-- Class Architecture Diagram -->
    <div class="ocp-diagram">
      <!-- High-level Client class -->
      <div class="ocp-client-class">
        <div class="class-header client">
          <span class="class-name">DiscountCalculator</span>
        </div>
        <div class="class-method font-mono">+ calculate(strategy: DiscountStrategy)</div>
      </div>

      <!-- Arrow down from client to interface -->
      <div class="ocp-client-arrow my-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-purple">
          <line x1="12" y1="0" x2="12" y2="20"/>
          <polyline points="7,15 12,20 17,15"/>
        </svg>
      </div>

      <!-- Base interface -->
      <div class="ocp-base-class">
        <div class="class-header abstract">
          <span class="class-type-badge">«interface»</span>
          <span class="class-name">DiscountStrategy</span>
        </div>
        <div class="class-method"><span class="method-abstract">+</span> calculate(amount): number</div>
      </div>

      <!-- Extension arrow -->
      <div class="ocp-extends-arrows">
        <svg width="100%" height="40" viewBox="0 0 300 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="ocp-arrow" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#10b981" fill-opacity="0.85" />
            </marker>
          </defs>
          <line x1="60" y1="35" x2="110" y2="5" stroke="#10b981" stroke-width="1.5" opacity="0.6" marker-end="url(#ocp-arrow)" />
          <line x1="150" y1="35" x2="150" y2="5" stroke="#10b981" stroke-width="1.5" opacity="0.6" marker-end="url(#ocp-arrow)" />
          <line x1="240" y1="35" x2="190" y2="5" stroke="#10b981" stroke-width="1.5" opacity="0.6" stroke-dasharray="4,2" marker-end="url(#ocp-arrow)" />
        </svg>
      </div>

      <!-- Concrete implementations -->
      <div class="ocp-impls">
        <div class="ocp-impl-class">
          <div class="class-header concrete"><span class="class-name">RegularDiscount</span></div>
          <div class="class-method impl">calculate() → 5%</div>
        </div>
        <div class="ocp-impl-class">
          <div class="class-header concrete"><span class="class-name">VIPDiscount</span></div>
          <div class="class-method impl">calculate() → 10%</div>
        </div>
        <div class="ocp-impl-class" :class="isExtended ? 'impl-new' : 'impl-inactive'">
          <div class="class-header new-class">
            <span v-if="isExtended" class="new-badge">NEW</span>
            <span class="class-name">{{ isExtended ? 'StudentDiscount' : '+ Extend' }}</span>
          </div>
          <div v-if="isExtended">
            <div class="class-method impl">calculate() → 15%</div>
          </div>
          <div v-else class="add-slot">Sắp thêm Student...</div>
        </div>
      </div>
    </div>

    <!-- Diagnostic Box -->
    <div
      class="text-xs font-medium px-4 py-2.5 rounded-xl backdrop-blur-md border"
      :class="isExtended
        ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
        : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30'"
    >
      {{ isExtended
        ? 'OCP đạt: Thêm StudentDiscount mà không cần sửa code cũ của DiscountCalculator.'
        : 'Nguyên lý: Lớp DiscountCalculator đóng đối với sửa đổi trực tiếp nhưng mở đối với việc mở rộng hành vi qua các chiến lược mới.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isExtended: boolean;
}>();
</script>

<style scoped>
.ocp-explainer {
  display: flex;
  gap: 10px;
}
.ocp-rule {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}
.rule-icon {
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.rule-icon.open { color: #10b981; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); }
.rule-icon.closed { color: #a78bfa; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); }
.rule-text { font-size: 11px; color: #94a3b8; }

.ocp-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 12px;
  background: rgba(15,23,42,0.4);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.ocp-client-class {
  width: 200px;
  border-radius: 10px;
  border: 1px solid rgba(147, 197, 253, 0.4);
  background: rgba(147, 197, 253, 0.08);
  overflow: hidden;
}

.class-header.client {
  background: rgba(147, 197, 253, 0.2);
  padding: 6px 12px;
  text-align: center;
}

.ocp-base-class {
  width: 200px;
  border-radius: 10px;
  border: 1px solid rgba(167,139,250,0.4);
  background: rgba(139,92,246,0.08);
  overflow: hidden;
}
.class-header {
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.class-header.abstract { background: rgba(139,92,246,0.2); }
.class-header.concrete { background: rgba(6,182,212,0.1); }
.class-header.new-class { background: rgba(16,185,129,0.12); }
.class-type-badge {
  font-size: 9px;
  color: #a78bfa;
  font-style: italic;
}
.class-name {
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: var(--font-mono);
}
.new-badge {
  font-size: 9px;
  font-weight: 800;
  color: #10b981;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.4);
  border-radius: 4px;
  padding: 1px 5px;
}
.class-method {
  padding: 3px 12px;
  font-size: 10px;
  color: #64748b;
  border-top: 1px solid rgba(255,255,255,0.05);
  font-family: var(--font-mono);
}
.class-method.impl { color: #06b6d4; }
.method-abstract { color: #a78bfa; margin-right: 4px; }

.ocp-extends-arrows { width: 300px; }

.ocp-impls {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.ocp-impl-class {
  width: 120px;
  border-radius: 8px;
  border: 1px solid rgba(6,182,212,0.3);
  background: rgba(6,182,212,0.06);
  overflow: hidden;
  transition: all 0.4s ease;
}
.impl-new {
  border-color: rgba(16,185,129,0.5) !important;
  background: rgba(16,185,129,0.08) !important;
  box-shadow: 0 0 16px rgba(16,185,129,0.2);
  animation: pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
.impl-inactive {
  border-color: rgba(255,255,255,0.08) !important;
  background: rgba(255,255,255,0.02) !important;
  opacity: 0.6;
}
.add-slot {
  padding: 8px;
  font-size: 10px;
  color: #475569;
  text-align: center;
  font-style: italic;
}
@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
