# 🔌 Embed Widget API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema gói tin giao tiếp postMessage hai chiều và tệp mã nguồn tích hợp mẫu phía Host để điều khiển Iframe nhúng thuật toán.

---

## 1. Bản đặc tả JSON Schema Giao tiếp postMessage (Embed Message Schema)

Mọi thông điệp truyền tải qua biên Iframe được định dạng nghiêm ngặt theo JSON Schema dưới đây để tránh lỗi biên dịch:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EmbedPostMessage",
  "type": "OBJECT",
  "properties": {
    "source": {
      "type": "STRING",
      "enum": ["VISUALIZATION_DSA_WIDGET", "VISUALIZATION_DSA_HOST"]
    },
    "action": {
      "type": "STRING",
      "enum": ["WIDGET_READY", "STEP_FORWARD", "STEP_BACKWARD", "RESET", "QUIZ_COMPLETED", "HEIGHT_CHANGED"]
    },
    "payload": {
      "type": "OBJECT",
      "properties": {
        "stepIndex": { "type": "INTEGER" },
        "height": { "type": "INTEGER" },
        "quizScore": { "type": "INTEGER" },
        "totalQuizQuestions": { "type": "INTEGER" }
      }
    }
  },
  "required": ["source", "action"]
}
```

---

## 2. Mã nguồn Tích hợp Mẫu tại Host (Host Website Integration Script)

Giáo viên hoặc đối tác EdTech có thể dán đoạn mã Javascript mẫu này vào trang chủ của họ để điều khiển và lắng nghe Iframe nhúng sơ đồ DSA:

```html
<!-- Thẻ iframe nhúng sơ đồ thuật toán của VisualizationDSA -->
<iframe id="dsa-widget" src="https://visualization-dsa.edu.vn/embed?algo=quicksort" width="100%" height="500px" style="border: none;" sandbox="allow-scripts allow-same-origin"></iframe>

<script>
  const iframe = document.getElementById('dsa-widget');

  // 1. Gửi lệnh điều khiển từ Host chui vào trong Iframe nhúng
  function triggerNextStep() {
    const msg = {
      source: 'VISUALIZATION_DSA_HOST',
      action: 'STEP_FORWARD',
      payload: null
    };
    iframe.contentWindow.postMessage(msg, 'https://visualization-dsa.edu.vn');
  }

  // 2. Lắng nghe sự kiện từ Iframe nhúng bắn ngược ra ngoài Host
  window.addEventListener('message', (event) => {
    // Chỉ chấp nhận gói tin từ domain uy tín
    if (event.origin !== 'https://visualization-dsa.edu.vn') return;

    const msg = event.data;
    if (msg && msg.source === 'VISUALIZATION_DSA_WIDGET') {
      console.log(`Nhận sự kiện từ Iframe: ${msg.action}`, msg.payload);

      if (msg.action === 'HEIGHT_CHANGED') {
        // Tự động kéo giãn chiều cao iframe tương thích hoàn hảo tránh cuộn kép
        iframe.style.height = msg.payload.height + 'px';
      }

      if (msg.action === 'QUIZ_COMPLETED') {
        alert(`Học viên hoàn thành Quiz nhúng! Điểm số: ${msg.payload.quizScore}/${msg.payload.totalQuizQuestions}`);
      }
    }
  });
</script>
```
 Đặc tả gói tin JSON Schema nghiêm ngặt kết hợp mã mẫu tích hợp đơn giản giúp các đối tác EdTech và trường học dễ dàng nhúng, tương tác động hai chiều an toàn và mượt mà 60 FPS.
