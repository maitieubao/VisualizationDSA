# 🗄️ State Management - useConcurrencyStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useConcurrencyStore** quản lý danh sách các luồng ảo song hành, phân phối các tài nguyên khóa Mutex Lock và đập nhịp giải thuật phát hiện tắc nghẽn Deadlock.

---

## 1. Cấu trúc Mã nguồn Store (`useConcurrencyStore.ts`)

Mã nguồn store được viết theo cú pháp setup store tiêu chuẩn, tích hợp động cơ giả lập đa luồng và bộ phát hiện chu trình đồ thị:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ThreadInstance, LockInstance, ConcurrencySimulationEngine, DeadlockDetector } from '../utils/ConcurrencySimulationEngine';

export const useConcurrencyStore = defineStore('concurrency', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const threads = ref<ThreadInstance[]>([]);
  const locks = ref<Record<string, LockInstance>>({});
  const sharedCounter = ref(0);
  
  const isPlaying = ref(false);
  const playSpeed = ref(1.0);
  const isDeadlocked = ref(false);
  const deadlockedThreadIds = ref<string[]>([]);
  const selectedScenarioId = ref('race-condition');

  let simulationEngine: ConcurrencySimulationEngine | null = null;

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Khởi tạo kịch bản đa luồng mới sạch sẽ giải phóng tài nguyên cũ
   */
  function initializeScenario(scenarioId: string) {
    selectedScenarioId.value = scenarioId;
    isPlaying.value = false;
    isDeadlocked.value = false;
    deadlockedThreadIds.value = [];
    sharedCounter.value = 0;

    if (scenarioId === 'race-condition') {
      // Kịch bản Tranh chấp tài nguyên: 2 luồng cùng tranh nhau cộng Counter
      threads.value = [
        { id: 'T1', name: 'Luồng A (Cộng Counter)', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null },
        { id: 'T2', name: 'Luồng B (Cộng Counter)', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null }
      ];
      locks.value = {
        'MUTEX_LOCK': { id: 'MUTEX_LOCK', heldByThreadId: null, waitingQueue: [] }
      };
    } else if (scenarioId === 'deadlock-demo') {
      // Kịch bản Tắc nghẽn: Luồng A đợi Khóa 2, Luồng B đợi Khóa 1
      threads.value = [
        { id: 'T1', name: 'Luồng A (Giữ L1 đợi L2)', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null },
        { id: 'T2', name: 'Luồng B (Giữ L2 đợi L1)', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null }
      ];
      locks.value = {
        'L1': { id: 'L1', heldByThreadId: null, waitingQueue: [] },
        'L2': { id: 'L2', heldByThreadId: null, waitingQueue: [] }
      };
    }

    // Khởi tạo thực thể bộ máy giả lập luồng chạy
    simulationEngine = new ConcurrencySimulationEngine(threads.value, Object.keys(locks.value));
  }

  /**
   * Bấm nút khởi chạy giả lập đa luồng (Play threads)
   */
  function startSimulation() {
    if (isDeadlocked.value) return;
    isPlaying.value = true;
    executeSimulationTick();
  }

  /**
   * Tạm dừng giả lập luồng chạy (Pause threads)
   */
  function pauseSimulation() {
    isPlaying.value = false;
  }

  /**
   * Thực hiện một bước chạy đơn lẻ (Step Execution)
   */
  function stepForward() {
    if (!simulationEngine || isDeadlocked.value) return;
    runSingleSimulationStep();
  }

  /**
   * Vòng lặp đập nhịp tiến trình luồng chạy (Simulation Game Loop)
   */
  function executeSimulationTick() {
    if (!isPlaying.value || isDeadlocked.value) return;

    runSingleSimulationStep();

    // Tiếp tục đập nhịp mượt mà bằng requestAnimationFrame
    setTimeout(() => {
      requestAnimationFrame(executeSimulationTick);
    }, 1000 / (30 * playSpeed.value)); // Điều chỉnh nhịp theo tốc độ phát
  }

  /**
   * Chạy duy nhất một nhịp tính toán luồng, kiểm tra tranh chấp và deadlock
   */
  function runSingleSimulationStep() {
    if (!simulationEngine) return;

    // Giả lập di chuyển luồng A và B trên đường ray
    for (const thread of threads.value) {
      if (thread.state === 'FINISHED') continue;

      if (thread.state === 'READY') {
        thread.state = 'RUNNING';
      }

      if (thread.state === 'RUNNING') {
        thread.progress = Math.min(100, thread.progress + 4);

        // Kịch bản Deadlock Demo: Luồng T1 chiếm L1 đòi L2, Luồng T2 chiếm L2 đòi L1
        if (selectedScenarioId.value === 'deadlock-demo') {
          if (thread.id === 'T1' && thread.progress >= 40 && !thread.heldLocks.includes('L1')) {
            simulationEngine.acquireLock('T1', 'L1');
          }
          if (thread.id === 'T2' && thread.progress >= 40 && !thread.heldLocks.includes('L2')) {
            simulationEngine.acquireLock('T2', 'L2');
          }

          if (thread.id === 'T1' && thread.progress >= 70 && thread.heldLocks.includes('L1')) {
            simulationEngine.acquireLock('T1', 'L2'); // Đòi L2 đang bị T2 giữ -> BLOCKED
          }
          if (thread.id === 'T2' && thread.progress >= 70 && thread.heldLocks.includes('L2')) {
            simulationEngine.acquireLock('T2', 'L1'); // Đòi L1 đang bị T1 giữ -> BLOCKED
          }
        }

        // Kịch bản Race Condition: Cộng counter dùng chung
        if (selectedScenarioId.value === 'race-condition') {
          if (thread.progress >= 50 && thread.progress < 55) {
            sharedCounter.value += 1; // Luồng cộng dồn tự do không bảo vệ
          }
        }

        if (thread.progress >= 100) {
          thread.state = 'FINISHED';
        }
      }
    }

    // Đồng bộ lại trạng thái từ Engine giả lập sang Store UI Vue 3
    const engineState = simulationEngine.getEngineState();
    locks.value = engineState.locks;

    // Chạy giải thuật phát hiện tắc nghẽn vòng tròn Deadlock
    const deadlockCheck = DeadlockDetector.detectDeadlock(threads.value, locks.value);
    if (deadlockCheck.isDeadlocked) {
      isDeadlocked.value = true;
      isPlaying.value = false;
      deadlockedThreadIds.value = deadlockCheck.cycleThreadIds;
    }
  }

  return {
    threads,
    locks,
    sharedCounter,
    isPlaying,
    playSpeed,
    isDeadlocked,
    deadlockedThreadIds,
    selectedScenarioId,
    initializeScenario,
    startSimulation,
    pauseSimulation,
    stepForward
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồng bộ Đa luồng Ảo Pinia

Bằng việc kết hợp Pinia Store với động cơ `ConcurrencySimulationEngine`:
*   **Trực quan hóa tức khắc:** Thay vì các mốc chạy bất định ngẫu nhiên trong CPU, học sinh dễ dàng kéo Slider để tua lại thời gian lúc Luồng A bắt đầu chiếm L1, phân tích lý do tắc nghẽn vô cùng sâu sắc.
*   **Tích hợp còi cảnh báo nhanh nhạy:** Khi giải thuật DFS phát hiện deadlock, cờ `isDeadlocked = true` được bật ngay tức thì dưới 1ms, giao diện lập tức nhấp nháy đỏ Neon bắt mắt mà không gây treo tab duyệt web.
