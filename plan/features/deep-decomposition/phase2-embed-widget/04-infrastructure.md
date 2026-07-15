# ⚙️ Infrastructure & Secure Embed Origin Checker (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp hạ tầng quản lý bảo mật liên lạc qua Iframe Sandbox, bộ lọc Whitelist Domain chống XSS và thư viện tự động Resize đồng bộ chiều cao Iframe.

---

## 1. Dịch vụ Kiểm duyệt Nguồn tin an toàn (Secure Origin Checker)

Hạ tầng bảo mật lọc các Message Event nhận được, so khớp với danh sách Whitelist cho phép cấu hình từ máy chủ:

```typescript
export class SecureOriginChecker {
  private static whitelistedDomains: Set<string> = new Set([
    'https://visualization-dsa.edu.vn',
    'https://moodle.hust.edu.vn',
    'https://canvas.usth.edu.vn'
  ]);

  /**
   * Kiểm tra xem một Domain gửi tin nhắn có nằm trong Whitelist không
   */
  public static isValidOrigin(origin: string): boolean {
    // Nếu Whitelist chứa '*' thì cho phép tất cả các nguồn (dành cho chế độ nhúng tự do công cộng)
    if (this.whitelistedDomains.has('*')) return true;
    
    return this.whitelistedDomains.has(origin);
  }

  /**
   * Thêm Domain tin cậy động từ cấu hình máy chủ
   */
  public static addTrustedDomain(domain: string): void {
    this.whitelistedDomains.add(domain);
  }

  public static clearWhitelist(): void {
    this.whitelistedDomains.clear();
  }
}
```

---

## 2. Giải pháp Hợp nhất ResizeObserver & Giải phóng bộ nhớ RAM

*   **Tự động Resizing Iframe Chiều cao động (Dynamic Height Resizer):**
    *   Tích hợp bộ giám sát `ResizeObserver` bắt sự kiện co giãn của Document Body bên trong Iframe nhúng, gửi thông điệp `HEIGHT_CHANGED` ra ngoài Host để Host tự động thay đổi kích thước thẻ iframe tránh tạo thanh cuộn kép.
*   **Chống rò rỉ RAM (Garbage Collection Optimization):**
    *   Khi Component nhúng Unmount khỏi giao diện giáo trình điện tử, hệ thống tự động dập tắt timer, hủy đăng ký sự kiện lắng nghe `window.removeEventListener('message')`.
    *   Disconnect hoàn toàn ResizeObserver để tránh việc rò rỉ RAM (Memory Leak) làm đơ tab duyệt web của học sinh.
