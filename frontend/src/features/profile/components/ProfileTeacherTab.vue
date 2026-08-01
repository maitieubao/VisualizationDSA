<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
      <h3 class="text-2xl font-bold mb-2 flex items-center gap-2">
        <span>🎓</span> Trở thành Giảng viên
      </h3>
      <p class="text-gray-400 mb-8">Chia sẻ kiến thức của bạn và nhận được những đặc quyền riêng biệt (Vô hạn Tim, 50 Token AI/ngày).</p>

      <form @submit.prevent="submitApplication" class="space-y-6">
        
        <div class="space-y-2">
          <label class="font-medium text-gray-300">Nơi công tác / Trường học (Kinh nghiệm)</label>
          <textarea 
            v-model="appForm.experience" 
            required
            rows="3" 
            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
            placeholder="Vd: 3 năm giảng dạy tại trung tâm XYZ..."
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="font-medium text-gray-300">Lý do muốn tham gia</label>
          <textarea 
            v-model="appForm.reason" 
            required
            rows="3" 
            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
            placeholder="Tại sao bạn muốn trở thành giảng viên trên hệ thống của chúng tôi?"
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="font-medium text-gray-300">Tải lên CV (PDF/Image)</label>
          
          <div 
            class="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer"
            @click="cvInput?.click()"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
            @drop.prevent="handleCvDrop"
            :class="{'border-purple-500 bg-purple-500/10': dragover}"
          >
            <div v-if="!appForm.cvFile" class="flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div class="text-sm text-gray-400">
                <span class="text-purple-400 font-semibold">Nhấn để tải lên</span> hoặc Kéo thả file vào đây
              </div>
              <div class="text-xs text-gray-500">Chỉ hỗ trợ PDF (Max: 5MB)</div>
            </div>
            <div v-else class="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm font-medium text-white">{{ appForm.cvFile.name }}</div>
              <div class="text-xs text-gray-400">{{ (appForm.cvFile.size / 1024 / 1024).toFixed(2) }} MB</div>
              <button @click.stop="appForm.cvFile = null" class="mt-2 text-xs text-red-400 hover:text-red-300">Xóa file</button>
            </div>
            <input type="file" ref="cvInput" class="hidden" accept=".pdf" @change="handleCvUpload" />
          </div>
        </div>

        <div class="pt-6 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            :disabled="isSubmittingApp" 
            class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
          >
            {{ isSubmittingApp ? 'Đang gửi...' : 'Gửi Yêu Cầu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToastStore } from '@/composables/useToast';
import { api } from '@/services/apiClient';

const toastStore = useToastStore();

const cvInput = ref<HTMLInputElement | null>(null);
const dragover = ref(false);
const isSubmittingApp = ref(false);
const appForm = reactive({
  experience: '',
  reason: '',
  cvFile: null as File | null
});

const handleCvUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) return toastStore.error("File quá lớn (tối đa 5MB)");
  appForm.cvFile = file;
};

const handleCvDrop = (event: DragEvent) => {
  dragover.value = false;
  if (!event.dataTransfer?.files.length) return;
  const file = event.dataTransfer.files[0];
  if (file.size > 5 * 1024 * 1024) return toastStore.error("File quá lớn (tối đa 5MB)");
  appForm.cvFile = file;
};

const submitApplication = async () => {
  if (!appForm.cvFile) {
    return toastStore.error("Vui lòng tải lên CV của bạn");
  }
  
  isSubmittingApp.value = true;
  try {
    const fileData = new FormData();
    fileData.append('file', appForm.cvFile);
    
    const uploadRes = await api.post<any>('/upload/cv-document', fileData);
    
    if (!uploadRes.url) throw new Error("Không lấy được link CV");

    const payload = {
      SchoolName: appForm.experience,
      CvUrl: uploadRes.url,
      Reason: appForm.reason
    };

    await api.post('/teacher-applications', payload);
    toastStore.success('Đã gửi yêu cầu thành công! Chúng tôi sẽ xem xét sớm nhất.');
    
    appForm.experience = '';
    appForm.reason = '';
    appForm.cvFile = null;
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu');
  } finally {
    isSubmittingApp.value = false;
  }
};
</script>
