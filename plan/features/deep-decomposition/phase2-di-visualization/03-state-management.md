# 🗄️ State Management - useIoCDebuggerStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useIoCDebuggerStore** chịu trách nhiệm lưu trữ cấu hình registry dịch vụ, quản lý trạng thái các thực thể Singleton đã khởi tạo và đập nhịp hoạt ảnh phân giải đệ quy.

---

## 1. Cấu trúc Mã nguồn Store (`useIoCDebuggerStore.ts`)

Mã nguồn store được viết theo cú pháp setup store tiêu chuẩn, tích hợp động cơ giả lập IoC đệ quy:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { IoCRegistration, ResolutionStep, IoCContainerSimulator } from '../utils/IoCContainerSimulator';

export const useIoCDebuggerStore = defineStore('iocDebugger', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const registrations = ref<Record<string, IoCRegistration>>({});
  const instancedSingletons = ref<Record<string, any>>({});
  const resolutionSteps = ref<ResolutionStep[]>([]);
  const currentStepIndex = ref(-1);
  
  const isResolving = ref(false);
  const selectedServiceToResolve = ref('IUserController');
  const isCircularErrorDetected = ref(false);
  const errorMessage = ref('');

  let iocSimulator = new IoCContainerSimulator();

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đăng ký dịch vụ mới vào bộ chứa
   */
  function registerService(
    serviceType: string,
    implementationType: string,
    lifetime: 'SINGLETON' | 'TRANSIENT',
    dependencies: string[]
  ) {
    iocSimulator.register(serviceType, implementationType, lifetime, dependencies);
    
    // Đồng bộ sang UI State Vue 3
    registrations.value = { ...registrations.value };
    registrations.value[serviceType] = {
      serviceType,
      implementationType,
      lifetime,
      dependencies
    };
  }

  /**
   * Kích hoạt tiến trình phân giải đệ quy Resolve
   */
  function startResolution() {
    isResolving.value = true;
    isCircularErrorDetected.value = false;
    errorMessage.value = '';
    resolutionSteps.value = [];
    currentStepIndex.value = -1;
    iocSimulator.clearSteps();

    try {
      // Gọi phân giải đệ quy hạt nhân
      iocSimulator.resolve(selectedServiceToResolve.value);
      
      // Lấy toàn bộ dấu chân vết bước phân giải
      resolutionSteps.value = iocSimulator.getResolutionSteps();
      instancedSingletons.value = { ...iocSimulator.getSingletonVault() };
      
      // Bắt đầu chạy tuần tự hoạt ảnh từng bước (VCR Playback)
      playNextResolutionStep();
    } catch (err: any) {
      isCircularErrorDetected.value = true;
      errorMessage.value = err.message;
      isResolving.value = false;
    }
  }

  /**
   * Đập nhịp hoạt ảnh bước gỡ lỗi phân giải DI (VCR Playback loop)
   */
  function playNextResolutionStep() {
    if (currentStepIndex.value >= resolutionSteps.value.length - 1) {
      isResolving.value = false;
      return;
    }

    currentStepIndex.value++;

    // Tự động đập nhịp bước tiếp theo sau 1 giây
    setTimeout(() => {
      playNextResolutionStep();
    }, 1000);
  }

  /**
   * Khởi tạo kịch bản mặc định (Web API standard)
   */
  function loadStandardWebApiScenario() {
    registrations.value = {};
    instancedSingletons.value = {};
    resolutionSteps.value = [];
    currentStepIndex.value = -1;
    iocSimulator = new IoCContainerSimulator();

    // 1. Đăng ký Client, Service, Repository chuẩn C# ASP.NET Core
    registerService('ISupabaseClient', 'SupabaseClient', 'SINGLETON', []);
    registerService('IUserRepository', 'SupabaseUserRepository', 'SINGLETON', ['ISupabaseClient']);
    registerService('IUserService', 'UserService', 'TRANSIENT', ['IUserRepository']);
    registerService('IUserController', 'UserController', 'TRANSIENT', ['IUserService']);
  }

  return {
    registrations,
    instancedSingletons,
    resolutionSteps,
    currentStepIndex,
    isResolving,
    selectedServiceToResolve,
    isCircularErrorDetected,
    errorMessage,
    registerService,
    startResolution,
    loadStandardWebApiScenario
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đập nhịp VCR DI Pinia Store

Bằng việc tích hợp trực tiếp động cơ `IoCContainerSimulator` vào Pinia Setup Store:
*   **Trình chiếu hoạt ảnh mượt mà (VCR Playback):** Tách bạch hoàn toàn logic phản chiếu đệ quy và trình diễn UI, cho phép học sinh dễ dàng tạm dừng hoạt ảnh tiêm đối tượng hoặc bấm nút tua tiến để phân tích nhanh chóng.
*   **Cập nhật tủ kính tức thời:** Khi nhịp `currentStepIndex` nhảy qua trạng thái instantiate Singleton, thẻ vàng óng mọc lên lung linh trong tủ kính tức khắc, tạo cảm giác vô cùng diệu kỳ về cấu trúc phần mềm.
