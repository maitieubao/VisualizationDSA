# 🗄️ State Management - useLiveDebuggerStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useLiveDebuggerStore** chịu trách nhiệm lưu trữ danh sách các điểm dừng Breakpoint, dòng lệnh gỡ lỗi hiện hành và ngăn xếp đệ quy Call Stack.

---

## 1. Cấu trúc Mã nguồn Store (`useLiveDebuggerStore.ts`)

Mã nguồn store được viết theo cú pháp setup store tiêu chuẩn để tương thích với Vue 3 Composition API:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LiveCompilerDebugger, DebugStepPayload } from '../utils/LiveCompilerDebugger';
import { ASTInstrumentationEngine } from '../utils/ASTInstrumentationEngine';

export const useLiveDebuggerStore = defineStore('liveDebugger', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const activeBreakpoints = ref<number[]>([]);
  const currentLineNumber = ref<number | null>(null);
  const callStackFrames = ref<string[]>([]);
  const watchedVariables = ref<Record<string, any>>({});
  
  const isDebugging = ref(false);
  const isPaused = ref(false);
  const mutatedVariablesKeys = ref<string[]>([]); // Ghi nhận các biến bị đổi giá trị ở dòng này

  let debuggerInstance: LiveCompilerDebugger | null = null;

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Thêm hoặc gỡ một điểm dừng Breakpoint tại dòng code
   */
  function toggleBreakpoint(lineNumber: number) {
    const index = activeBreakpoints.value.indexOf(lineNumber);
    if (index > -1) {
      activeBreakpoints.value.splice(index, 1);
    } else {
      activeBreakpoints.value.push(lineNumber);
    }

    // Đồng bộ tức khắc vào động cơ Debugger nếu đang chạy
    if (debuggerInstance) {
      debuggerInstance.setBreakpoints(activeBreakpoints.value);
    }
  }

  /**
   * Khởi động phiên Debugger cô-ru-tin
   */
  function startDebuggingSession(sourceCode: string, initialArray: number[]) {
    isDebugging.value = true;
    isPaused.value = true;
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariablesKeys.value = [];

    // 1. Phân tích AST và Tiêm mã yield Generator
    const compileResult = ASTInstrumentationEngine.compileAndInstrumentToGenerator(sourceCode);
    if (!compileResult.success || !compileResult.generatedFunction) {
      console.error('Debug AST compiling failed:', compileResult.error);
      return;
    }

    // 2. Khởi tạo thực thể Debugger
    const generatorWrapper = () => compileResult.generatedFunction!(initialArray);
    debuggerInstance = new LiveCompilerDebugger(generatorWrapper);
    debuggerInstance.setBreakpoints(activeBreakpoints.value);

    // 3. Tiến nhịp đầu tiên nhảy tới dòng code thực thi đầu
    stepForward();
  }

  /**
   * Nhảy bước qua dòng lệnh kế tiếp (Step Over / Into)
   */
  function stepForward() {
    if (!debuggerInstance) return;

    const payload = debuggerInstance.stepForward();
    if (payload) {
      syncDebuggerPayload(payload);
    } else {
      stopDebuggingSession();
    }
  }

  /**
   * Phát liên tục cho tới khi đâm trúng điểm dừng kế tiếp (Continue)
   */
  function continueToNextBreakpoint() {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.continueToNextBreakpoint();
      if (payload) {
        syncDebuggerPayload(payload);
      } else {
        stopDebuggingSession();
      }
    } catch (err: any) {
      console.error(err.message);
      stopDebuggingSession();
    }
  }

  /**
   * Hủy phiên Debug dọn dẹp sạch sẽ tài nguyên
   */
  function stopDebuggingSession() {
    isDebugging.value = false;
    isPaused.value = false;
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariablesKeys.value = [];
    debuggerInstance = null;
  }

  /**
   * Đồng bộ hóa gói thông tin bước chạy từ Động cơ sang Pinia Store UI Vue 3
   */
  function syncDebuggerPayload(payload: DebugStepPayload) {
    currentLineNumber.value = payload.lineNumber;
    callStackFrames.value = payload.callStack;

    // Phân tích xem có biến chạy nào bị biến đổi giá trị để phát sáng Neon
    const nextMutatedKeys: string[] = [];
    for (const key of Object.keys(payload.variables)) {
      if (watchedVariables.value[key] !== payload.variables[key]) {
        nextMutatedKeys.push(key);
      }
    }
    mutatedVariablesKeys.value = nextMutatedKeys;
    watchedVariables.value = payload.variables;
  }

  return {
    activeBreakpoints,
    currentLineNumber,
    callStackFrames,
    watchedVariables,
    isDebugging,
    isPaused,
    mutatedVariablesKeys,
    toggleBreakpoint,
    startDebuggingSession,
    stepForward,
    continueToNextBreakpoint,
    stopDebuggingSession
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đập nhịp Iterator Pinia Store

Bằng việc tích hợp trực tiếp Dynamic Coroutine Debugger vào Pinia Setup Store:
*   **Đồng bộ Canvas hoàn hảo:** Mỗi bước `stepForward()` tự động cập nhật mảng `arrayState` giúp Canvas vẽ lại hoạt ảnh mượt mà, khớp chuẩn xác với dòng code Monaco đang phát sáng Cyan.
*   **Theo dõi biến đổi thời gian thực:** Trích xuất biến mutated và ghi nhận vào `mutatedVariablesKeys` giúp UI gỡ lỗi gán viền Neon lộng lẫy và bắt mắt.
