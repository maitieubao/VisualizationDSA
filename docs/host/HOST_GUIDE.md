# 🌐 Embed Widget — Hướng dẫn Tích Hợp vào Trang/LMS Bất Kỳ (Host Guide)

> C3 (2026-08-13): tài liệu host hoàn chỉnh — người không phải developer làm theo được trong <15 phút.
> Môi trường verify thật (browser + LMS): xem `docs/host/sample-host.html` để chạy demo trước.

---

## 1. Dán snippet vào website/LMS

### Bước 1 — Lấy mã nhúng
1. Mở app VisualizationDSA → tab **Embed Widget**.
2. Chọn thuật toán, theme, kích thước, bật/tắt VCR.
3. Bấm **SAO CHÉP MÃ** → bạn có 1 thẻ `<iframe>`.

### Bước 2 — Dán vào trang (3 cách)

**Cách A — Chỉ iframe (tự dùng, không cần tương tác host):**
```html
<iframe
  data-embed-widget
  src="https://visualization-dsa.example.com/embed?algo=bubble-sort&theme=glass"
  width="800"
  height="500"
  style="border:0; border-radius:16px"
  allow="clipboard-write"
  loading="lazy"
></iframe>
```

**Cách B — Iframe + host script (KHÔNG BẮT BUỘC nhưng khuyến nghị):** gồm:
1. iframe ở trên (giữ nguyên `data-embed-widget`),
2. đoạn `<script>` bên dưới (mục 2) — giúp iframe tự co giãn theo nội dung (auto-height).

**Cách C — LMS cụ thể:** Moodle/Canvas → chèn "Khối HTML" / "Trang" → chế độ **HTML/Source** → dán iframe + script (mục 2). KHÔNG dùng trình soạn thảo WYSIWYG (nó sẽ xóa thuộc tính `data-embed-widget`).

---

## 2. Host integration script (auto-height + lắng nghe sự kiện)

```html
<script>
  // Chọn ĐÚNG iframe widget qua data-embed-widget (tránh bấu nhầm iframe khác trên trang).
  const iframe = document.querySelector('[data-embed-widget]');
  if (!iframe) return;
  window.addEventListener('message', (event) => {
    // Chỉ nhận tin từ ĐÚNG iframe này (chống giả mạo event.source).
    if (event.source !== iframe.contentWindow) return;
    // BẮT BUỘC verify origin — chỉ nhận tin từ widget của chúng ta (chống UI redressing).
    if (event.origin !== 'https://visualization-dsa.example.com') return;
    const msg = event.data;
    if (msg?.source === 'VISUALIZATION_DSA_WIDGET') {
      if (msg.action === 'HEIGHT_CHANGED' && Number.isFinite(Number(msg.payload?.height))) {
        // Auto-height cross-origin: kẹp 100..2000px, tránh quá nhỏ/lớn.
        const h = Math.min(2000, Math.max(100, Number(msg.payload.height)));
        iframe.style.height = h + 'px';
      }
      if (msg.action === 'QUIZ_COMPLETED') {
        console.log('Quiz score:', msg.payload?.quizScore); // ví dụ: ghi nhận trên LMS
      }
    }
  });
</script>
```

> ⚠️ Thay `https://visualization-dsa.example.com` bằng domain thật của app (xem `src` trong mã iframe).

---

## 3. Điều khiển widget từ trang host (tùy chọn)

Gửi message VÀO iframe để điều khiển từ bên ngoài:

```js
function sendToWidget(action, payload) {
  const iframe = document.querySelector('[data-embed-widget]');
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage(
    { source: 'VISUALIZATION_DSA_WIDGET', action, payload },
    '*', // trong sản xuất: dùng origin thật của widget
  );
}

sendToWidget('PLAY_PAUSE', {});          // play/pause
sendToWidget('STEP_FORWARD', { stepIndex: 5 }); // nhảy tới bước 5
sendToWidget('RESET', {});               // về đầu
```

---

## 4. Cấu hình allowlist origin (bảo mật)

Widget chỉ tin message từ origin trong allowlist. Cấu hình tại:
- Backend: biến môi trường / appsettings `Embed:AllowedHostOrigins` (danh sách origin được phép điều khiển).
- Frontend: `SecureOriginChecker` — mặc định **chỉ chấp nhận cùng origin** (fail-closed, không wildcard).

**Khi deploy production:** luôn liệt kê domain host thật. Không dùng `*`.

---

## 5. Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| :-- | :-- | :-- |
| Widget hiển thị nhưng cao độ cứng / bị cắt | Thiếu host script (mục 2) hoặc `data-embed-widget` bị xóa bởi WYSIWYG | Dán lại bằng chế độ HTML/Source |
| Iframe không tự co giãn | origin trong script không khớp `src` của iframe | Đối chiếu `event.origin` với domain thật |
| Message bị bỏ qua | allowlist không chứa origin host | Thêm origin vào `Embed:AllowedHostOrigins` |
| Widget không tải (trắng) | `loading="lazy"` + iframe ngoài viewport trên một số LMS | Gỡ `loading="lazy"` hoặc cuộn vào |
| Popup clipboard bị chặn | iframe thiếu `allow="clipboard-write"` | Thêm attribute vào thẻ iframe |

---

## 6. Kiểm tra nhanh

1. Mở `docs/host/sample-host.html` bằng trình duyệt (mở từ server, không mở file:// nếu origin strict).
2. Dán iframe (mục 1) vào khối "Widget slot".
3. Xem log bên dưới: phải thấy `✅ WIDGET_READY` → sau đó `📏 HEIGHT_CHANGED → ...px` khi widget đổi nội dung.
4. Bấm nút điều khiển host (STEP_FORWARD/PLAY_PAUSE/RESET) → log xác nhận đã gửi.

**Pass = auto-height thay đổi + điều khiển hoạt động xuyên domain.**
