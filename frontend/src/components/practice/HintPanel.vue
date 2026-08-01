<template>
  <div class="hint-panel bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg w-80 flex-shrink-0 flex flex-col h-[500px]">
    
    <div class="bg-indigo-900/40 p-4 border-b border-indigo-500/20 flex items-center justify-between">
      <h3 class="text-indigo-300 font-bold flex items-center gap-2">
        <span>🤖</span> AI Assistant
      </h3>
      <div v-if="aiRequestsLeft !== null" class="text-xs font-semibold px-2 py-1 bg-indigo-950 rounded text-indigo-400">
        {{ aiRequestsLeft }} req left
      </div>
    </div>

    <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
      <div v-if="hints.length === 0" class="text-slate-500 text-sm text-center py-10">
        Đang gặp khó khăn? Hãy nhờ AI trợ giúp nhé!
      </div>
      
      <div v-for="(hint, index) in hints" :key="index" class="bg-slate-800 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
        <span class="text-indigo-400 font-bold mb-1 block text-xs uppercase tracking-wider">{{ hint.type }}</span>
        {{ hint.text }}
      </div>
    </div>

    <div class="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
      <button 
        @click="requestHint('hint1')" 
        :disabled="cooldown > 0 || requesting"
        class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded border border-slate-700 transition disabled:opacity-50 flex justify-between px-3"
      >
        <span>💡 Hint Cơ Bản</span>
        <span class="text-emerald-500 text-xs">Free</span>
      </button>

      <button 
        @click="requestHint('debug')" 
        :disabled="cooldown > 0 || requesting"
        class="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-sm font-semibold rounded border border-indigo-500/30 transition disabled:opacity-50 flex justify-between px-3"
      >
        <span>🐛 Tìm lỗi Code</span>
        <span class="text-amber-500 text-xs">Premium</span>
      </button>

      <div v-if="cooldown > 0" class="text-center text-xs text-rose-400 font-mono mt-2">
        ⏳ Đợi {{ cooldown }}s để hỏi tiếp...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const props = defineProps({
  nodeId: { type: String, required: true },
  sessionId: { type: String, required: true },
  step: { type: String, required: true }
});

const hints = ref<any[]>([]);
const requesting = ref(false);
const cooldown = ref(0);
const aiRequestsLeft = ref<number | null>(null);
let timer: any = null;

const startCooldown = (seconds: number) => {
  cooldown.value = seconds;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(timer);
  }, 1000);
};

const requestHint = async (type: string) => {
  requesting.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/v1/nodes/${props.nodeId}/hints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        sessionId: props.sessionId,
        step: props.step,
        hintType: type
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      hints.value.push({ type: type === 'hint1' ? 'Gợi ý' : 'Debug', text: data.hint });
      if (data.remainingAiRequests !== undefined) aiRequestsLeft.value = data.remainingAiRequests;
      startCooldown(data.cooldownSeconds || 10);
      
      // Auto scroll down logic would go here
    } else if (res.status === 429) {
      const data = await res.json();
      startCooldown(data.remainingCooldownSeconds || 10);
    } else {
      alert("Lỗi khi gọi AI");
    }
  } catch (e) {
    console.error(e);
  } finally {
    requesting.value = false;
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
