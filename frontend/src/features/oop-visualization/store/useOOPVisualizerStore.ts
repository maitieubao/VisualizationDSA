// ============================================================
// useOOPVisualizerStore — Simplified Pinia Store
// Focused on scenario playback with animation state tracking
// Removed: Heap allocation, VTable dispatch, Laser animation
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ClassDefinition } from '../types/oop-visualization.types';
import { OOP_SCENARIOS, type OOPScenario, type ScenarioStep, type AnimationType, type AnimationTarget } from '../scenarios/oopScenarios';
import { parseEmojiToSvg } from '../../../utils/emojiParser';
import { OOP_MEMORY_STATES, type MemoryState } from '../scenarios/oopMemoryStates';

export const useOOPVisualizerStore = defineStore('oopVisualizer', () => {
  // ==========================================
  // STATE
  // ==========================================
  const registeredClasses = ref<ClassDefinition[]>([]);

  // 4 Pillars navigation
  const activePillar = ref<'encapsulation' | 'inheritance' | 'polymorphism' | 'abstraction' | 'interface'>('encapsulation');

  // Scenario playback
  const selectedScenarioId = ref<string | null>(null);
  const scenarioStepIndex = ref<number>(0);
  const isPlayingScenario = ref<boolean>(false);
  const activeCodeLines = ref<number[]>([]);

  // Autoplay
  const isAutoplayRunning = ref<boolean>(false);
  const playbackSpeed = ref<number>(1);
  const autoplayTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // Animation state — drives VisuAlgo-style animations
  const currentAnimation = ref<AnimationType>('none');
  const currentAnimationTarget = ref<AnimationTarget>({});
  const animationTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // Created objects tracker (for visual objects on screen)
  const createdObjects = ref<Array<{ className: string; id: number }>>([]);
  let objectIdCounter = 0;

  // Violation state (for shake animations)
  const lastViolation = ref<{ className: string; memberName: string; message: string } | null>(null);

  // ==========================================
  // COMPUTED
  // ==========================================
  const totalSteps = computed<number>(() => {
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    return scenario?.steps.length ?? 0;
  });

  const currentExplanation = computed<string>(() => {
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (!scenario) return '';
    const step = scenario.steps[scenarioStepIndex.value];
    return step ? parseEmojiToSvg(step.explanation) : '';
  });

  const currentLessonQuestion = computed<string>(() => {
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    return scenario ? parseEmojiToSvg(scenario.lessonQuestion) : '';
  });

  const currentScenario = computed(() => {
    if (!selectedScenarioId.value) return null;
    return OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value) ?? null;
  });

  const availableClassNames = computed(() =>
    registeredClasses.value.map((c) => c.className)
  );

  const activeMemoryState = computed<MemoryState>(() => {
    if (!selectedScenarioId.value) return { stack: [], heap: [], callStack: [] };
    const states = OOP_MEMORY_STATES[selectedScenarioId.value];
    if (!states) return { stack: [], heap: [], callStack: [] };
    return states[scenarioStepIndex.value] ?? { stack: [], heap: [], callStack: [] };
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  function initializeDemoClasses(): void {
    registeredClasses.value = [];
    createdObjects.value = [];
    objectIdCounter = 0;

    const pillar = activePillar.value;
    let classes: ClassDefinition[] = [];

    if (pillar === 'encapsulation') {
      classes = [
        {
          className: 'BankAccount',
          members: [
            { name: 'balance', type: 'FIELD', accessModifier: 'PRIVATE', returnType: 'double' },
            { name: 'BankAccount', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'constructor' },
            { name: 'Deposit', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
            { name: 'Withdraw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'bool' },
            { name: 'GetBalance', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'double' },
          ],
        },
      ];
    } else if (pillar === 'inheritance') {
      classes = [
        {
          className: 'Animal',
          members: [
            { name: 'age', type: 'FIELD', accessModifier: 'PRIVATE', returnType: 'int' },
            { name: 'Name', type: 'FIELD', accessModifier: 'PROTECTED', returnType: 'string' },
            { name: 'Eat', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
            { name: 'Sleep', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'Dog',
          parentClass: 'Animal',
          members: [
            { name: 'Fetch', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
            { name: 'Introduce', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'Cat',
          parentClass: 'Animal',
          members: [
            { name: 'Purr', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
      ];
    } else if (pillar === 'polymorphism') {
      classes = [
        {
          className: 'Animal',
          members: [
            { name: 'Speak', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
          ],
        },
        {
          className: 'Dog',
          parentClass: 'Animal',
          members: [
            { name: 'Speak', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
          ],
        },
        {
          className: 'Cat',
          parentClass: 'Animal',
          members: [
            { name: 'Speak', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
          ],
        },
        {
          className: 'Fish',
          parentClass: 'Animal',
          members: [
            { name: 'Speak', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
          ],
        },
      ];
    } else if (pillar === 'abstraction') {
      classes = [
        {
          className: 'Vehicle',
          isAbstract: true,
          members: [
            { name: 'Brand', type: 'FIELD', accessModifier: 'PUBLIC', returnType: 'string' },
            { name: 'GetDescription', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
            { name: 'Start', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isAbstract: true },
            { name: 'FuelType', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isAbstract: true },
          ],
        },
        {
          className: 'Car',
          parentClass: 'Vehicle',
          members: [
            { name: 'Start', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
            { name: 'FuelType', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
          ],
        },
        {
          className: 'Bike',
          parentClass: 'Vehicle',
          members: [
            { name: 'Start', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
            { name: 'FuelType', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string', isOverridden: true },
          ],
        },
      ];
    } else if (pillar === 'interface') {
      classes = [
        {
          className: 'IPayment',
          isInterface: true,
          members: [
            { name: 'ProcessPayment', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'bool' },
            { name: 'GetProviderName', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
          ],
        },
        {
          className: 'ILoggable',
          isInterface: true,
          members: [
            { name: 'Log', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'CreditCard',
          interfaces: ['IPayment', 'ILoggable'],
          members: [
            { name: 'ProcessPayment', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'bool' },
            { name: 'GetProviderName', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
            { name: 'Log', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'MoMo',
          interfaces: ['IPayment'],
          members: [
            { name: 'ProcessPayment', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'bool' },
            { name: 'GetProviderName', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'string' },
          ],
        },
        {
          className: 'OrderService',
          members: [
            { name: '_payment', type: 'FIELD', accessModifier: 'PRIVATE', returnType: 'IPayment' },
            { name: 'Checkout', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
      ];
    }

    registeredClasses.value = classes;
  }

  // ==========================================
  // SCENARIO PLAYBACK
  // ==========================================

  function setPillar(pillar: 'encapsulation' | 'inheritance' | 'polymorphism' | 'abstraction' | 'interface'): void {
    activePillar.value = pillar;
    loadScenario(pillar);
  }

  function loadScenario(scenarioId: string): void {
    resetAll();
    selectedScenarioId.value = scenarioId;
    initializeDemoClasses();
    scenarioStepIndex.value = 0;
    isPlayingScenario.value = true;
    applyScenarioStep();
  }

  function applyScenarioStep(): void {
    if (!selectedScenarioId.value) return;
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (!scenario) return;

    const step = scenario.steps[scenarioStepIndex.value];
    if (!step) return;

    activeCodeLines.value = [];
    if (step.codeLineRange) {
      for (let i = step.codeLineRange[0]; i <= step.codeLineRange[1]; i++) {
        activeCodeLines.value.push(i);
      }
    }

    // Clear previous animation state
    clearAnimationTimer();
    lastViolation.value = null;

    // Apply animation
    currentAnimation.value = step.animation;
    currentAnimationTarget.value = step.animationTarget;

    // Handle special animation actions
    if (step.animation === 'create-object' && step.animationTarget.className) {
      // Add object to created objects list (for visual)
      const alreadyExists = createdObjects.value.some(
        (o) => o.className === step.animationTarget.className
      );
      if (!alreadyExists) {
        createdObjects.value.push({
          className: step.animationTarget.className!,
          id: ++objectIdCounter,
        });
      }
    }

    if (step.animation === 'access-denied' && step.animationTarget.className) {
      lastViolation.value = {
        className: step.animationTarget.className,
        memberName: step.animationTarget.memberName ?? '',
        message: `❌ Truy cập bị từ chối! Trường "${step.animationTarget.memberName}" là PRIVATE.`,
      };
    }

    if (step.animation === 'abstract-error' && step.animationTarget.className) {
      lastViolation.value = {
        className: step.animationTarget.className,
        memberName: '',
        message: `❌ Không thể khởi tạo! "${step.animationTarget.className}" là lớp abstract.`,
      };
    }

    if (step.animation === 'compile-error' && step.animationTarget.className) {
      lastViolation.value = {
        className: step.animationTarget.className,
        memberName: step.animationTarget.memberName ?? '',
        message: `❌ Lỗi biên dịch! Trình biên dịch C# từ chối vì vi phạm quyền truy cập hoặc lỗi kiểu dữ liệu ở "${step.animationTarget.memberName}".`,
      };
    }

    if (step.animation === 'warning' && step.animationTarget.className) {
      lastViolation.value = {
        className: step.animationTarget.className,
        memberName: step.animationTarget.memberName ?? '',
        message: `⚠️ Cảnh báo! Hành vi che khuất (new) không phải là đa hình thực sự.`,
      };
    }

    // Auto-clear animation highlight after duration
    animationTimerId.value = setTimeout(() => {
      // Keep the animation visible, just mark it as settled
    }, 2000);
  }

  function nextScenarioStep(): void {
    if (!selectedScenarioId.value) return;
    if (scenarioStepIndex.value >= totalSteps.value - 1) return;
    scenarioStepIndex.value++;
    applyScenarioStep();
  }

  function prevScenarioStep(): void {
    if (!selectedScenarioId.value || scenarioStepIndex.value <= 0) return;

    // Reset created objects when going back
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (scenario) {
      // Rebuild created objects from step 0 to target step
      createdObjects.value = [];
      objectIdCounter = 0;
      const targetIndex = scenarioStepIndex.value - 1;
      for (let i = 0; i <= targetIndex; i++) {
        const s = scenario.steps[i];
        if (s.animation === 'create-object' && s.animationTarget.className) {
          const alreadyExists = createdObjects.value.some(
            (o) => o.className === s.animationTarget.className
          );
          if (!alreadyExists) {
            createdObjects.value.push({
              className: s.animationTarget.className!,
              id: ++objectIdCounter,
            });
          }
        }
      }
    }

    scenarioStepIndex.value--;
    applyScenarioStep();
  }

  function resetScenario(): void {
    if (!selectedScenarioId.value) return;
    pauseAutoplay();
    scenarioStepIndex.value = 0;
    createdObjects.value = [];
    objectIdCounter = 0;
    applyScenarioStep();
  }

  function jumpToStep(idx: number): void {
    if (!selectedScenarioId.value) return;
    if (idx < 0 || idx >= totalSteps.value) return;
    
    // Rebuild object list on backward/forward jump
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (scenario) {
      createdObjects.value = [];
      objectIdCounter = 0;
      for (let i = 0; i <= idx; i++) {
        const s = scenario.steps[i];
        if (s.animation === 'create-object' && s.animationTarget.className) {
          const alreadyExists = createdObjects.value.some(
            (o) => o.className === s.animationTarget.className
          );
          if (!alreadyExists) {
            createdObjects.value.push({
              className: s.animationTarget.className!,
              id: ++objectIdCounter,
            });
          }
        }
      }
    }
    
    scenarioStepIndex.value = idx;
    applyScenarioStep();
  }

  function exitScenario(): void {
    pauseAutoplay();
    isPlayingScenario.value = false;
    selectedScenarioId.value = null;
    scenarioStepIndex.value = 0;
    activeCodeLines.value = [];
    createdObjects.value = [];
    objectIdCounter = 0;
    currentAnimation.value = 'none';
    currentAnimationTarget.value = {};
    lastViolation.value = null;
    resetAll();
    initializeDemoClasses();
  }

  // ==========================================
  // AUTOPLAY
  // ==========================================
  function startAutoplay(): void {
    if (isAutoplayRunning.value) return;
    isAutoplayRunning.value = true;
    const delay = 3500 / playbackSpeed.value;
    autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
  }

  function pauseAutoplay(): void {
    isAutoplayRunning.value = false;
    if (autoplayTimerId.value !== null) {
      clearTimeout(autoplayTimerId.value);
      autoplayTimerId.value = null;
    }
  }

  function runAutoplayStep(): void {
    if (!isAutoplayRunning.value) return;

    if (scenarioStepIndex.value < totalSteps.value - 1) {
      nextScenarioStep();
      const delay = 3500 / playbackSpeed.value;
      autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
    } else {
      pauseAutoplay();
    }
  }

  function changePlaybackSpeed(speed: number): void {
    playbackSpeed.value = speed;
    if (isAutoplayRunning.value) {
      if (autoplayTimerId.value !== null) {
        clearTimeout(autoplayTimerId.value);
      }
      const delay = 3500 / playbackSpeed.value;
      autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
    }
  }

  // ==========================================
  // CLEANUP
  // ==========================================
  function resetAll(): void {
    clearAnimationTimer();
    pauseAutoplay();
    registeredClasses.value = [];
    createdObjects.value = [];
    objectIdCounter = 0;
    currentAnimation.value = 'none';
    currentAnimationTarget.value = {};
    lastViolation.value = null;
    activeCodeLines.value = [];
  }

  function clearAnimationTimer(): void {
    if (animationTimerId.value !== null) {
      clearTimeout(animationTimerId.value);
      animationTimerId.value = null;
    }
  }

  function destroyStore(): void {
    clearAnimationTimer();
    pauseAutoplay();
  }

  return {
    // State
    registeredClasses,
    activePillar,
    selectedScenarioId,
    scenarioStepIndex,
    isPlayingScenario,
    activeCodeLines,
    isAutoplayRunning,
    playbackSpeed,
    currentAnimation,
    currentAnimationTarget,
    createdObjects,
    lastViolation,
    // Computed
    totalSteps,
    currentExplanation,
    currentLessonQuestion,
    currentScenario,
    availableClassNames,
    activeMemoryState,
    // Actions
    initializeDemoClasses,
    setPillar,
    loadScenario,
    nextScenarioStep,
    prevScenarioStep,
    resetScenario,
    jumpToStep,
    exitScenario,
    startAutoplay,
    pauseAutoplay,
    changePlaybackSpeed,
    resetAll,
    destroyStore,
  };
});
