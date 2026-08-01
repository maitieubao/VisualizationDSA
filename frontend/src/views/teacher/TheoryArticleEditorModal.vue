<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingArticle ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingArticle ? 'Chá»‰nh sá»­a bÃ i viáº¿t' : 'Táº¡o bÃ i viáº¿t má»›i' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">TiÃªu Ä‘á» <span class="text-rose-400">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="VD: Giá»›i thiá»‡u vá» thuáº­t toÃ¡n Quick Sort" required maxlength="200" />
            <p class="form-hint">{{ form.title.length }}/200 kÃ½ tá»±</p>
          </div>

          <div class="form-field">
            <label class="form-label">Slug (URL thÃ¢n thiá»‡n) <span class="text-rose-400">*</span></label>
            <input v-model="form.slug" type="text" class="form-input" placeholder="gioi-thieu-thuat-toan-quick-sort" required maxlength="250" />
            <p class="form-hint">Chá»‰ chá»¯ cÃ¡i, sá»‘, dáº¥u gáº¡ch ngang. Tá»± Ä‘á»™ng táº¡o tá»« tiÃªu Ä‘á» náº¿u Ä‘á»ƒ trá»‘ng.</p>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Danh má»¥c</label>
              <select v-model="form.category" class="form-select">
                <option value="">Chá»n danh má»¥c</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Äá»™ khÃ³</label>
              <select v-model="form.difficulty" class="form-select">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Tags (cÃ¡ch nhau bá»Ÿi dáº¥u pháº©y)</label>
            <input v-model="form.tags" type="text" class="form-input" placeholder="quick-sort, sorting, algorithm, divide-conquer" />
          </div>

          <div class="form-field">
            <label class="form-label">Thá»i gian Ä‘á»c Æ°á»›c tÃ­nh (phÃºt)</label>
            <input v-model.number="form.readTimeMinutes" type="number" class="form-input" min="1" max="120" />
          </div>

          <div class="form-field">
            <label class="form-label">Ná»™i dung Markdown <span class="text-rose-400">*</span></label>
            <CustomMarkdownEditor v-model="form.contentMd" :placeholder="'Viáº¿t ná»™i dung bÃ i viáº¿t báº±ng Markdown...'" />
          </div>

          <div class="form-field">
            <label class="form-label flex items-center gap-2 cursor-pointer">
              <input v-model="form.isPublished" type="checkbox" class="form-checkbox" />
              <span>Xuáº¥t báº£n ngay sau khi lÆ°u</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Há»§y
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="spinner-sm"></span>
                Äang lÆ°u...
              </span>
              <span v-else>{{ editingArticle ? 'Cáº­p nháº­t' : 'Táº¡o bÃ i viáº¿t' }}</span>
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
    .replace(/[Ã Ã¡áº¡áº£Ã£Ã¢áº§áº¥áº­áº©áº«Äƒáº±áº¯áº·áº³áºµ]/g, 'a')
    .replace(/[Ã¨Ã©áº¹áº»áº½Ãªá»áº¿á»‡á»ƒá»…]/g, 'e')
    .replace(/[Ã¬Ã­á»‹á»‰Ä©]/g, 'i')
    .replace(/[Ã²Ã³á»á»ÃµÃ´á»“á»‘á»™á»•á»—Æ¡á»á»›á»£á»Ÿá»¡]/g, 'o')
    .replace(/[Ã¹Ãºá»¥á»§Å©Æ°á»«á»©á»±á»­á»¯]/g, 'u')
    .replace(/[á»³Ã½á»µá»·á»¹]/g, 'y')
    .replace(/Ä‘/g, 'd')
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
    alert('TiÃªu Ä‘á» vÃ  ná»™i dung khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
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