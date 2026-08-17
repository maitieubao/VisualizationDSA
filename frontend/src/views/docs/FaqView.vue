<template>
  <div class="faq-view h-full bg-bg-base overflow-y-auto">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BaseIcon name="help-circle" class="w-6 h-6 text-accent-cyan" />
          Câu hỏi thường gặp
        </h1>
        <p class="text-text-secondary mt-1 text-sm">
          Giải đáp nhanh các thắc mắc thường gặp khi sử dụng VisualizationDSA.
        </p>
      </header>

      <div class="space-y-3">
        <div
          v-for="(item, idx) in FAQ_ITEMS"
          :key="item.id"
          class="faq-item rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden"
        >
          <button
            type="button"
            class="faq-question w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-bg-hover transition-colors"
            :aria-expanded="openId === item.id"
            @click="toggle(item.id)"
          >
            <span class="text-sm font-semibold text-text-primary">
              <span class="text-accent-cyan font-mono mr-2">{{ idx + 1 }}.</span>{{ item.question }}
            </span>
            <BaseIcon
              :name="openId === item.id ? 'minus' : 'plus'"
              class="w-4 h-4 text-text-muted flex-shrink-0"
            />
          </button>
          <div
            v-if="openId === item.id"
            class="faq-answer px-4 pb-4 text-sm text-text-secondary leading-relaxed"
          >
            {{ item.answer }}
          </div>
        </div>
      </div>

      <div class="mt-8 rounded-xl border border-border-subtle bg-bg-secondary p-4 text-sm text-text-secondary">
        Bạn chưa tìm thấy câu trả lời?
        <RouterLink to="/docs" class="faq-docs-link text-accent-cyan font-semibold hover:underline ml-1">
          Xem tài liệu tham khảo
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'simulation',
    question: 'Làm thế nào để chạy một mô phỏng thuật toán?',
    answer:
      'Bạn vào mục "Sắp xếp", "Đồ thị" hoặc "Playground", chọn thuật toán muốn xem, nhập dữ liệu đầu vào (hoặc nhấn "Sinh ngẫu nhiên") rồi nhấn chạy. Hệ thống sẽ mô phỏng từng bước thực thi; bạn có thể phát, dừng hoặc tua từng bước bằng thanh điều khiển bên dưới.',
  },
  {
    id: 'quiz',
    question: 'Trắc nghiệm (Quiz) hoạt động ra sao?',
    answer:
      'Mục "Trắc nghiệm" gồm các bộ câu hỏi trắc nghiệm theo bài học. Bạn chọn đáp án và nộp bài để xem điểm, đáp án đúng cùng giải thích chi tiết cho từng câu hỏi.',
  },
  {
    id: 'codelab',
    question: 'Codelab dùng để làm gì?',
    answer:
      'Codelab là môi trường lập trình tích hợp để bạn viết, chạy và gỡ lỗi mã nguồn ngay trên trình duyệt, kết hợp trực quan hóa kết quả của thuật toán.',
  },
  {
    id: 'classroom',
    question: 'Làm sao để tham gia lớp học của giảng viên?',
    answer:
      'Đăng nhập rồi vào mục "Lớp học của tôi", nhập mã lớp do giảng viên cung cấp để tham gia. Bạn có thể theo dõi tiến độ và làm bài tập được giao trong lớp học.',
  },
  {
    id: 'premium',
    question: 'Tài khoản Premium mang lại lợi ích gì?',
    answer:
      'Tài khoản Premium mở khóa toàn bộ nội dung nâng cao, các mô phỏng premium và báo cáo chi tiết. Bạn có thể nâng cấp từ mục "Nâng cấp Premium".',
  },
  {
    id: 'account',
    question: 'Tôi quên mật khẩu hoặc muốn đổi thông tin tài khoản?',
    answer:
      'Vào "Hồ sơ cá nhân" để cập nhật tên hiển thị, tiểu sử, trường đại học và đổi mật khẩu. Nếu quên mật khẩu, hãy liên hệ quản trị viên hoặc giảng viên để được hỗ trợ cấp lại tài khoản.',
  },
];

const openId = ref<string | null>(null);

function toggle(id: string): void {
  openId.value = openId.value === id ? null : id;
}
</script>
