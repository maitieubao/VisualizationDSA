# ⚙️ Technical Specification - Gamification Rewards & Embed Widget (Sprint 12)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình sinh mã nhúng **EmbeddingWidgetGenerator** và hệ thống tính toán thăng cấp thăng điểm **GamificationRewardEngine** trong Sprint 12.

---

## 1. Trình Sinh Chuỗi Mã Nhúng Iframe Tùy Biến (EmbeddingWidgetGenerator TS)

Lớp hạt nhân chịu trách nhiệm xây dựng các tham số cấu hình Iframe nhúng nhẹ độc lập tải siêu nhanh dưới máy khách:

```typescript
export interface WidgetOptions {
  algorithmId: string;
  theme: 'GLASS_SLATE_DARK' | 'NEON_CYAN_LIGHT';
  width: number;
  height: number;
  allowInteraction: boolean;
}

export class EmbeddingWidgetGenerator {
  /**
   * Sinh chuỗi thẻ nhúng Iframe an toàn (Iframe Embed Tag Builder)
   * @param baseUrl Địa chỉ gốc của trang chạy standalone widget
   * @param options Các tùy chọn kích thước, giao diện cấu hình
   */
  public static generateIframeHtml(baseUrl: string, options: WidgetOptions): string {
    if (!baseUrl) {
      throw new Error('Địa chỉ gốc Base URL không được rỗng!');
    }

    // Xây dựng chuỗi tham số truy vấn an toàn (Safe URL query param builder)
    const params = new URLSearchParams();
    params.set('algo', options.algorithmId);
    params.set('theme', options.theme);
    params.set('interactive', options.allowInteraction ? '1' : '0');
    params.set('embed', 'true'); // Chặn thanh điều hướng gốc tránh chật chội layout

    const embedUrl = `${baseUrl}?${params.toString()}`;

    // Tạo mã nhúng Iframe chuẩn HTML5 tích hợp bảo mật sandbox
    return `<iframe src="${embedUrl}" width="${options.width}" height="${options.height}" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; backdrop-filter: blur(12px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin"></iframe>`;
  }
}
```

---

## 2. Hệ Thống Tính Điểm XP Thăng Cấp Thành Tích (GamificationRewardEngine TS)

```typescript
export interface UserProgress {
  userId: string;
  currentXp: number;
  currentLevel: number;
  achievements: string[];
}

export class GamificationRewardEngine {
  private static XP_PER_LEVEL = 1000; // Ngưỡng thăng hạng 1000 XP/Level

  /**
   * Tính toán tích lũy XP học tập và thăng hạng cấp độ (XP Accumulator & Level Up)
   * @param progress Tiến trình hiện tại của sinh viên
   * @param earnedXp Điểm XP mới tích lũy được
   */
  public static addXp(progress: UserProgress, earnedXp: number): { updatedProgress: UserProgress; leveledUp: boolean } {
    if (earnedXp < 0) {
      throw new Error('Không được cộng điểm XP âm!');
    }

    const updated = { ...progress, achievements: [...progress.achievements] };
    updated.currentXp += earnedXp;

    // Tính toán cấp độ mới (Lũy tiến tuyến tính: Level = floor(xp / threshold) + 1)
    const newLevel = Math.floor(updated.currentXp / this.XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > updated.currentLevel;

    if (leveledUp) {
      updated.currentLevel = newLevel;
      
      // Tặng huy hiệu đặc biệt chúc mừng thăng cấp Neon phát sáng
      const badgeName = `LEVEL_${newLevel}_ACHIEVER`;
      if (!updated.achievements.includes(badgeName)) {
        updated.achievements.push(badgeName);
      }
    }

    return {
      updatedProgress: updated,
      leveledUp
    };
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Xuất Bản & Thăng Hạng (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { EmbeddingWidgetGenerator, WidgetOptions, GamificationRewardEngine, UserProgress } from './EmbeddingWidgetGenerator';

describe('Sprint 12 Gamification & Embedding Widget Unit Tests', () => {
  it('Should successfully generate secure HTML iframe tag with search parameters', () => {
    const options: WidgetOptions = {
      algorithmId: 'dijkstra',
      theme: 'GLASS_SLATE_DARK',
      width: 800,
      height: 600,
      allowInteraction: true
    };

    const iframeHtml = EmbeddingWidgetGenerator.generateIframeHtml('https://dsa.edu.vn', options);

    // Xác thực cấu trúc thẻ Iframe
    expect(iframeHtml).toContain('<iframe');
    expect(iframeHtml).toContain('src="https://dsa.edu.vn?algo=dijkstra&theme=GLASS_SLATE_DARK&interactive=1&embed=true"');
    expect(iframeHtml).toContain('width="800"');
    expect(iframeHtml).toContain('height="600"');
    expect(iframeHtml).toContain('sandbox="allow-scripts allow-same-origin"');
  });

  it('Should successfully accrue learning XP and trigger levels promotion badges', () => {
    const startProgress: UserProgress = {
      userId: 'STD_99',
      currentXp: 850, // Đang ở 850 XP
      currentLevel: 1,
      achievements: []
    };

    // Làm bài trắc nghiệm đúng được tặng +200 XP -> Vượt ngưỡng 1000 XP -> Thăng cấp level 2
    const result = GamificationRewardEngine.addXp(startProgress, 200);

    expect(result.leveledUp).toBeTruthy();
    expect(result.updatedProgress.currentLevel).toBe(2);
    expect(result.updatedProgress.currentXp).toBe(1050);
    expect(result.updatedProgress.achievements).toContain('LEVEL_2_ACHIEVER');
  });
});
```
 Thiết kế bộ sinh chuỗi thẻ nhúng Iframe an toàn cấu hình cao cấp kết hợp động cơ tích lũy XP học tập và thăng hạng huy hiệu thăng hạng 100% Client-side giúp học viên hào hứng thực hành, chia sẻ kiến thức trực quan hóa tới cộng đồng một cách uy tín, sành điệu bậc nhất.
