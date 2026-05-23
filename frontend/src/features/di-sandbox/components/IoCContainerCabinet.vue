<template>
  <div class="ioc-cabinet-container bg-[#0b0f19]/65 backdrop-blur-[20px] border border-white/[0.04] rounded-[28px] p-6 shadow-xl">
    <!-- Cabinet Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        IoC Container Cabinet
      </div>
      <span class="text-[10px] font-mono text-slate-500">
        {{ store.registrationList.length }} dịch vụ
      </span>
    </div>

    <!-- Two-Chamber Grid -->
    <div class="grid grid-cols-2 gap-5">
      <!-- Singleton Vault -->
      <div class="ioc-chamber singleton-vault-chamber rounded-[20px] p-5 border border-amber-500/[0.15] flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">Singleton Vault</span>
        </div>

        <div class="flex flex-col gap-2 min-h-[100px]">
          <div
            v-for="reg in singletonRegistrations"
            :key="reg.serviceType"
            class="ioc-instance-node-card lifecycle-singleton"
            :class="{ 'ring-2 ring-amber-400/50': isCurrentStepTarget(reg.serviceType) }"
          >
            <div class="text-[10px] font-bold text-amber-300 truncate">{{ reg.implementationType }}</div>
            <div class="text-[9px] text-slate-500 truncate">{{ reg.serviceType }}</div>
            <div v-if="isInstantiated(reg.serviceType)" class="flex items-center gap-1 mt-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span class="text-[8px] text-emerald-400">Khởi tạo</span>
            </div>
          </div>
          <div v-if="singletonRegistrations.length === 0" class="text-[10px] text-slate-600 italic text-center py-4">
            Chưa có Singleton
          </div>
        </div>
      </div>

      <!-- Transient Lab -->
      <div class="ioc-chamber transient-lab-chamber rounded-[20px] p-5 border border-slate-400/[0.15] flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]" />
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transient Lab</span>
        </div>

        <div class="flex flex-col gap-2 min-h-[100px]">
          <div
            v-for="reg in transientRegistrations"
            :key="reg.serviceType"
            class="ioc-instance-node-card lifecycle-transient"
            :class="{ 'ring-2 ring-slate-300/50': isCurrentStepTarget(reg.serviceType) }"
          >
            <div class="text-[10px] font-bold text-slate-300 truncate">{{ reg.implementationType }}</div>
            <div class="text-[9px] text-slate-500 truncate">{{ reg.serviceType }}</div>
            <div v-if="reg.dependencies.length > 0" class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="dep in reg.dependencies"
                :key="dep"
                class="text-[8px] px-1 py-0.5 rounded bg-slate-800 text-slate-500"
              >
                {{ dep }}
              </span>
            </div>
          </div>
          <div v-if="transientRegistrations.length === 0" class="text-[10px] text-slate-600 italic text-center py-4">
            Chưa có Transient
          </div>
        </div>
      </div>
    </div>

    <!-- Registry Table -->
    <div class="mt-5 bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
      <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
        <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
        </svg>
        Service Registry
      </div>
      <div class="space-y-1.5 font-mono text-[10px] max-h-[120px] overflow-y-auto">
        <div
          v-for="reg in store.registrationList"
          :key="reg.serviceType"
          class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full"
              :class="reg.lifetime === 'SINGLETON' ? 'bg-amber-400' : 'bg-slate-400'"
            />
            <span class="text-cyan-400">{{ reg.serviceType }}</span>
            <span class="text-slate-600">→</span>
            <span class="text-slate-300">{{ reg.implementationType }}</span>
          </div>
          <span
            class="px-1.5 py-0.5 rounded text-[9px] font-bold"
            :class="
              reg.lifetime === 'SINGLETON'
                ? 'bg-amber-950/50 text-amber-400'
                : 'bg-slate-800 text-slate-400'
            "
          >
            {{ reg.lifetime }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIoCDebuggerStore } from '../store/useIoCDebuggerStore';

const store = useIoCDebuggerStore();

const singletonRegistrations = computed(() =>
  store.registrationList.filter((r) => r.lifetime === 'SINGLETON'),
);

const transientRegistrations = computed(() =>
  store.registrationList.filter((r) => r.lifetime === 'TRANSIENT'),
);

function isInstantiated(serviceType: string): boolean {
  return serviceType in store.instancedSingletons;
}

function isCurrentStepTarget(serviceType: string): boolean {
  if (!store.currentStep) return false;
  return store.currentStep.serviceType === serviceType;
}
</script>

<style scoped>
.singleton-vault-chamber {
  background: radial-gradient(circle at top left, rgba(245, 158, 11, 0.04), transparent);
  box-shadow: inset 0 0 30px rgba(245, 158, 11, 0.03);
}

.transient-lab-chamber {
  background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.04), transparent);
  box-shadow: inset 0 0 30px rgba(148, 163, 184, 0.03);
}

.ioc-instance-node-card {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ioc-instance-node-card.lifecycle-singleton {
  border: 2px solid #F59E0B;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
}

.ioc-instance-node-card.lifecycle-transient {
  border: 2px solid #94A3B8;
  box-shadow: 0 0 15px rgba(148, 163, 184, 0.2);
}
</style>
