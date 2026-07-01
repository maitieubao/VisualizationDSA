import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type {
  ThreadInstance,
  LockInstance,
  ConcurrencyScenario,
  ConcurrencySnapshot,
  PlaybackMode,
  ScenarioStep,
} from '../types/concurrency.types';
import {
  ConcurrencySimulationEngine,
  DeadlockDetector,
} from '../engine/ConcurrencySimulationEngine';
import { getScenarioById, CONCURRENCY_SCENARIOS } from '../scenarios/concurrencyScenarios';

export const useConcurrencyStore = defineStore('concurrency', () => {
  const threads = ref<ThreadInstance[]>([]);
  const locks = ref<Record<string, LockInstance>>({});
  const sharedCounter = ref(0);

  const isPlaying = ref(false);
  const playSpeed = ref(1.0);
  const isDeadlocked = ref(false);
  const deadlockedThreadIds = ref<string[]>([]);
  const selectedScenarioId = ref('race-condition');
  const mutexEnabled = ref(true);
  const playbackMode = ref<PlaybackMode>('IDLE');

  const currentStepIndex = ref(0);
  const scenarioSteps = shallowRef<ScenarioStep[]>([]);
  const activeScenario = ref<ConcurrencyScenario | null>(null);

  const history = shallowRef<ConcurrencySnapshot[]>([]);

  let simulationEngine: ConcurrencySimulationEngine | null = null;
  let animationTimerId: ReturnType<typeof setTimeout> | null = null;

  const totalSteps = computed(() => scenarioSteps.value.length);

  const progressPercent = computed(() => {
    if (totalSteps.value === 0) return 0;
    return Math.round((currentStepIndex.value / totalSteps.value) * 100);
  });

  const allThreadsFinished = computed(() =>
    threads.value.length > 0 && threads.value.every(t => t.state === 'FINISHED'),
  );

  const scenarioList = computed(() =>
    CONCURRENCY_SCENARIOS.map(s => ({ id: s.id, title: s.title, description: s.description })),
  );

  function captureSnapshot(): ConcurrencySnapshot {
    return {
      threads: threads.value.map(t => ({
        ...t,
        heldLocks: [...t.heldLocks],
      })),
      locks: Object.fromEntries(
        Object.entries(locks.value).map(([k, v]) => [
          k,
          { ...v, waitingQueue: [...v.waitingQueue] },
        ]),
      ),
      sharedCounter: sharedCounter.value,
      isDeadlocked: isDeadlocked.value,
      deadlockedThreadIds: [...deadlockedThreadIds.value],
      stepIndex: currentStepIndex.value,
      totalSteps: totalSteps.value,
    };
  }

  function restoreSnapshot(snap: ConcurrencySnapshot): void {
    threads.value = snap.threads.map(t => ({ ...t, heldLocks: [...t.heldLocks] }));
    locks.value = Object.fromEntries(
      Object.entries(snap.locks).map(([k, v]) => [
        k,
        { ...v, waitingQueue: [...v.waitingQueue] },
      ]),
    );
    sharedCounter.value = snap.sharedCounter;
    isDeadlocked.value = snap.isDeadlocked;
    deadlockedThreadIds.value = [...snap.deadlockedThreadIds];
    currentStepIndex.value = snap.stepIndex;

    simulationEngine = new ConcurrencySimulationEngine(
      threads.value,
      Object.keys(locks.value),
      Object.fromEntries(Object.entries(locks.value).map(([k, v]) => [k, v.name])),
    );
  }

  function initializeScenario(scenarioId: string): void {
    isPlaying.value = false;
    clearTimer();

    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;

    selectedScenarioId.value = scenarioId;
    activeScenario.value = scenario;
    mutexEnabled.value = scenario.mutexEnabled;
    isDeadlocked.value = false;
    deadlockedThreadIds.value = [];
    sharedCounter.value = 0;
    currentStepIndex.value = 0;
    playbackMode.value = 'IDLE';

    threads.value = scenario.threads.map(t => ({
      ...t,
      state: 'READY' as const,
      progress: 0,
      heldLocks: [],
      waitingForLock: null,
    }));

    const lockEntries: Record<string, LockInstance> = {};
    for (const lockId of scenario.lockIds) {
      lockEntries[lockId] = {
        id: lockId,
        name: scenario.lockNames[lockId] ?? lockId,
        heldByThreadId: null,
        waitingQueue: [],
      };
    }
    locks.value = lockEntries;

    scenarioSteps.value = scenario.steps;

    simulationEngine = new ConcurrencySimulationEngine(
      threads.value,
      scenario.lockIds,
      scenario.lockNames,
    );

    history.value = [captureSnapshot()];
  }

  function executeStep(step: ScenarioStep): void {
    if (!simulationEngine) return;

    switch (step.action) {
      case 'MOVE':
        if (step.progressTarget !== undefined) {
          const thread = threads.value.find(t => t.id === step.threadId);
          if (thread && thread.state !== 'BLOCKED') {
            const delta = step.progressTarget - thread.progress;
            if (delta > 0) {
              simulationEngine.moveThread(step.threadId, delta);
            }
          }
        }
        break;

      case 'ACQUIRE_LOCK':
        if (step.lockId) {
          if (mutexEnabled.value) {
            simulationEngine.acquireLock(step.threadId, step.lockId);
          }
        }
        break;

      case 'RELEASE_LOCK':
        if (step.lockId) {
          simulationEngine.releaseLock(step.threadId, step.lockId);
        }
        break;

      case 'INCREMENT_COUNTER':
        simulationEngine.incrementCounter();
        break;

      case 'READ_COUNTER':
        simulationEngine.readCounter();
        break;
    }

    const engineState = simulationEngine.getEngineState();
    threads.value = engineState.threads.map(t => ({ ...t, heldLocks: [...t.heldLocks] }));

    const locksCopy: Record<string, LockInstance> = {};
    for (const [k, v] of Object.entries(engineState.locks)) {
      locksCopy[k] = { ...v, waitingQueue: [...v.waitingQueue] };
    }
    locks.value = locksCopy;
    sharedCounter.value = engineState.sharedCounter;

    const deadlockCheck = DeadlockDetector.detectDeadlock(threads.value, locks.value);
    if (deadlockCheck.isDeadlocked) {
      isDeadlocked.value = true;
      isPlaying.value = false;
      deadlockedThreadIds.value = deadlockCheck.cycleThreadIds;
      playbackMode.value = 'DEADLOCKED';
    }
  }

  function stepForward(): void {
    if (isDeadlocked.value) return;
    if (currentStepIndex.value >= totalSteps.value) return;

    const step = scenarioSteps.value[currentStepIndex.value];
    executeStep(step);
    currentStepIndex.value += 1;

    history.value = [...history.value.slice(0, currentStepIndex.value), captureSnapshot()];

    if (currentStepIndex.value >= totalSteps.value && !isDeadlocked.value) {
      playbackMode.value = 'FINISHED';
      isPlaying.value = false;
      clearTimer();
    }
  }

  function stepBackward(): void {
    if (currentStepIndex.value <= 0) return;

    const targetIndex = currentStepIndex.value - 1;
    const snap = history.value[targetIndex];
    if (snap) {
      restoreSnapshot(snap);
      if (playbackMode.value === 'DEADLOCKED' || playbackMode.value === 'FINISHED') {
        playbackMode.value = 'PAUSED';
      }
    }
  }

  function startSimulation(): void {
    if (isDeadlocked.value) return;
    if (currentStepIndex.value >= totalSteps.value) return;

    isPlaying.value = true;
    playbackMode.value = 'PLAYING';
    scheduleNextTick();
  }

  function pauseSimulation(): void {
    isPlaying.value = false;
    playbackMode.value = 'PAUSED';
    clearTimer();
  }

  function stopSimulation(): void {
    isPlaying.value = false;
    clearTimer();

    const scenarioId = activeScenario.value?.id;
    if (scenarioId) {
      initializeScenario(scenarioId);
    }
  }

  function togglePlayPause(): void {
    if (isDeadlocked.value) return;

    if (playbackMode.value === 'FINISHED') {
      stopSimulation();
      startSimulation();
      return;
    }

    if (isPlaying.value) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  }

  function scrubToStep(targetStep: number): void {
    const clamped = Math.max(0, Math.min(targetStep, totalSteps.value));
    const wasPlaying = isPlaying.value;
    if (wasPlaying) pauseSimulation();

    if (clamped < currentStepIndex.value) {
      const snap = history.value[clamped];
      if (snap) {
        restoreSnapshot(snap);
      }
    } else {
      while (currentStepIndex.value < clamped && !isDeadlocked.value) {
        stepForward();
      }
    }

    if (wasPlaying && !isDeadlocked.value && currentStepIndex.value < totalSteps.value) {
      startSimulation();
    }
  }

  function setSpeed(speed: number): void {
    playSpeed.value = Math.max(0.25, Math.min(4, speed));
  }

  function setMutexEnabled(enabled: boolean): void {
    const scenarioId = activeScenario.value?.id;
    if (scenarioId) {
      initializeScenario(scenarioId);
    }
    mutexEnabled.value = enabled;
  }

  function scheduleNextTick(): void {
    if (!isPlaying.value || isDeadlocked.value) return;
    if (currentStepIndex.value >= totalSteps.value) {
      playbackMode.value = 'FINISHED';
      isPlaying.value = false;
      return;
    }

    const delay = Math.round(400 / playSpeed.value);
    animationTimerId = setTimeout(() => {
      stepForward();
      if (isPlaying.value && !isDeadlocked.value && currentStepIndex.value < totalSteps.value) {
        scheduleNextTick();
      }
    }, delay);
  }

  function clearTimer(): void {
    if (animationTimerId !== null) {
      clearTimeout(animationTimerId);
      animationTimerId = null;
    }
  }

  function cleanup(): void {
    clearTimer();
    simulationEngine = null;
    threads.value = [];
    locks.value = {};
    history.value = [];
    playbackMode.value = 'IDLE';
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
    mutexEnabled,
    playbackMode,
    currentStepIndex,
    totalSteps,
    progressPercent,
    allThreadsFinished,
    scenarioList,
    activeScenario,

    initializeScenario,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    togglePlayPause,
    stepForward,
    stepBackward,
    scrubToStep,
    setSpeed,
    setMutexEnabled,
    cleanup,
  };
});
