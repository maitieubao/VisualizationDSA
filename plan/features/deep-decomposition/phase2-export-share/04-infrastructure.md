# ⚙️ Infrastructure & CSS Stylesheet Extractor (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật trích xuất CSS ngoại vi nhúng kèm SVG (External Stylesheets Injector), bảo đảm tính tương thích font chữ JetBrains Mono và giải phóng bộ nhớ Canvas ảo.

---

## 1. Dịch vụ Trích xuất Stylesheet Ngoại vi (External CSS Styles Injector)

Để tệp ảnh PNG hoặc SVG tải xuống giữ nguyên 100% phong cách thiết kế kính mờ Glassmorphism, viền phát sáng Neon rực rỡ và font chữ tùy biến của VisualizationDSA, hạ tầng xây dựng dịch vụ trích xuất quy tắc CSS ngoại vi:

```typescript
export class ExternalStylesheetsInjector {
  /**
   * Quét toàn bộ document.styleSheets đang có của trang web, gộp thành chuỗi CSS văn bản
   */
  public static extractActiveCSSRules(): string {
    let cssTextCombined = '';
    
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        // Bỏ qua các stylesheet CORS của bên thứ ba không thể truy cập
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            cssTextCombined += sheet.cssRules[j].cssText + '\n';
          }
        }
      } catch (err) {
        // Chỉ in cảnh báo nhẹ, tiếp tục gộp các sheet nội bộ an toàn
        console.debug('Bỏ qua stylesheet CORS ngoại vi:', sheet.href);
      }
    }
    
    return cssTextCombined;
  }

  /**
   * Tiêm chui chuỗi CSS vào thẻ <style> của SVG mục tiêu
   */
  public static injectCSSIntoSVG(svgElement: SVGElement): void {
    const cssContent = this.extractActiveCSSRules();
    
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.setAttribute('type', 'text/css');
    styleElement.textContent = cssContent;
    
    // Đảm bảo chèn lên đầu để ghi đè các cấu hình mặc định khác
    svgElement.insertBefore(styleElement, svgElement.firstChild);
  }
}
```

---

## 2. Giải pháp Hợp nhất Tải Font Chữ & Giải phóng bộ nhớ RAM Canvas

*   **Bảo đảm Bản quyền Font JetBrains Mono:**
    *   Hạ tầng tự động nhúng các liên kết `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');` vào sâu trong chuỗi CSS SVG được tiêm chui.
    *   Đảm bảo Canvas ảo luôn vẽ đúng font chữ lập trình JetBrains Mono, tuyệt đối không bị lỗi nhảy font thô thiển Arial/Times New Roman trên ảnh xuất ra.
*   **Giải phóng RAM Image ảo triệt để (GC Optimization):**
    *   Sau khi Canvas kết xuất xong và gọi hàm `canvas.toDataURL()`, đối tượng ảnh ảo `img.onload = null` được dập tắt hoàn toàn.
    *   Gỡ bỏ phần tử Canvas khỏi bộ nhớ đệm, gán `img = null` để trình duyệt thực thi Garbage Collection dọn rác RAM máy khách sạch sẽ ngay lập tức.
