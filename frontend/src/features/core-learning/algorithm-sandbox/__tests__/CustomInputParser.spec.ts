import { describe, it, expect, vi } from 'vitest';
import { CustomInputParser } from '../engine/CustomInputParser';
import { InteractivePlaygroundEngine } from '../engine/InteractivePlaygroundEngine';

describe('Sprint 5 Custom Input & Playground Unit Tests', () => {
  it('Should successfully parse numbers list string and reject invalid characters', () => {
    const input = '5, 8, 12, 20';
    const arr = CustomInputParser.parseNumberArray(input);

    expect(arr).toEqual([5, 8, 12, 20]);

    // Nhập chữ cái -> Bắt buộc ném ra ngoại lệ báo lỗi
    expect(() => {
      CustomInputParser.parseNumberArray('5, abc, 12');
    }).toThrowError("Giá trị 'abc' không phải là số hợp lệ!");
  });

  it('Should successfully parse graph adjacency list formatting text', () => {
    const input = 'A-B:10, B-C:20';
    const graph = CustomInputParser.parseAdjacencyList(input);

    expect(graph.nodes.length).toBe(3);
    expect(graph.nodes.map(n => n.id)).toContain('A');
    expect(graph.edges[0]).toEqual({ sourceId: 'A', targetId: 'B', weight: 10 });

    // Sai định dạng -> Ném lỗi cảnh báo
    expect(() => {
      CustomInputParser.parseAdjacencyList('A-B=10');
    }).toThrow();
  });

  it('Should add vertices on canvas click avoiding vertex overlapping bounds', () => {
    const mockCallback = vi.fn();
    const engine = new InteractivePlaygroundEngine(mockCallback);

    // Click nút thứ nhất tại (100, 100) -> Thêm thành công nút 'A'
    engine.handleDoubleClick(100, 100);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Click nút thứ hai đè sát (110, 110) -> Bị chặn va chạm overlap -> Không thêm nút 'B'
    engine.handleDoubleClick(110, 110);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Số lần gọi không tăng
  });
});
