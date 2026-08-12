// ─────────────────────────────────────────────────────────────────────────────
// Helper định dạng tiền tệ & chuyển lỗi thô → thông báo tiếng Việt thân thiện.
// Dùng chung cho toàn bộ Payment/Checkout Premium (PM-027, PM-031).
// ─────────────────────────────────────────────────────────────────────────────

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/** Định dạng số tiền theo chuẩn Việt Nam (vd: 199.000 ₫). Nguồn tiền duy nhất là backend. */
export function formatVND(value: number): string {
  return vndFormatter.format(value);
}

/**
 * Map lỗi thô (Error / HTTP status / string) → thông điệp tiếng Việt dễ hiểu.
 * - Lỗi mạng (failed to fetch / networkerror / load failed) → mất kết nối.
 * - HTTP 401/403 → phiên đăng nhập không hợp lệ.
 * - HTTP 5xx → lỗi máy chủ.
 * - HTTP 4xx còn lại → yêu cầu không hợp lệ.
 * - Chuỗi khác → giữ nguyên (thường đã là thông báo tiếng Việt từ backend).
 */
export function getErrorMessage(err: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (raw === '') return fallback;

  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.';
  }

  const httpMatch = raw.match(/HTTP\s+(\d{3})/i);
  if (httpMatch) {
    const status = Number(httpMatch[1]);
    if (status === 401 || status === 403) {
      return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (status >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }
    return 'Yêu cầu thanh toán không hợp lệ. Vui lòng thử lại.';
  }

  return raw;
}
