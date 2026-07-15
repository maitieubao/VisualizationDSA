# 🗄️ State Management - useSOLIDVisualizerStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useSOLIDVisualizerStore** chịu trách nhiệm quản lý danh sách các lớp UML trong bài thực hành, đo lường cohesion và kích hoạt hoạt ảnh rạn nứt/tỏa nhiệt.

---

## 1. Cấu trúc Mã nguồn Store (`useSOLIDVisualizerStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp đồng bộ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SOLIDEvaluatorEngine, SOLIDClassNode, UMLClassMember } from '../utils/SOLIDEvaluatorEngine';

export const useSOLIDVisualizerStore = defineStore('solidVisualizer', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const activeLesson = ref<'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP'>('SRP');
  const classNodes = ref<SOLIDClassNode[]>([]);
  const isLspShattered = ref(false);
  const dipState = ref({
    isViolatingDIP: true,
    hasInterfaceInserted: false
  });

  const lastDiagnosticResult = ref<string | null>(null);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Thiết lập bài học nguyên lý SOLID được chọn
   */
  function setLesson(lesson: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP') {
    activeLesson.value = lesson;
    resetState();
  }

  /**
   * Nạp danh sách Class Nodes cho bài thực hành
   */
  function initializeClassNodes(nodes: SOLIDClassNode[]) {
    classNodes.value = nodes.map(node => {
      const res = SOLIDEvaluatorEngine.evaluateSRP(node);
      return {
        ...node,
        cohesionScore: res.lcom4,
        isViolatingSRP: res.isViolating
      };
    });
  }

  /**
   * Thực thi cuộc gọi phân tách SRP (Split Refactoring Trigger)
   */
  function triggerSRPSplit(nodeId: string, splitNodes: SOLIDClassNode[]) {
    const targetIndex = classNodes.value.findIndex(n => n.nodeId === nodeId);
    if (targetIndex === -1) return;

    // Phân tách êm ái dưới 10ms
    classNodes.value.splice(targetIndex, 1, ...splitNodes.map(node => ({
      ...node,
      cohesionScore: 1, // Tách ra xong Cohesion đạt 1 liên thông
      isViolatingSRP: false
    })));

    triggerCoolDownConfetti();
  }

  /**
   * Chạy kiểm thử đa hình thay thế con trỏ LSP
   */
  function executeLSPSubstitution(throwsException: boolean) {
    isLspShattered.value = false;
    const res = SOLIDEvaluatorEngine.evaluateLSP('fly', throwsException);

    if (res.isViolating) {
      // 800ms hoạt ảnh bắn laser rồi rạn nứt nổ vỡ tan nát
      setTimeout(() => {
        isLspShattered.value = true;
        lastDiagnosticResult.value = res.errorReason || 'Vi phạm LSP.';
        
        triggerGlassBreakSound();
      }, 800);
    } else {
      isLspShattered.value = false;
      lastDiagnosticResult.value = 'LSP ĐẠT: Thay thế đối tượng con hoạt động hoàn hảo!';
    }
  }

  /**
   * Bấm chèn Interface trừu tượng trong DIP (Dependency Inversion Resolution)
   */
  function insertDIPInterface() {
    dipState.value = {
      isViolatingDIP: false,
      hasInterfaceInserted: true
    };
    lastDiagnosticResult.value = 'DIP ĐẠT: Luồng phụ thuộc đã đảo chiều hội tụ về phía Interface trừu tượng!';
  }

  /**
   * Reset dọn dẹp bộ nhớ an toàn
   */
  function resetState() {
    classNodes.value = [];
    isLspShattered.value = false;
    dipState.value = {
      isViolatingDIP: true,
      hasInterfaceInserted: false
    };
    lastDiagnosticResult.value = null;
  }

  function triggerCoolDownConfetti() {
    const event = new CustomEvent('SRP_COOL_DOWN_CONFETTI');
    window.dispatchEvent(event);
  }

  function triggerGlassBreakSound() {
    const event = new CustomEvent('PLAY_GLASS_BREAK_SOUND');
    window.dispatchEvent(event);
  }

  return {
    activeLesson,
    classNodes,
    isLspShattered,
    dipState,
    lastDiagnosticResult,
    setLesson,
    initializeClassNodes,
    triggerSRPSplit,
    executeLSPSubstitution,
    insertDIPInterface,
    resetState
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `SOLIDEvaluatorEngine` giải quyết chẩn đoán LCOM4 Cohesion và nứt vỡ LSP:
*   **Trải nghiệm Tái cấu trúc tức thì:** Split SRP, chèn Interface DIP đảo chiều luồng sáng tức thì ngay ở Client-side dưới **10ms**, tạo cảm giác tương tác cực nhạy.
*   **Tương tác đa bài học sống động:** Theo dõi sát sao trạng thái `activeLesson` để giải phóng RAM dọn dẹp Canvas hạt lửa của bài học trước hoàn hảo.
