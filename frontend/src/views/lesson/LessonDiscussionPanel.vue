<template>
  <div class="lesson-discussion bg-bg-surface border border-border-default rounded-3xl p-6 flex flex-col h-full overflow-hidden text-text-secondary">
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <h3 class="text-sm font-black text-text-primary flex items-center gap-2">
        <BaseIcon name="message-circle" class="w-4 h-4" /> THáº¢O LUáº¬N & Há»ŽI ÄÃP
        <span class="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">
          {{ comments.length }} bÃ¬nh luáº­n
        </span>
      </h3>
      <button 
        @click="loadComments" 
        class="text-xs text-accent hover:text-accent font-semibold transition-colors"
        :disabled="loading"
      >
        {{ loading ? 'Äang lÃ m má»›i...' : 'LÃ m má»›i' }} <BaseIcon v-if="!loading" name="refresh" class="w-3.5 h-3.5 inline-block ml-0.5 align-text-bottom" />
      </button>
    </div>

    
    <div class="mb-4 flex-shrink-0">
      <div class="relative">
        <BaseIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="TÃ¬m kiáº¿m trong tháº£o luáº­n..."
          class="w-full bg-bg-primary border border-border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:border-border-accent focus:outline-none text-text-primary placeholder:text-text-muted transition-colors"
          @input="debouncedSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors text-xs"
        >
          <BaseIcon name="close" class="w-3 h-3" />
        </button>
      </div>
    </div>

    
    <div v-if="error" class="p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs rounded-xl mb-4 flex-shrink-0">
      {{ error }}
    </div>

    
    <div class="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4 mb-4">
      <div v-if="loading && comments.length === 0" class="h-32 flex items-center justify-center text-xs text-text-muted">
        <div class="inline-block w-4 h-4 border-2 border-border-accent border-t-indigo-400 rounded-full animate-spin mr-2"></div>
        Äang táº£i cÃ¡c tháº£o luáº­n...
      </div>

      <div v-else-if="rootComments.length === 0" class="h-32 flex flex-col items-center justify-center text-xs text-text-muted text-center">
        <BaseIcon name="message-circle" class="w-8 h-8 mb-1 text-text-muted" />
        ChÆ°a cÃ³ tháº£o luáº­n nÃ o cho bÃ i há»c nÃ y.
        <span class="text-[10px] text-text-muted mt-0.5">Äáº·t cÃ¢u há»i Ä‘áº§u tiÃªn cá»§a báº¡n á»Ÿ dÆ°á»›i!</span>
      </div>

      
      <div v-else v-for="comment in rootComments" :key="comment.id" class="space-y-3">
        
        <div class="p-4 bg-bg-surface/[0.02] border border-border-default rounded-2xl hover:border-border-default transition-all">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              
              <div class="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs capitalize">
                {{ comment.username.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-text-primary">{{ comment.username }}</span>
                  
                  <span 
                    v-if="comment.role === 'Admin'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-accent-red/20 text-accent-red border border-accent-red/10 animate-pulse"
                  >
                    Admin
                  </span>
                  <span 
                    v-else-if="comment.role === 'Teacher'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-accent-warm/20 text-accent-warm border border-accent-warm/10"
                  >
                    Teacher
                  </span>
                  <span 
                    v-if="comment.isPremium" 
                    class="px-1 py-0.2 text-[8px] font-extrabold uppercase rounded bg-accent-green/20 text-accent-green border border-accent-green/10"
                  >
                    Premium
                  </span>
                </div>
                <span class="text-[9px] text-text-muted">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-text-secondary mt-2 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
          
          <div class="mt-3 flex items-center justify-end">
            <button 
              @click="toggleReplyForm(comment.id)" 
              class="text-[10px] text-accent hover:text-accent font-bold transition-colors flex items-center gap-0.5"
            >
              <BaseIcon name="arrow-right" class="w-3 h-3 inline-block rotate-180 mr-0.5 align-text-bottom" /> Tráº£ lá»i
            </button>
          </div>
        </div>

        
        <div class="pl-8 space-y-2 border-l border-border-accent/10">
          <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="p-3 bg-bg-surface/[0.01] border border-border-default rounded-xl">
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold text-[10px] capitalize flex-shrink-0">
                {{ reply.username.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-text-primary">{{ reply.username }}</span>
                  <span 
                    v-if="reply.role === 'Admin'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-accent-red/20 text-accent-red border border-accent-red/10"
                  >
                    Admin
                  </span>
                  <span 
                    v-else-if="reply.role === 'Teacher'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-accent-warm/20 text-accent-warm border border-accent-warm/10"
                  >
                    Teacher
                  </span>
                </div>
                <span class="text-[8px] text-text-muted block mb-1">{{ formatDate(reply.createdAt) }}</span>
                <p class="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{{ reply.content }}</p>
              </div>
            </div>
          </div>

          
          <div v-if="replyingToId === comment.id" class="p-3 bg-accent/5 border border-border-accent/15 rounded-xl space-y-2">
            <textarea 
              v-model="replyText" 
              placeholder="Nháº­p ná»™i dung cÃ¢u tráº£ lá»i..." 
              class="w-full h-16 bg-bg-primary border border-border-default rounded-lg p-2 text-xs focus:border-border-accent focus:outline-none resize-none text-text-primary"
            ></textarea>
            <div class="flex items-center justify-end gap-2">
              <button 
                @click="replyingToId = null" 
                class="px-2.5 py-1 text-[10px] bg-bg-surface text-text-secondary font-bold rounded-lg border border-border-default hover:bg-bg-surface transition-all"
              >
                Há»§y
              </button>
              <button 
                @click="submitComment(comment.id)" 
                :disabled="submitting || !replyText.trim()"
                class="px-3 py-1 text-[10px] bg-accent text-text-primary font-bold rounded-lg hover:bg-accent transition-all disabled:opacity-50"
              >
                {{ submitting ? 'Äang gá»­i...' : 'Gá»­i tráº£ lá»i' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="border-t border-border-default pt-4 flex-shrink-0 space-y-2">
      <textarea 
        v-model="newCommentText" 
        placeholder="Äáº·t cÃ¢u há»i hoáº·c chia sáº» Ã½ kiáº¿n vá» bÃ i há»c nÃ y..." 
        class="w-full h-20 bg-bg-primary border border-border-default rounded-xl p-3 text-xs focus:border-border-accent focus:outline-none resize-none text-text-primary scrollbar-none"
      ></textarea>
      <div class="flex items-center justify-between">
        <span class="text-[10px] text-text-muted">Tá»‘i Ä‘a 2000 kÃ½ tá»±. Vui lÃ²ng tÃ´n trá»ng ná»™i quy tháº£o luáº­n.</span>
        <button 
          @click="submitComment(null)" 
          :disabled="submitting || !newCommentText.trim()"
          class="px-4 py-2 bg-gradient-to-r from-accent to-accent-purple text-text-primary font-bold rounded-xl hover:from-accent hover:to-accent-purple transition-all text-xs disabled:opacity-50 shadow-lg shadow-indigo-600/10"
        >
          {{ submitting ? 'Äang gá»­i...' : 'ÄÄƒng tháº£o luáº­n' }} <BaseIcon v-if="!submitting" name="message-circle" class="w-3.5 h-3.5 inline-block ml-1 align-text-bottom" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

interface CommentDto {
  id: string;
  lessonId: string;
  userId: string;
  username: string;
  role: string;
  isPremium: boolean;
  content: string;
  createdAt: string;
  parentId: string | null;
}

const props = defineProps<{
  lessonId: string;
}>();

const authStore = useAuthStore();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const comments = ref<CommentDto[]>([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref('');

const replyingToId = ref<string | null>(null);
const replyText = ref('');
const newCommentText = ref('');
const searchQuery = ref('');
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const rootComments = computed(() => {
  return comments.value.filter(c => c.parentId === null);
});

function getReplies(commentId: string) {
  return comments.value.filter(c => c.parentId === commentId);
}

function toggleReplyForm(commentId: string) {
  if (replyingToId.value === commentId) {
    replyingToId.value = null;
    replyText.value = '';
  } else {
    replyingToId.value = commentId;
    replyText.value = '';
  }
}

async function loadComments() {
  loading.value = true;
  error.value = '';
  try {
    const headers: Record<string, string> = {};
    const token = authStore.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let url = `${BASE_URL}/api/v1/concepts/lessons/${props.lessonId}/comments`;
    if (searchQuery.value.trim()) {
      url += `?search=${encodeURIComponent(searchQuery.value.trim())}`;
    }

    const res = await fetch(url, { headers });
    if (res.ok) {
      comments.value = await res.json();
    } else {
      error.value = 'KhÃ´ng thá»ƒ táº£i cuá»™c tháº£o luáº­n.';
    }
  } catch (err) {
    error.value = 'Lá»—i káº¿t ná»‘i khi táº£i tháº£o luáº­n.';
  } finally {
    loading.value = false;
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadComments();
  }, 400);
}

function clearSearch() {
  searchQuery.value = '';
  loadComments();
}

async function submitComment(parentId: string | null = null) {
  const content = parentId ? replyText.value : newCommentText.value;
  if (!content.trim()) return;

  submitting.value = true;
  error.value = '';
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/v1/concepts/lessons/${props.lessonId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        parentId
      })
    });

    if (res.ok) {
      const data = await res.json();
      comments.value.push(data.comment);
      if (parentId) {
        replyingToId.value = null;
        replyText.value = '';
      } else {
        newCommentText.value = '';
      }
    } else {
      const errData = await res.json();
      error.value = errData.message ?? 'ÄÄƒng bÃ¬nh luáº­n tháº¥t báº¡i.';
    }
  } catch (err) {
    error.value = 'Lá»—i káº¿t ná»‘i khi Ä‘Äƒng tháº£o luáº­n.';
  } finally {
    submitting.value = false;
  }
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
