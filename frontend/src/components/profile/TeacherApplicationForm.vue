<template>
  <div class="teacher-application-form">
    <div v-if="loading" class="text-text-secondary">Đang tải thông tin...</div>
    
    <div v-else-if="application && application.status === 'Pending'" class="bg-accent-dark/40 p-4 rounded-lg border border-accent-dark">
      <h4 class="text-accent font-bold mb-2">Đơn đăng ký đang được xử lý</h4>
      <p class="text-sm text-text-secondary">
        Bạn đã gửi yêu cầu nâng cấp tài khoản Giáo viên vào ngày {{ formatDate(application.createdAt) }}. Vui lòng chờ Admin phê duyệt.
      </p>
    </div>

    <div v-else-if="application && application.status === 'Rejected'" class="bg-accent-red/20 p-4 rounded-lg border border-accent-red/40">
      <h4 class="text-accent-red font-bold mb-2">Đơn đăng ký bị từ chối</h4>
      <p class="text-sm text-text-secondary mb-2">
        <strong>Lý do:</strong> {{ application.rejectReason }}
      </p>
      <p class="text-xs text-text-secondary mb-4">Ngày từ chối: {{ formatDate(application.updatedAt || application.createdAt) }}</p>
      
      <!-- Only allow re-apply if > 30 days (logic handled by backend, but we can show form if allowed) -->
      <button @click="showForm = true" class="btn btn-secondary btn-sm" v-if="!showForm">
        Đăng ký lại
      </button>
    </div>

    <form v-if="!application || showForm" @submit.prevent="submitApplication" class="profile-form mt-4">
      <p class="text-sm text-text-secondary mb-4">
        Hãy đăng ký để trở thành Giáo viên! Bạn sẽ có quyền tạo Lộ trình học thuật riêng, tạo phòng học (Classroom) và theo dõi tiến độ của học sinh.
      </p>

      <div class="form-group">
        <label for="schoolName">Tên trường học / Tổ chức (Bắt buộc)</label>
        <input 
          id="schoolName"
          v-model="form.schoolName" 
          type="text" 
          placeholder="Nhập tên trường học..."
          class="form-control"
          required
          maxlength="200"
        />
      </div>

      <div class="form-group">
        <label for="cvUrl">Link CV / Hồ sơ (Bắt buộc)</label>
        <input 
          id="cvUrl"
          v-model="form.cvUrl" 
          type="url" 
          placeholder="https://..."
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="reason">Lý do muốn trở thành Giáo viên (Tối thiểu 50 ký tự)</label>
        <textarea 
          id="reason"
          v-model="form.reason" 
          placeholder="Hãy chia sẻ kinh nghiệm giảng dạy và mong muốn của bạn..."
          class="form-control form-textarea"
          rows="4"
          required
          minlength="50"
          maxlength="1000"
        ></textarea>
        <div class="text-xs text-right mt-1" :class="form.reason.length < 50 ? 'text-accent-red' : 'text-text-secondary'">
          {{ form.reason.length }} / 1000 ký tự (Tối thiểu 50)
        </div>
      </div>

      <div v-if="error" class="text-accent-red text-sm mb-3">
        {{ error }}
      </div>
      
      <div v-if="success" class="text-green-400 text-sm mb-3">
        Gửi đơn đăng ký thành công!
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary submit-btn"
          :disabled="isSubmitting || form.reason.length < 50"
        >
          <span v-if="isSubmitting">Đang gửi...</span>
          <span v-else>Gửi đơn đăng ký</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const authStore = useAuthStore();
const loading = ref(true);
const isSubmitting = ref(false);
const error = ref('');
const success = ref(false);
const showForm = ref(false);

const application = ref<any>(null);

const form = ref({
  schoolName: '',
  cvUrl: '',
  reason: ''
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const fetchApplication = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/v1/teacher-applications/my', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    });
    if (res.ok) {
      application.value = await res.json();
    } else if (res.status !== 404) {
      console.error('Failed to fetch teacher application', await res.text());
    }
  } catch (err) {
    console.error('Error fetching application:', err);
  } finally {
    loading.value = false;
  }
};

const submitApplication = async () => {
  if (form.value.reason.length < 50) {
    error.value = 'Lý do phải dài ít nhất 50 ký tự';
    return;
  }
  
  isSubmitting.value = true;
  error.value = '';
  success.value = false;
  
  try {
    const res = await fetch('/api/v1/teacher-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify(form.value)
    });
    
    if (res.ok) {
      application.value = await res.json();
      success.value = true;
      showForm.value = false;
    } else {
      const data = await res.json();
      error.value = data.message || 'Có lỗi xảy ra khi nộp đơn.';
    }
  } catch (err) {
    console.error('Submit error:', err);
    error.value = 'Không thể kết nối đến máy chủ.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchApplication();
});
</script>

<style scoped>
.teacher-application-form {
  margin-top: 1rem;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}
.form-control {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}
.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.form-textarea {
  resize: vertical;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
</style>
