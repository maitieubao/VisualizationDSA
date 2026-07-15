# 🗄️ State Management - useOOPVisualizerStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useOOPVisualizerStore** chịu trách nhiệm điều phối danh sách các lớp đã đăng ký, cấp phát ô nhớ đối tượng Heap Object ảo và theo dõi cuộc gọi đa hình.

---

## 1. Cấu trúc Mã nguồn Store (`useOOPVisualizerStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp đồng bộ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { OOPReflectionEngine, ClassDefinition, HeapObjectInstance } from '../utils/OOPReflectionEngine';

export const useOOPVisualizerStore = defineStore('oopVisualizer', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const registeredClasses = ref<ClassDefinition[]>([]);
  const heapObjects = ref<HeapObjectInstance[]>([]);
  const activeExecutionPointer = ref({
    callerClass: 'Main',
    activeObjectAddress: '',
    activeMethod: '',
    dispatchStatus: 'IDLE' // IDLE | SEEKING_VTABLE | DISPATCHED | ACCESS_VIOLATED
  });

  const lastEncapsulationError = ref<string | null>(null);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đăng ký thiết lập một sơ đồ lớp mới
   */
  function registerClass(config: ClassDefinition) {
    registeredClasses.value.push(config);
    OOPReflectionEngine.registerClass(config);
  }

  /**
   * Cấp phát đối tượng mới trên Heap ảo (New Instance Allocation)
   */
  function instantiateNewObject(className: string): string {
    try {
      const newInstance = OOPReflectionEngine.instantiateObject(className);
      heapObjects.value.push(newInstance);
      return newInstance.address;
    } catch (err: any) {
      console.error(err.message);
      return '';
    }
  }

  /**
   * Thực thi cuộc gọi đa hình động (Virtual Dynamic Dispatch)
   */
  function triggerPolymorphicCall(
    objectAddress: string,
    methodName: string,
    callerClass: string
  ) {
    const obj = heapObjects.value.find(o => o.address === objectAddress);
    if (!obj) return;

    activeExecutionPointer.value = {
      callerClass,
      activeObjectAddress: objectAddress,
      activeMethod: methodName,
      dispatchStatus: 'SEEKING_VTABLE'
    };

    // Phân giải VTable Lookup sau 800ms hoạt ảnh chuyển động laser
    setTimeout(() => {
      const resolvedClass = obj.vTable.get(methodName);
      if (resolvedClass) {
        activeExecutionPointer.value.dispatchStatus = 'DISPATCHED';
        console.log(`DYNAMIC_DISPATCH_SUCCESS: Phương thức '${methodName}' được định tuyến thành công sang lớp '${resolvedClass}'.`);
      }
    }, 800);
  }

  /**
   * Cố tình nhấp truy cập thuộc tính (Kiểm soát đóng gói)
   */
  function tryAccessProperty(
    targetClass: string,
    propertyName: string,
    callerClass: string
  ): boolean {
    const res = OOPReflectionEngine.validateEncapsulationAccess(targetClass, propertyName, callerClass);
    
    if (!res.hasAccess) {
      lastEncapsulationError.value = res.errorReason || 'Vi phạm quyền đóng gói.';
      activeExecutionPointer.value.dispatchStatus = 'ACCESS_VIOLATED';
      
      // Tự động xóa lỗi sau 2 giây rung lắc
      setTimeout(() => {
        lastEncapsulationError.value = null;
        activeExecutionPointer.value.dispatchStatus = 'IDLE';
      }, 2000);

      return false;
    }

    lastEncapsulationError.value = null;
    return true;
  }

  /**
   * Giải phóng bộ nhớ Heap dọn dẹp RAM triệt để
   */
  function resetHeapMemory() {
    heapObjects.value = [];
    registeredClasses.value = [];
    OOPReflectionEngine.clearRegistry();
    activeExecutionPointer.value = {
      callerClass: 'Main',
      activeObjectAddress: '',
      activeMethod: '',
      dispatchStatus: 'IDLE'
    };
    lastEncapsulationError.value = null;
  }

  return {
    registeredClasses,
    heapObjects,
    activeExecutionPointer,
    lastEncapsulationError,
    registerClass,
    instantiateNewObject,
    triggerPolymorphicCall,
    tryAccessProperty,
    resetHeapMemory
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `OOPReflectionEngine` giải quyết dynamic dispatch và access modifiers:
*   **Mô phỏng bộ nhớ Heap sinh động:** Các Heap object phân cấp với địa chỉ nhớ giả lập hiển thị trực quan reactive giúp học sinh thấu hiểu sâu sắc bản chất bộ nhớ.
*   **Trải nghiệm lỗi đóng gói tương tác:** Cơ chế tự động khôi phục `dispatchStatus` sau 2 giây rung lắc cam kết giao diện luôn phản hồi tinh tế sành điệu.
