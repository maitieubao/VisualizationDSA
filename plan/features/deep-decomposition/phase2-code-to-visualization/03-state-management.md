# 🗄️ State Management - useLiveCompilerStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useLiveCompilerStore** chịu trách nhiệm lưu trữ mã nguồn của sinh viên, điều khiển luồng Web Worker Sandbox và nạp mảng hoạt ảnh dịch chuyển trực tiếp sang Canvas.

---

## 1. Cấu trúc Mã nguồn Store (`useLiveCompilerStore.ts`)

Mã nguồn store được viết theo cú pháp setup store tiêu chuẩn để tương thích với Vue 3 Composition API:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAnimationStore } from './useAnimationStore';
import { ASTInstrumentationEngine } from '../utils/ASTInstrumentationEngine';

export interface ConsoleLogEntry {
  text: string;
  type: 'info' | 'success' | 'error' | 'warn';
  timestamp: string;
}

export const useLiveCompilerStore = defineStore('liveCompiler', () => {
  const animStore = useAnimationStore();

  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const sourceCode = ref(`function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        // Hoán vị\n        let temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n}`);
  
  const isCompiling = ref(false);
  const compilerConsoleLogs = ref<ConsoleLogEntry[]>([]);
  const hasCompileError = ref(false);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Xuất log ghi nhận vào bảng điều khiển Console
   */
  function addConsoleLog(text: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // Định dạng HH:MM:SS
    compilerConsoleLogs.value.push({ text, type, timestamp });
  }

  /**
   * Bắt đầu biên dịch và chạy sandbox mã nguồn của sinh viên
   */
  async function compileAndExecuteCode(initialArrayData: number[]) {
    isCompiling.value = true;
    hasCompileError.value = false;
    compilerConsoleLogs.value = []; // Làm sạch Console cũ

    addConsoleLog('Bắt đầu phân tích cú pháp AST...', 'info');

    // 1. Phân tích AST và Tiêm mã Tracing
    const compileResult = ASTInstrumentationEngine.compileAndInstrument(sourceCode.value);

    if (!compileResult.success || !compileResult.instrumentedCode) {
      isCompiling.value = false;
      hasCompileError.value = true;
      addConsoleLog(`Biên dịch AST thất bại: ${compileResult.error}`, 'error');
      return;
    }

    addConsoleLog('Phân tích AST thành công. Khởi chạy luồng Web Worker Sandbox...', 'success');

    // 2. Chạy luồng Web Worker Sandbox an toàn độc lập
    try {
      const generatedFrames = await runInSandboxedWorker(
        compileResult.instrumentedCode, 
        initialArrayData
      );

      addConsoleLog(`Tạo vết thực thi thành công! Sinh ra ${generatedFrames.length} bước hoạt ảnh.`, 'success');

      // 3. Nạp mảng Frame vừa biên dịch vào Animation Store chính để Canvas trích xuất hoạt ảnh
      animStore.loadCustomFrames(generatedFrames);
      animStore.goToFrame(0); // Nhảy về khung hình đầu tiên chuẩn bị chạy
      animStore.play(); // Tự động phát hoạt ảnh
    } catch (err: any) {
      hasCompileError.value = true;
      addConsoleLog(`Lỗi thực thi Sandbox: ${err.message}`, 'error');
    } finally {
      isCompiling.value = false;
    }
  }

  /**
   * Tạo luồng Web Worker cô lập thực thi và bắt lỗi vòng lặp vô hạn (Timeout)
   */
  function runInSandboxedWorker(instrumentedCode: string, arrayData: number[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // Viết script chạy cho Web Worker dưới dạng chuỗi Blob
      const workerBlobCode = `
        self.onmessage = function(e) {
          const { code, initialArray } = e.data;
          const frames = [];
          
          // Định nghĩa các hàm ghi vết hoạt ảnh thu thập Frame
          function traceCompare(arr, i, j, op) {
            frames.push({
              type: 'COMPARE',
              indices: [i, j],
              arrayState: [...arr],
              variables: {}
            });
            return op === '>' ? arr[i] > arr[j] : arr[i] < arr[j]; // Mô phỏng so sánh gốc
          }

          function traceAssign(arr, i, val) {
            arr[i] = val;
            frames.push({
              type: 'SWAP',
              indices: [i],
              arrayState: [...arr],
              variables: {}
            });
          }

          try {
            // Chạy tệp code đã tiêm mã của sinh viên
            const customFunc = new Function('arr', 'traceCompare', 'traceAssign', code + '\\n bubbleSort(arr);');
            const arrayCopy = [...initialArray];
            
            customFunc(arrayCopy, traceCompare, traceAssign);
            
            self.postMessage({ success: true, frames });
          } catch(err) {
            self.postMessage({ success: false, error: err.message });
          }
        };
      `;

      const blob = new Blob([workerBlobCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      // Thiết lập bộ ngắt thời gian Timeout Guard chống lặp vô hạn treo đơ máy (1.5 giây)
      const timeoutId = setTimeout(() => {
        worker.terminate();
        reject(new Error('Thực thi quá tải thời gian (Timeout 1.5s)! Phát hiện cấu trúc lặp vô hạn (Infinite Loop).'));
      }, 1500);

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        worker.terminate();

        const { success, frames, error } = e.data;
        if (success) {
          resolve(frames);
        } else {
          reject(new Error(error));
        }
      };

      // Gửi mã nguồn đã tiêm sang Worker bắt đầu chạy
      worker.postMessage({ code: instrumentedCode, initialArray: arrayData });
    });
  }

  function clearLogs() {
    compilerConsoleLogs.value = [];
  }

  return {
    sourceCode,
    isCompiling,
    compilerConsoleLogs,
    hasCompileError,
    compileAndExecuteCode,
    clearLogs
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Sandboxed Thread

Bằng cách sử dụng Web Worker kết hợp với `clearTimeout` và `worker.terminate()`:
*   **Bảo vệ tab học tập:** Dù sinh viên cố tình hay vô tình viết vòng lặp vô hạn `while(true)`, máy tính của sinh viên vẫn chạy mát mẻ, trình duyệt không bị đứng hình và bảng console chỉ ra lỗi lặp vô hạn tức khắc sau đúng 1.5 giây.
*   **Không phụ thuộc máy chủ:** Toàn bộ quá trình chạy cát Sandbox diễn ra tại máy cá nhân sinh viên, giúp mở rộng chịu tải hệ thống không giới hạn mà không tốn chi phí thuê VPS Server Sandbox phức tạp.
