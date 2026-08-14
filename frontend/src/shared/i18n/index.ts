import { ref, computed } from 'vue';

/**
 * D2: i18n sẵn sàng — infra nhẹ (không phụ thuộc vue-i18n) để tách chuỗi UI theo module.
 * Nguyên tắc áp dụng:
 * • Tiếng Việt là locale MẶC ĐỊNH — các chuỗi mới thêm phải đặt vào dictionary dưới đây
 *   thay vì hardcode trong template (dần dần tách các module cũ).
 * • `t(key, vars?)` hỗ trợ nội suy {name}.
 * • Locale persist vào localStorage ('app-locale') — mặc định 'vi'.
 * • KHÔNG phá hành vi cũ: locale 'vi' trả về đúng chuỗi tiếng Việt hiện tại.
 */

export type Locale = 'vi' | 'en';

const STORAGE_KEY = 'app-locale';

export const messages: Record<Locale, Record<string, string>> = {
  vi: {
    // ── Algo Playground (B/C/D) ──
    'playground.title': 'Trình chạy từng bước (JavaScript)',
    'playground.pseudocodeChip': 'pseudocode',
    'playground.menu.exportCode': 'Xuất code',
    'playground.menu.exportPng': 'Xuất ảnh PNG',
    'playground.menu.breakpoints': 'Xóa breakpoint',
    'playground.menu.hooks': 'Hooks',
    'playground.menu.restore': 'Code mẫu',
    'playground.menu.share': 'Chia sẻ',
    'playground.exportCopied': 'Đã chép',
    'playground.exportPngTip': 'Lưu canvas visualization thành ảnh PNG (báo cáo)',
    'playground.watchPanel': 'Watch — biến primitive (click biến để ghim/ẩn)',
    'playground.watchClear': 'Xóa',
    'playground.watchEmpty': 'Chưa có biến được ghim — chọn biến phía trên để theo dõi.',
    'playground.watchBtn': 'Watch',
    'playground.traceBtn': 'Lịch sử',
    'playground.run': 'Chạy',
    'playground.running': 'Đang chạy…',
    'playground.emptyState': 'Chọn demo và bấm Chạy để xem từng bước.',
    'playground.format': 'Format',
  },
  en: {
    'playground.title': 'Step-by-step Runner (JavaScript)',
    'playground.pseudocodeChip': 'pseudocode',
    'playground.menu.exportCode': 'Export code',
    'playground.menu.exportPng': 'Export PNG',
    'playground.menu.breakpoints': 'Clear breakpoints',
    'playground.menu.hooks': 'Hooks',
    'playground.menu.restore': 'Sample code',
    'playground.menu.share': 'Share',
    'playground.exportCopied': 'Copied',
    'playground.exportPngTip': 'Save canvas visualization as PNG (report)',
    'playground.watchPanel': 'Watch — primitive variables (click a variable to pin)',
    'playground.watchClear': 'Clear',
    'playground.watchEmpty': 'No pinned variables — pick one above to track.',
    'playground.watchBtn': 'Watch',
    'playground.traceBtn': 'History',
    'playground.run': 'Run',
    'playground.running': 'Running…',
    'playground.emptyState': 'Pick a demo and press Run to watch each step.',
    'playground.format': 'Format',
  },
};

function loadStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en' || raw === 'vi') return raw;
  } catch {
    // localStorage không khả dụng — dùng mặc định
  }
  return 'vi';
}

export function useI18n() {
  const locale = ref<Locale>(loadStoredLocale());

  function setLocale(next: Locale): void {
    locale.value = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage không khả dụng — bỏ qua
    }
  }

  /** Lấy chuỗi theo key + nội suy {name} — fallback key nếu thiếu (không crash). */
  function t(key: string, vars?: Record<string, string | number>): string {
    const table = messages[locale.value] ?? messages.vi;
    let text = table[key] ?? messages.vi[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  return { locale, setLocale, t };
}

export type { Locale as I18nLocale };
