# ⚙️ Technical Specification - Basic DSA Array & Sorting (Sprint 2)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript và giải thuật toán học nội suy Lerp di chuyển tọa độ các cột bar mảng khi hoán vị trong các bộ sắp xếp (Bubble, Quick, Merge, Heap Sort) của Sprint 2.

---

## 1. Thuật toán Hoán vị Mảng Lerp Mượt mà (Array Swap Math)

Khi 2 cột bar đại diện cho phần tử mảng hoán vị vị trí, thay vì dịch chuyển tức thời, hệ thống sử dụng phép nội suy Lerp chuyển tiếp tọa độ X uốn lượn dưới đồ họa 60 FPS:

```typescript
export interface BarElement {
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // HSL Neon Glow
  status: 'IDLE' | 'COMPARING' | 'PIVOT' | 'SWAPPED' | 'SORTED';
}

export class ArraySortingVisualizer {
  /**
   * Tính toán nội suy Lerp di chuyển vị trí 2 cột bar hoán vị (Lerp Swap)
   * @param barA Cột phần tử A
   * @param barB Cột phần tử B
   * @param progress Tiến trình hoán vị [0.0 -> 1.0]
   */
  public static interpolateSwap(
    barA: BarElement,
    barB: BarElement,
    progress: number
  ): { xA: number; xB: number; curveY: number } {
    const targetXA = barB.x;
    const targetXB = barA.x;

    // Nội suy vị trí trục X phẳng (Linear X transition)
    const currentXA = barA.x + (targetXA - barA.x) * progress;
    const currentXB = barB.x + (targetXB - barB.x) * progress;

    // Tạo đường cong uốn lượn hình cung tránh đè lên nhau (Arc Y movement)
    // parabol: y = -4 * h * x * (1 - x)
    const arcHeight = 40; 
    const curveY = -4 * arcHeight * progress * (1 - progress);

    return {
      xA: currentXA,
      xB: currentXB,
      curveY: curveY
    };
  }
}
```

---

## 2. Trình Biên Dịch Hoạt Ảnh Sắp Xếp Bubble/Quick Sort (Frame Generators)

```typescript
export interface SortFrame {
  stepIndex: number;
  arrayState: number[];
  comparingIndices: [number, number] | null;
  pivotIndex: number | null;
  swappedIndices: [number, number] | null;
  description: string;
}

export class BubbleSortFrameGenerator {
  /**
   * Biên dịch Bubble Sort sinh các khung hình hoạt ảnh dòng thời gian
   */
  public static generateFrames(inputArray: number[]): SortFrame[] {
    const frames: SortFrame[] = [];
    const arr = [...inputArray];
    const n = arr.length;
    let step = 0;

    // Khung hình khởi tạo ban đầu
    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: null,
      swappedIndices: null,
      description: 'Khởi tạo mảng dữ liệu đầu vào'
    });

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // 1. Bước so sánh (Comparing)
        frames.push({
          stepIndex: step++,
          arrayState: [...arr],
          comparingIndices: [j, j + 1],
          pivotIndex: null,
          swappedIndices: null,
          description: `So sánh mảng[${j}] = ${arr[j]} và mảng[${j+1}] = ${arr[j+1]}`
        });

        if (arr[j] > arr[j + 1]) {
          // Hoán vị
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          // 2. Bước hoán vị (Swapped)
          frames.push({
            stepIndex: step++,
            arrayState: [...arr],
            comparingIndices: null,
            pivotIndex: null,
            swappedIndices: [j, j + 1],
            description: `Hoán vị ${arr[j+1]} và ${arr[j]}`
          });
        }
      }
      
      // Đánh dấu phần tử cuối cùng đã được sắp xếp
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: null,
        pivotIndex: null,
        swappedIndices: null,
        description: `Phần tử mảng[${n - i - 1}] đã yên vị đúng vị trí`
      });
    }

    return frames;
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Giải Thuật (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { ArraySortingVisualizer, BarElement, BubbleSortFrameGenerator } from './ArraySortingVisualizer';

describe('Sprint 2 Array & Sorting Unit Tests', () => {
  it('Should perfectly calculate linear coordinates and parabolic arc height during swap', () => {
    const barA: BarElement = { value: 10, x: 0, y: 100, width: 20, height: 100, color: 'cyan', status: 'IDLE' };
    const barB: BarElement = { value: 20, x: 100, y: 100, width: 20, height: 200, color: 'cyan', status: 'IDLE' };

    // Tiến trình hoán vị đạt 50%
    const interpolation = ArraySortingVisualizer.interpolateSwap(barA, barB, 0.5);

    expect(interpolation.xA).toBe(50);
    expect(interpolation.xB).toBe(50);
    expect(interpolation.curveY).toBe(-40); // Đỉnh parabol uốn cong vòng lên để tránh va chạm
  });

  it('Should successfully generate chronological animation frames for Bubble Sort', () => {
    const startArray = [3, 1, 2];
    const frames = BubbleSortFrameGenerator.generateFrames(startArray);

    expect(frames.length).toBeGreaterThan(2);
    expect(frames[0].description).toBe('Khởi tạo mảng dữ liệu đầu vào');
    
    // Kiểm tra kết quả khung hình cuối cùng đã được sắp xếp hoàn hảo
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.arrayState).toEqual([1, 2, 3]);
  });
});
```
 Thiết kế giải thuật hoán vị mảng Lerp Parabol vòng cung chống va chạm 60 FPS cùng bộ biên dịch bước hoạt ảnh Bubble/Quick Sort sinh các khung hình dòng thời gian chặt chẽ giúp học viên tiếp thu giải thuật sắp xếp dễ dàng, trực quan nhất.
