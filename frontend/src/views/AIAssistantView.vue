<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { api } from '@/services/apiClient';

const authStore = useAuthStore();
const messages = ref<{id: number; role: 'user' | 'ai'; text: string}[]>([
  { id: 1, role: 'ai', text: 'Chào bạn! Tôi là Trợ lý AI chuyên môn về Cấu trúc dữ liệu và Giải thuật. Bạn cần hỗ trợ bài toán hay muốn tôi Debug lỗi code nào hôm nay?' }
]);
const inputMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// Mock token logic (Assuming user has hintTokens in their profile, default to 5 if undefined for demo)
const hintTokens = computed(() => {
  return authStore.currentUser ? (authStore.currentUser as any).hintTokens ?? 5 : 0;
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return;
  
  if (hintTokens.value <= 0) {
    alert('Bạn đã hết AI Hint Token! Hãy vào Cửa hàng Gems để mua thêm nhé.');
    return;
  }

  const userMsg = inputMessage.value;
  messages.value.push({
    id: Date.now(),
    role: 'user',
    text: userMsg
  });
  inputMessage.value = '';
  isTyping.value = true;
  await scrollToBottom();

  // MOCK API CALL - Người dùng sẽ thay thế phần này bằng hàm fetch/axios thật
  try {
    const aiResponse = await api.post<{ content: string }>('/ai/chat', { prompt: userMsg });
    
    // Fake token deduction on frontend for UX (Backend should ideally return new token balance)
    if (authStore.currentUser) {
      (authStore.currentUser as any).hintTokens = hintTokens.value - 1;
    }

    messages.value.push({
      id: Date.now() + 1,
      role: 'ai',
      text: aiResponse.content
    });
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || '⚠️ Xin lỗi, kết nối đến Server AI đang gặp sự cố.';
    messages.value.push({
      id: Date.now() + 1,
      role: 'ai',
      text: errorMsg
    });
  } finally {
    isTyping.value = false;
    await scrollToBottom();
  }
};
</script>

<template>
  <div class="h-full w-full bg-slate-950 p-4 lg:p-6 flex flex-col items-center animate-fade-in relative overflow-hidden">
    
    <div class="w-full max-w-4xl flex-1 flex flex-col bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      
      <!-- Chat Header -->
      <div class="px-6 py-4 bg-slate-900/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
            <BaseIcon name="ai-assistant" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              Chuyên gia AI
              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </h2>
            <p class="text-xs text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-xs text-slate-400">Số dư Token</span>
            <div class="flex items-center gap-1 text-sm font-bold" :class="hintTokens > 0 ? 'text-amber-400' : 'text-rose-400'">
              <BaseIcon name="zap" class="w-4 h-4" />
              {{ hintTokens }} Token
            </div>
          </div>
          <button @click="$router.push('/gems-shop')" class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition" title="Mua thêm Token">
            <BaseIcon name="plus" class="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      <!-- Chat Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid-bg.svg')] bg-center bg-cover bg-no-repeat bg-fixed bg-opacity-5">
        
        <div v-for="msg in messages" :key="msg.id" class="flex w-full" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          
          <div v-if="msg.role === 'ai'" class="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mr-3 shrink-0 mt-1">
            <BaseIcon name="ai-assistant" class="w-4 h-4 text-indigo-400" />
          </div>

          <div 
            class="max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed"
            :class="msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20' 
              : 'bg-slate-800 border border-white/5 text-slate-200 rounded-tl-none shadow-md'"
          >
            <!-- In a real app, use v-html with a markdown parser like marked.js -->
            <p class="whitespace-pre-wrap">{{ msg.text }}</p>
          </div>

        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex w-full justify-start animate-fade-in">
          <div class="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mr-3 shrink-0">
            <BaseIcon name="ai-assistant" class="w-4 h-4 text-indigo-400" />
          </div>
          <div class="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-none px-4 py-4 flex items-center gap-1.5 shadow-md">
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 300ms;"></div>
          </div>
        </div>

      </div>

      <!-- Chat Input Area -->
      <div class="px-6 py-4 bg-slate-900 border-t border-white/10 shrink-0">
        <form @submit.prevent="sendMessage" class="relative flex items-end gap-3">
          <div class="flex-1 bg-slate-950 border border-slate-700 focus-within:border-indigo-500 rounded-xl overflow-hidden transition-colors shadow-inner flex flex-col">
            <textarea 
              v-model="inputMessage" 
              rows="2" 
              placeholder="Nhắn tin cho AI chuyên gia... (Có thể dán code vào đây)"
              class="w-full bg-transparent text-white px-4 py-3 outline-none resize-none text-sm placeholder:text-slate-500 custom-scrollbar"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>
            <div class="px-4 py-2 bg-slate-900/50 flex items-center justify-between border-t border-slate-800/50">
              <span class="text-[10px] text-slate-500 font-mono">Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
              <span class="text-[10px] text-slate-500 font-bold" :class="hintTokens > 0 ? '' : 'text-rose-400'">
                Phí: 1 Token / tin nhắn
              </span>
            </div>
          </div>
          <button 
            type="submit" 
            :disabled="isTyping || !inputMessage.trim() || hintTokens <= 0"
            class="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center"
          >
            <span class="hidden sm:inline-block mr-2">Gửi</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform rotate-45 mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
