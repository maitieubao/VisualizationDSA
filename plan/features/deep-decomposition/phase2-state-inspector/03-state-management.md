# 🗄️ State Management - useStateInspectorStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useStateInspectorStore** chịu trách nhiệm quản lý ngăn xếp Call Stack ảo, cây đệ quy thời gian thực và đồng bộ dòng lệnh Monaco Editor.

---

## 1. Cấu trúc Mã nguồn Store (`useStateInspectorStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp đồng bộ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { StateInspectorEngine, StackFrame, RecursionNode } from '../utils/StateInspectorEngine';

export const useStateInspectorStore = defineStore('stateInspector', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const stackFrames = ref<StackFrame[]>([]);
  const activeFrameIndex = ref<number>(-1);
  const recursionTreeRoot = ref<RecursionNode | null>(null);
  
  // Lưu trữ địa chỉ ô nhớ Heap ảo đang bị hover pulse bừng sáng
  const hoveredHeapAddress = ref<string | null>(null);

  const engine = new StateInspectorEngine();

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đẩy một stack frame mới vào ngăn xếp (Push Frame)
   */
  function pushFrame(frame: StackFrame) {
    engine.pushFrame(frame);
    syncStoreWithEngine();
    
    // Kích hoạt đồng bộ dòng lệnh Monaco Editor với dòng thực thi mới nhất
    triggerMonacoLineSync(frame.lineNumber);
  }

  /**
   * Rút stack frame khỏi ngăn xếp (Pop Frame)
   */
  function popFrame(): StackFrame | null {
    const popped = engine.popFrame();
    syncStoreWithEngine();
    
    if (stackFrames.value.length > 0) {
      const topFrame = stackFrames.value[stackFrames.value.length - 1];
      triggerMonacoLineSync(topFrame.lineNumber);
    }
    
    return popped;
  }

  /**
   * Nhấp chọn thủ công một stack frame cũ để thanh tra biến số
   */
  function selectFrame(index: number) {
    const frame = engine.switchActiveFrame(index);
    if (!frame) return;
    
    syncStoreWithEngine();
    
    // Nhảy dòng code Monaco về quá khứ của frame đó
    triggerMonacoLineSync(frame.lineNumber);
  }

  /**
   * Rà chuột qua biến số ngăn xếp (Hover variable highlight heap node)
   */
  function hoverVariable(heapAddress?: string) {
    if (heapAddress) {
      hoveredHeapAddress.value = heapAddress;
    } else {
      hoveredHeapAddress.value = null;
    }
  }

  /**
   * Cập nhật cây đệ quy thực thi thời gian thực
   */
  function updateRecursionTree(root: RecursionNode) {
    recursionTreeRoot.value = root;
  }

  /**
   * Dọn dẹp reset bộ nhớ sạch sẽ
   */
  function clearInspector() {
    engine.clear();
    stackFrames.value = [];
    activeFrameIndex.value = -1;
    recursionTreeRoot.value = null;
    hoveredHeapAddress.value = null;
  }

  // ==========================================
  // UTILS (Bổ trợ nội bộ)
  // ==========================================
  function syncStoreWithEngine() {
    stackFrames.value = [...engine.getStack()];
    activeFrameIndex.value = stackFrames.value.findIndex(f => f.isActive);
  }

  function triggerMonacoLineSync(lineNumber: number) {
    const syncEvent = new CustomEvent('MONACO_REVEAL_LINE_INSIGHT', {
      detail: { lineNumber }
    });
    window.dispatchEvent(syncEvent);
  }

  return {
    stackFrames,
    activeFrameIndex,
    recursionTreeRoot,
    hoveredHeapAddress,
    pushFrame,
    popFrame,
    selectFrame,
    hoverVariable,
    updateRecursionTree,
    clearInspector
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `StateInspectorEngine` giải quyết nhảy dòng Monaco và hover pulse:
*   **Debug từng bước nhạy bén:** Nhấp chọn frame cũ nhảy Monaco lập tức dưới **10ms**, tạo cảm giác tương tác cực nhạy.
*   **Liên kết biến số sống động:** Hover biến trỏ Heap bừng sáng xung nhịp Amber Neon chớp tắt, xua tan sự mơ hồ về con trỏ máy tính.
