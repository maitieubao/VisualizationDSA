<template>
  <div class="lesson-discussion bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col h-full overflow-hidden text-slate-300">
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <h3 class="text-sm font-black text-white flex items-center gap-2">
        💬 THẢO LUẬN & HỎI ĐÁP
        <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
          {{ comments.length }} bình luận
        </span>
      </h3>
      <button 
        @click="loadComments" 
        class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        :disabled="loading"
      >
        {{ loading ? 'Đang làm mới...' : 'Làm mới ↻' }}
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-4 flex-shrink-0">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm trong thảo luận..."
          class="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 transition-colors"
          @input="debouncedSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4 flex-shrink-0">
      {{ error }}
    </div>

    <!-- Comments List Area -->
    <div class="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4 mb-4">
      <div v-if="loading && comments.length === 0" class="h-32 flex items-center justify-center text-xs text-slate-500">
        <div class="inline-block w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mr-2"></div>
        Đang tải các thảo luận...
      </div>

      <div v-else-if="rootComments.length === 0" class="h-32 flex flex-col items-center justify-center text-xs text-slate-500 text-center">
        <div class="text-2xl mb-1">💬</div>
        Chưa có thảo luận nào cho bài học này.
        <span class="text-[10px] text-slate-600 mt-0.5">Đặt câu hỏi đầu tiên của bạn ở dưới!</span>
      </div>

      <!-- Root Comment Rendering -->
      <div v-else v-for="comment in rootComments" :key="comment.id" class="space-y-3">
        <!-- Main Comment Card -->
        <div class="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <!-- Avatar placeholder based on first char of username -->
              <div class="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs capitalize">
                {{ comment.username.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white">{{ comment.username }}</span>
                  <!-- Role badge -->
                  <span 
                    v-if="comment.role === 'Admin'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/10 animate-pulse"
                  >
                    Admin
                  </span>
                  <span 
                    v-else-if="comment.role === 'Teacher'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/10"
                  >
                    Teacher
                  </span>
                  <span 
                    v-if="comment.isPremium" 
                    class="px-1 py-0.2 text-[8px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/10"
                  >
                    Premium
                  </span>
                </div>
                <span class="text-[9px] text-slate-500">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
          
          <div class="mt-3 flex items-center justify-end">
            <button 
              @click="toggleReplyForm(comment.id)" 
              class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-0.5"
            >
              ↩ Trả lời
            </button>
          </div>
        </div>

        <!-- Nested Replies -->
        <div class="pl-8 space-y-2 border-l border-indigo-500/10">
          <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] capitalize flex-shrink-0">
                {{ reply.username.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white">{{ reply.username }}</span>
                  <span 
                    v-if="reply.role === 'Admin'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/10"
                  >
                    Admin
                  </span>
                  <span 
                    v-else-if="reply.role === 'Teacher'" 
                    class="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/10"
                  >
                    Teacher
                  </span>
                </div>
                <span class="text-[8px] text-slate-500 block mb-1">{{ formatDate(reply.createdAt) }}</span>
                <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{{ reply.content }}</p>
              </div>
            </div>
          </div>

          <!-- Inline Reply Form -->
          <div v-if="replyingToId === comment.id" class="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-2">
            <textarea 
              v-model="replyText" 
              placeholder="Nhập nội dung câu trả lời..." 
              class="w-full h-16 bg-slate-950 border border-white/10 rounded-lg p-2 text-xs focus:border-indigo-500 focus:outline-none resize-none text-white"
            ></textarea>
            <div class="flex items-center justify-end gap-2">
              <button 
                @click="replyingToId = null" 
                class="px-2.5 py-1 text-[10px] bg-white/5 text-slate-400 font-bold rounded-lg border border-white/5 hover:bg-white/10 transition-all"
              >
                Hủy
              </button>
              <button 
                @click="submitComment(comment.id)" 
                :disabled="submitting || !replyText.trim()"
                class="px-3 py-1 text-[10px] bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {{ submitting ? 'Đang gửi...' : 'Gửi trả lời' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post New Discussion Form -->
    <div class="border-t border-white/10 pt-4 flex-shrink-0 space-y-2">
      <textarea 
        v-model="newCommentText" 
        placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến về bài học này..." 
        class="w-full h-20 bg-slate-950 border border-white/10 rounded-xl p-3 text-xs focus:border-indigo-500 focus:outline-none resize-none text-white scrollbar-none"
      ></textarea>
      <div class="flex items-center justify-between">
        <span class="text-[10px] text-slate-500">Tối đa 2000 ký tự. Vui lòng tôn trọng nội quy thảo luận.</span>
        <button 
          @click="submitComment(null)" 
          :disabled="submitting || !newCommentText.trim()"
          class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all text-xs disabled:opacity-50 shadow-lg shadow-indigo-600/10"
        >
          {{ submitting ? 'Đang gửi...' : 'Đăng thảo luận 💬' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';

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
      error.value = 'Không thể tải cuộc thảo luận.';
    }
  } catch (err) {
    error.value = 'Lỗi kết nối khi tải thảo luận.';
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
      error.value = errData.message ?? 'Đăng bình luận thất bại.';
    }
  } catch (err) {
    error.value = 'Lỗi kết nối khi đăng thảo luận.';
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
