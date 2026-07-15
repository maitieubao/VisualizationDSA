# 🗄️ State Management - useDesignPatternsStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useDesignPatternsStore** quản lý danh sách các hộp thẻ lớp UML, tính toán uốn lượn đường vẽ Bezier và phối hợp kích hoạt các hoạt ảnh Strategy/Observer runtime.

---

## 1. Cấu trúc Mã nguồn Store (`useDesignPatternsStore.ts`)

Mã nguồn store được viết theo cú pháp setup store để đảm bảo hiệu năng tối ưu:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UMLNode, UMLLink, DesignPatternVisualizerEngine } from '../utils/DesignPatternVisualizerEngine';

export const useDesignPatternsStore = defineStore('designPatterns', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const nodes = ref<UMLNode[]>([]);
  const links = ref<UMLLink[]>([]);
  const activePatternId = ref('strategy-pattern');
  
  const isDIPEnabled = ref(false);
  const isObserverNotifying = ref(false);
  const activeStrategyTargetId = ref('bubble-sort');

  let visualizerEngine: DesignPatternVisualizerEngine | null = null;

  // ==========================================
  // GETTERS (Bộ tính toán)
  // ==========================================
  
  /**
   * Tính toán chỉ số khớp nối liên kết (Coupling Index Metric)
   */
  const couplingIndexMetric = computed(() => {
    if (activePatternId.value === 'solid-dip') {
      return isDIPEnabled.value ? 20 : 85; // Bật DIP giảm khớp nối từ 85% cứng xuống 20% lỏng lẻo
    }
    return 35;
  });

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Khởi tạo kịch bản thiết kế mẫu mới
   */
  function initializeScenario(patternId: string) {
    activePatternId.value = patternId;
    isObserverNotifying.value = false;

    if (patternId === 'strategy-pattern') {
      nodes.value = [
        { id: 'Client', name: 'SorterClient', type: 'class', x: 200, y: 50, width: 140, height: 60 },
        { id: 'Strategy', name: 'ISortStrategy', type: 'interface', x: 200, y: 180, width: 140, height: 60 },
        { id: 'Bubble', name: 'BubbleSort', type: 'class', x: 100, y: 320, width: 120, height: 60 },
        { id: 'Quick', name: 'QuickSort', type: 'class', x: 300, y: 320, width: 120, height: 60 }
      ];
      links.value = [
        { id: 'ClientToStrategy', sourceId: 'Client', targetId: 'Strategy', type: 'dependency' },
        { id: 'BubbleToStrategy', sourceId: 'Bubble', targetId: 'Strategy', type: 'realization' },
        { id: 'QuickToStrategy', sourceId: 'Quick', targetId: 'Strategy', type: 'realization' }
      ];
      activeStrategyTargetId.value = 'Bubble';
    } else if (patternId === 'solid-dip') {
      // Dựng kịch bản khớp nối DIP
      nodes.value = [
        { id: 'HighModule', name: 'ReportingService', type: 'class', x: 200, y: 50, width: 160, height: 60 },
        { id: 'LowModule', name: 'SupabaseDatabase', type: 'class', x: 200, y: 320, width: 160, height: 60 }
      ];
      links.value = [
        { id: 'DirectCoupling', sourceId: 'HighModule', targetId: 'LowModule', type: 'dependency' }
      ];
      isDIPEnabled.value = false;
    }

    visualizerEngine = new DesignPatternVisualizerEngine(nodes.value, links.value);
  }

  /**
   * Kéo thả cập nhật tọa độ Node trực tiếp từ UI
   */
  function handleNodeDrag(nodeId: string, x: number, y: number) {
    if (visualizerEngine) {
      visualizerEngine.updateNodePosition(nodeId, x, y);
    }
  }

  /**
   * Hoán đổi Dynamic Strategy Runtime
   */
  function switchStrategy(targetId: string) {
    if (!visualizerEngine) return;
    activeStrategyTargetId.value = targetId;

    // Kéo giãn snap đường vẽ phụ thuộc từ Client sang concrete Strategy cụ thể
    visualizerEngine.swapStrategyTarget('ClientToStrategy', targetId);
  }

  /**
   * Gửi tín hiệu thông báo Observer
   */
  function triggerObserverNotify() {
    isObserverNotifying.value = true;
    setTimeout(() => {
      isObserverNotifying.value = false; // Tắt tia sáng Neon sau 2s
    }, 2000);
  }

  /**
   * Bật tắt công tắc DIP Mode tách rời khớp nối cứng
   */
  function toggleDIP() {
    isDIPEnabled.value = !isDIPEnabled.value;
    
    if (isDIPEnabled.value) {
      // Thêm IDatabase Interface làm trung gian
      nodes.value.push({ id: 'IDatabase', name: 'IDatabaseInterface', type: 'interface', x: 200, y: 180, width: 160, height: 60 });
      
      // Viết lại sơ đồ liên kết decoupled lỏng lẻo
      links.value = [
        { id: 'HighToInterface', sourceId: 'HighModule', targetId: 'IDatabase', type: 'dependency' },
        { id: 'LowToInterface', sourceId: 'LowModule', targetId: 'IDatabase', type: 'realization' }
      ];
    } else {
      // Quay về khớp nối cứng thô sơ ban đầu
      nodes.value = nodes.value.filter(n => n.id !== 'IDatabase');
      links.value = [
        { id: 'DirectCoupling', sourceId: 'HighModule', targetId: 'LowModule', type: 'dependency' }
      ];
    }

    visualizerEngine = new DesignPatternVisualizerEngine(nodes.value, links.value);
  }

  return {
    nodes,
    links,
    activePatternId,
    isDIPEnabled,
    isObserverNotifying,
    activeStrategyTargetId,
    couplingIndexMetric,
    initializeScenario,
    handleNodeDrag,
    switchStrategy,
    triggerObserverNotify,
    toggleDIP
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `DesignPatternVisualizerEngine`:
*   **Kéo thả tức thời 60 FPS:** Lớp Vue 3 Reactive cập nhật trực tiếp mảng tọa độ `x`, `y` của các Node hộp mờ, các đường dẫn SVG bám đuổi uốn cong mượt mà theo cử chỉ kéo chuột của học viên mà không hề trễ hình.
*   **Chỉ số Coupling nhảy động:** Khi bật/tắt công tắc DIP Sandbox, widget Coupling Index giảm mạnh từ 85% xuống 20% kèm hoạt ảnh phát sáng Emerald rực rỡ, để lại ấn tượng tri thức sâu đậm cho người học.
