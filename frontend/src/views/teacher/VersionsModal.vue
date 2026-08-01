<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="git-branch" class="w-5 h-5 inline mr-2" />
            Lịch sử phiên bản: {{ article?.title }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body versions-list">
          <div v-if="!article?.versions?.length" class="empty-versions">
            <BaseIcon name="git-branch" class="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p class="text-text-muted text-center">Chưa có phiên bản nào</p>
            <p class="text-text-muted text-sm text-center mt-1">Các phiên bản sẽ xuất hiện khi bạn chỉnh sửa bài viết</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="(version, index) in article.versions" 
              :key="version.id"
              class="version-item p-4 rounded-xl border border-border-subtle bg-bg-secondary/40 hover:border-accent/20 transition-colors"
            >
              <div class="version-header flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div class="flex items-center gap-3">
                  <span class="version-badge text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                    v{{ getVersionNumber(article.versions, index) }}
                  </span>
                  <span class="version-date text-xs text-text-muted">
                    {{ formatDate(version.createdAt) }}
                  </span>
                  <span class="version-author text-xs text-text-muted">
                    bởi {{ version.changedByName }}
                  </span>
                </div>
                
                <span v-if="version.changeSummary" class="version-summary text-xs text-text-muted italic max-w-xs truncate">
                  {{ version.changeSummary }}
                </span>
              </div>
              
              <div class="version-preview">
                <div class="preview-content text-xs text-text-muted line-clamp-3 font-mono bg-bg-secondary p-3 rounded-lg border border-border-subtle">
                  {{ stripHtml(version.contentMd).substring(0, 200) }}...
                </div>
              </div>
              
              <div class="version-actions flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border-subtle">
                <button 
                  type="button" 
                  class="btn-secondary text-xs px-3 py-1.5"
                  @click="$emit('restore', version)"
                >
                  <BaseIcon name="rotate-ccw" class="w-3 h-3 inline mr-1" />
                  Khôi phục
                </button>
                <button 
                  type="button" 
                  class="btn-action-icon text-text-muted hover:text-accent p-1.5"
                  @click="viewFullVersion(version)"
                  title="Xem đầy đủ"
                >
                  <BaseIcon name="eye" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  article: any;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'restore', version: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function getVersionNumber(versions: any[], index: number | string): number {
  return versions.length - Number(index);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&/g, '&');
}

function viewFullVersion(version: any) {
  
  console.log('View full version:', version);
}
</script>

<style scoped>
@import "./VersionsModal.css";
</style>