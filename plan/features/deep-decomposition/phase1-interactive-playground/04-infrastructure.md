# ⚙️ Infrastructure & Serialization - Shareable Graphs (Phase 1)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tại Client-side phục vụ việc sao lưu, tải tệp đồ thị tự vẽ (Export/Import JSON) và nén chuỗi Base64 mã hóa cấu trúc đồ thị ngay trên liên kết trình duyệt (URL Shareable) để chia sẻ bài học nhanh.

---

## 1. Cơ chế Chia sẻ Đồ thị Qua URL (URL Shareable Base64 String)

Để sinh viên có thể chia sẻ nhanh bản vẽ đồ thị tự thiết kế của mình cho giảng viên hoặc bạn học mà không cần upload lên server, hệ thống áp dụng kỹ thuật mã hóa và giải mã Base64 chuỗi trạng thái trực tiếp trên thanh URL.

### Sơ đồ quy trình nén và giải mã:
```
[Nội dung Store đồ thị] ---> [JSON String] ---> [UTF-8 Encode] ---> [Base64 URL Safe] ---> [Thêm vào URL ?graph=...]
                                                                                                      |
[Đọc biến query ?graph] <--- [Base64 Decode] <--- [UTF-8 Decode] <--- [JSON Parse] <--- [Ghi đè vào Store đồ thị]
```

### Mã nguồn hiện thực hóa bằng TypeScript:
```typescript
import { usePlaygroundStore } from '@/stores/usePlaygroundStore';

export class GraphSharingService {
  /**
   * 1. Mã hóa đồ thị hiện tại thành một chuỗi URL Safe Base64
   */
  public static generateShareUrl(): string {
    const store = usePlaygroundStore();
    const compactData = {
      n: store.nodes.map(node => ({ i: node.id, l: node.label, x: node.x, y: node.y })),
      e: store.edges.map(edge => ({ f: edge.from, t: edge.to, w: edge.weight }))
    };

    const jsonStr = JSON.stringify(compactData);
    // Mã hóa UTF-8 an toàn tránh lỗi tiếng Việt hoặc ký tự đặc biệt
    const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('graph', base64);
    return currentUrl.toString();
  }

  /**
   * 2. Giải mã chuỗi Base64 từ URL và khôi phục vào Store đồ thị
   */
  public static loadGraphFromUrl(): boolean {
    const store = usePlaygroundStore();
    const urlParams = new URLSearchParams(window.location.search);
    const base64Data = urlParams.get('graph');

    if (!base64Data) return false;

    try {
      const decodedStr = decodeURIComponent(atob(base64Data).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const parsed = JSON.parse(decodedStr);

      // Khôi phục mảng node và cạnh
      store.nodes = parsed.n.map((node: any) => ({
        id: node.i,
        label: node.l,
        x: node.x,
        y: node.y,
        radius: 20
      }));

      store.edges = parsed.e.map((edge: any) => ({
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        from: edge.f,
        to: edge.t,
        weight: edge.w
      }));

      return true;
    } catch (error) {
      console.error('Không thể giải mã cấu trúc đồ thị từ URL:', error);
      return false;
    }
  }
}
```

---

## 2. Xuất và Nhập Tệp Đồ thị (Local File Export/Import)

Hệ thống cho phép tải bản vẽ đồ thị về máy tính dưới dạng tệp tin văn bản tĩnh `.json` và tải lên lại (Import) để tiếp tục thực nghiệm:

*   **Tải về (Export JSON File):** Tạo một đối tượng Blob tạm thời trong trình duyệt và kích hoạt thẻ tải tự động:
    ```typescript
    public static exportGraphToFile(): void {
      const store = usePlaygroundStore();
      const payload = JSON.stringify({ nodes: store.nodes, edges: store.edges }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-graph-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
    ```
*   **Tải lên (Import JSON File):** Sử dụng thẻ `input[type="file"]` ẩn để đọc nội dung tệp bằng lớp `FileReader` mặc định của trình duyệt và tiến hành kiểm tra tính hợp lệ (Schema Validation) trước khi nạp vào Pinia Store.
