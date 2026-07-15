# 🧠 Exporter Engine & Lz-string State Compressor (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân trích xuất ảnh `SVGToCanvasExporter`, bộ nạp nén dữ liệu `WorkspaceStateCompressor` và các ca kiểm thử tự động (Unit Tests) bảo toàn tính toàn vẹn trạng thái.

---

## 1. Bộ máy Xuất ảnh & Nén băm (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa bộ nhớ Client-side:

```typescript
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export interface WorkspaceState {
  algorithmId: string;
  layoutNodes: Array<{ id: string; x: number; y: number }>;
  currentStepIndex: number;
}

export class WorkspaceStateCompressor {
  /**
   * Nén băm đối tượng JSON sang chuỗi rút gọn URL-Safe
   */
  public static serializeState(state: WorkspaceState): string {
    const jsonString = JSON.stringify(state);
    
    // Nén sâu lz-string bảo toàn dữ liệu
    return compressToEncodedURIComponent(jsonString);
  }

  /**
   * Giải nén phục hồi đối tượng gốc
   */
  public static deserializeState(compressedString: string): WorkspaceState | null {
    try {
      const jsonString = decompressFromEncodedURIComponent(compressedString);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as WorkspaceState;
    } catch (err) {
      console.error('Lỗi hạ tầng giải nén trạng thái phòng lab:', err);
      return null;
    }
  }
}

export class SVGToCanvasExporter {
  /**
   * Nhúng style ngoại vi trích xuất chuỗi Base64 SVG DataURI
   */
  public static extractSVGDataURI(svgElement: SVGElement): string {
    const clone = svgElement.cloneNode(true) as SVGElement;
    
    // Nhúng kèm toàn bộ mã CSS Neon, font JetBrains Mono của trang web chủ vào SVG
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.textContent = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          return ''; // Bỏ qua cross-origin stylesheets nếu có
        }
      })
      .join('\n');
    clone.insertBefore(styleElement, clone.firstChild);

    const svgString = new XMLSerializer().serializeToString(clone);
    const unicodeString = unescape(encodeURIComponent(svgString));
    return 'data:image/svg+xml;base64,' + btoa(unicodeString);
  }

  /**
   * Chuyển đổi SVG sang PNG độ phóng đại scale 3x sắc mịn
   */
  public static async exportToPNG(svgElement: SVGElement, scale: number = 3): Promise<string> {
    const dataUri = this.extractSVGDataURI(svgElement);
    const svgWidth = svgElement.viewBox.baseVal.width || svgElement.clientWidth || 800;
    const svgHeight = svgElement.viewBox.baseVal.height || svgElement.clientHeight || 500;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không thể khởi tạo môi trường vẽ Canvas 2D.'));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Lỗi tải cấu trúc ảnh SVG ảo.'));
      img.src = dataUri;
    });
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình nén băm không tổn thất thông tin của giải thuật lz-string:

```typescript
import { describe, it, expect } from 'vitest';
import { WorkspaceStateCompressor, WorkspaceState } from './WorkspaceStateCompressor';

describe('Workspace State Compressor Unit Tests', () => {
  it('Should successfully serialize and deserialize workspace states with zero data loss', () => {
    const originalState: WorkspaceState = {
      algorithmId: 'quicksort-recursion',
      layoutNodes: [
        { id: 'Client', x: 150, y: 80 },
        { id: 'Strategy', x: 300, y: 220 }
      ],
      currentStepIndex: 12
    };

    // Tiến hành nén băm sang chuỗi URL-Safe Base64 rút gọn
    const compressed = WorkspaceStateCompressor.serializeState(originalState);
    expect(compressed.length).toBeLessThan(JSON.stringify(originalState).length); // Kích thước giảm sâu

    // Giải nén phục hồi
    const restoredState = WorkspaceStateCompressor.deserializeState(compressed);
    
    expect(restoredState).not.toBeNull();
    expect(restoredState!.algorithmId).toBe('quicksort-recursion');
    expect(restoredState!.currentStepIndex).toBe(12);
    expect(restoredState!.layoutNodes[0].id).toBe('Client');
    expect(restoredState!.layoutNodes[0].x).toBe(150); // Bảo toàn tọa độ kéo thả hoàn hảo
  });
});
```
 Động cơ trích xuất ảnh vector SVG-to-Canvas 3x sắc mịn Retina và giải thuật nén băm trạng thái phòng lab lz-string đảm bảo sự chính xác toàn vẹn tri thức thuật toán 100%, đem lại năng lực kết nối chia sẻ tối tân cho hệ thống.
