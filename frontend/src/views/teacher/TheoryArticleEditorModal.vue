<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingArticle ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">Tiêu đề <span class="text-accent-red">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="VD: Giới thiệu về thuật toán Quick Sort" required maxlength="200" />
            <p class="form-hint">{{ form.title.length }}/200 ký tự</p>
          </div>

          <div class="form-field">
            <label class="form-label">Slug (URL thân thiện) <span class="text-accent-red">*</span></label>
            <input v-model="form.slug" type="text" class="form-input" placeholder="gioi-thieu-thuat-toan-quick-sort" required maxlength="250" />
            <p class="form-hint">Chỉ chữ cái, số, dấu gạch ngang. Tự động tạo từ tiêu đề nếu để trống.</p>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Danh mục</label>
              <select v-model="form.category" class="form-select">
                <option value="">Chọn danh mục</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Độ khó</label>
              <select v-model="form.difficulty" class="form-select">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Tags (cách nhau bởi dấu phẩy)</label>
            <input v-model="form.tags" type="text" class="form-input" placeholder="quick-sort, sorting, algorithm, divide-conquer" />
          </div>

          <div class="form-field">
            <label class="form-label">Thời gian đọc ước tính (phút)</label>
            <input v-model.number="form.readTimeMinutes" type="number" class="form-input" min="1" max="120" />
          </div>

          <div class="form-field">
            <label class="form-label">Nội dung Markdown <span class="text-accent-red">*</span></label>
            <CustomMarkdownEditor v-model="form.contentMd" :placeholder="'Viết nội dung bài viết bằng Markdown...'" />
          </div>

          <div class="form-field">
            <label class="form-label flex items-center gap-2 cursor-pointer">
              <input v-model="form.isPublished" type="checkbox" class="form-checkbox" />
              <span>Xuất bản ngay sau khi lưu</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="spinner-sm"></span>
                Đang lưu...
              </span>
              <span v-else>{{ editingArticle ? 'Cập nhật' : 'Tạo bài viết' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';

interface Props {
  show: boolean;
  editingArticle: any | null;
  categories: string[];
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

const form = reactive({
  title: '',
  slug: '',
  category: '',
  difficulty: 'Beginner',
  tags: '',
  readTimeMinutes: 5,
  contentMd: '',
  isPublished: false
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    if (props.editingArticle) {
      const a = props.editingArticle;
      form.title = a.title;
      form.slug = a.slug;
      form.category = a.category || '';
      form.difficulty = a.difficulty || 'Beginner';
      form.tags = a.tags || '';
      form.readTimeMinutes = a.readTimeMinutes || 5;
      form.contentMd = a.contentMd || '';
      form.isPublished = a.isPublished || false;
    } else {
      form.title = '';
      form.slug = '';
      form.category = '';
      form.difficulty = 'Beginner';
      form.tags = '';
      form.readTimeMinutes = 5;
      form.contentMd = '';
      form.isPublished = false;
    }
  } else {
    
    form.title = '';
    form.slug = '';
    form.category = '';
    form.difficulty = 'Beginner';
    form.tags = '';
    form.readTimeMinutes = 5;
    form.contentMd = '';
    form.isPublished = false;
  }
});

watch(() => form.title, (newTitle) => {
  if (!form.slug || form.title === '') {
    form.slug = generateSlug(newTitle);
  }
});

async function handleSubmit() {
  if (!form.title.trim() || !form.contentMd.trim()) {
    alert('Tiêu đề và nội dung không được để trống');
    return;
  }
  if (!form.slug.trim()) {
    form.slug = generateSlug(form.title);
  }

  saving.value = true;
  try {
    await emit('save', { ...form });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@import "./TheoryArticleEditorModal.css";
</style>