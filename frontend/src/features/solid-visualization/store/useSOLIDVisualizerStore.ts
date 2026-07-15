// ============================================================
// useSOLIDVisualizerStore — Pinia Setup Store
// Orchestrates SOLID principle lessons with step-by-step scenario
// playback, autoplay controls, and interactive animations.
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SOLIDEvaluatorEngine } from '../engine/SOLIDEvaluatorEngine';
import type {
  SOLIDPrinciple,
  SOLIDClassNode,
  LSPSubstitutionPhase,
  DIPState,
} from '../types/solid-visualization.types';
import {
  LSP_LASER_DELAY_MS,
  COOL_DOWN_CONFETTI_EVENT,
  GLASS_BREAK_SOUND_EVENT,
} from '../types/solid-visualization.types';
import { executeSOLIDScenario, type SOLIDFrameResponse } from '../services/solidApi';
import {
  SOLID_SCENARIOS,
  type SOLIDScenario,
  type SOLIDScenarioStep,
  type SOLIDAnimationType,
  type SOLIDAnimationTarget
} from '../scenarios/solidScenarios';
import { parseEmojiToSvg } from '../../../utils/emojiParser';

// ==========================================
// DEMO DATA: UserManager God Class (SRP)
// ==========================================
const DEMO_SRP_GOD_CLASS: SOLIDClassNode = {
  nodeId: 'user-manager-node',
  className: 'UserManager',
  members: [
    { name: 'dbConn', type: 'FIELD', accessedFields: [] },
    { name: 'hasher', type: 'FIELD', accessedFields: [] },
    { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
    { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
    { name: 'findUser', type: 'METHOD', accessedFields: ['dbConn'] },
    { name: 'hashPassword', type: 'METHOD', accessedFields: ['hasher'] },
    { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] },
  ],
  cohesionScore: 0,
  isViolatingSRP: false,
};

const DEMO_SRP_SPLIT_NODES: SOLIDClassNode[] = [
  {
    nodeId: 'user-repo-node',
    className: 'UserRepository',
    members: [
      { name: 'dbConn', type: 'FIELD', accessedFields: [] },
      { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
      { name: 'findUser', type: 'METHOD', accessedFields: ['dbConn'] },
    ],
    cohesionScore: 1,
    isViolatingSRP: false,
  },
  {
    nodeId: 'password-hasher-node',
    className: 'PasswordHasher',
    members: [
      { name: 'hasher', type: 'FIELD', accessedFields: [] },
      { name: 'hashPassword', type: 'METHOD', accessedFields: ['hasher'] },
    ],
    cohesionScore: 1,
    isViolatingSRP: false,
  },
  {
    nodeId: 'email-notifier-node',
    className: 'EmailNotifier',
    members: [
      { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
      { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] },
    ],
    cohesionScore: 1,
    isViolatingSRP: false,
  },
];

export const useSOLIDVisualizerStore = defineStore('solidVisualizer', () => {
  // ==========================================
  // STATE
  // ==========================================
  const activeLesson = ref<SOLIDPrinciple>('SRP');
  const classNodes = ref<SOLIDClassNode[]>([]);
  const isSRPSplit = ref(false);

  const lspPhase = ref<LSPSubstitutionPhase>('IDLE');
  const isLspShattered = ref(false);

  const dipState = ref<DIPState>({
    isViolatingDIP: true,
    hasInterfaceInserted: false,
  });

  const lastDiagnosticResult = ref<string | null>(null);
  const lspTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // Scenario playback states
  const scenarioStepIndex = ref<number>(0);
  const isPlayingScenario = ref<boolean>(true);
  const activeCodeLineRange = ref<[number, number] | null>(null);
  const activeCodeLine = computed(() => activeCodeLineRange.value ? activeCodeLineRange.value[0] : null);
  const activeCodeLines = computed<number[]>(() => {
    if (!activeCodeLineRange.value) return [];
    const [start, end] = activeCodeLineRange.value;
    const lines = [];
    for (let i = start; i <= end; i++) {
      lines.push(i);
    }
    return lines;
  });
  const showGoodCode = ref<boolean>(false);

  // Autoplay states
  const isAutoplayRunning = ref<boolean>(false);
  const playbackSpeed = ref<number>(1);
  const autoplayTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // Animation states
  const currentAnimation = ref<SOLIDAnimationType>('none');
  const currentAnimationTarget = ref<SOLIDAnimationTarget>({});

  // ==========================================
  // VCR STATE (Backend API frames - preserved for backward compatibility)
  // ==========================================
  const vcrFrames = ref<SOLIDFrameResponse[]>([]);
  const vcrCurrentIndex = ref(0);
  const isVcrMode = ref(false);
  const isVcrLoading = ref(false);
  const vcrError = ref<string | null>(null);

  // ==========================================
  // COMPUTED
  // ==========================================
  const hasOverheatedNodes = computed(() =>
    classNodes.value.some((n) => n.isViolatingSRP)
  );

  const overheatedNodeIds = computed(() =>
    classNodes.value.filter((n) => n.isViolatingSRP).map((n) => n.nodeId)
  );

  const totalNodes = computed(() => classNodes.value.length);

  const srpViolationCount = computed(
    () => classNodes.value.filter((n) => n.isViolatingSRP).length
  );

  const isLSPTransmitting = computed(
    () => lspPhase.value === 'TRANSMITTING'
  );

  const isDIPCorrect = computed(
    () => !dipState.value.isViolatingDIP && dipState.value.hasInterfaceInserted
  );

  const activeLessonLabel = computed(() => {
    const labels: Record<SOLIDPrinciple, string> = {
      SRP: 'Single Responsibility',
      OCP: 'Open/Closed',
      LSP: 'Liskov Substitution',
      ISP: 'Interface Segregation',
      DIP: 'Dependency Inversion',
    };
    return labels[activeLesson.value];
  });

  const currentScenario = computed(() => {
    return SOLID_SCENARIOS.find((s) => s.id === activeLesson.value) ?? null;
  });

  const currentExplanation = computed(() => {
    if (!currentScenario.value) return '';
    const step = currentScenario.value.steps[scenarioStepIndex.value];
    return step ? parseEmojiToSvg(step.explanation) : '';
  });

  const totalSteps = computed(() => {
    return currentScenario.value?.steps.length ?? 0;
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  function setLesson(lesson: SOLIDPrinciple): void {
    activeLesson.value = lesson;
    resetState();
    initializeDemoData();
    loadScenario(lesson);
  }

  function initializeDemoData(): void {
    if (activeLesson.value === 'SRP') {
      initializeSRPDemo();
    }
  }

  function initializeSRPDemo(): void {
    const godClass = { ...DEMO_SRP_GOD_CLASS };
    const evaluation = SOLIDEvaluatorEngine.evaluateSRP(godClass);
    godClass.cohesionScore = evaluation.lcom4;
    godClass.isViolatingSRP = evaluation.isViolating;
    classNodes.value = [godClass];
    isSRPSplit.value = false;
  }

  function initializeClassNodes(nodes: SOLIDClassNode[]): void {
    classNodes.value = nodes.map((node) => {
      const res = SOLIDEvaluatorEngine.evaluateSRP(node);
      return {
        ...node,
        cohesionScore: res.lcom4,
        isViolatingSRP: res.isViolating,
      };
    });
  }

  function triggerSRPSplit(nodeId: string): void {
    const targetIndex = classNodes.value.findIndex((n) => n.nodeId === nodeId);
    if (targetIndex === -1) return;

    classNodes.value.splice(
      targetIndex,
      1,
      ...DEMO_SRP_SPLIT_NODES.map((node) => ({
        ...node,
        cohesionScore: 1,
        isViolatingSRP: false,
      }))
    );

    isSRPSplit.value = true;
    lastDiagnosticResult.value =
      'SRP ĐẠT: Tái cấu trúc thành công! Mỗi lớp giờ chỉ gánh 1 nhiệm vụ duy nhất.';

    triggerCoolDownConfetti();
  }

  function executeLSPSubstitution(throwsException: boolean): void {
    isLspShattered.value = false;
    lspPhase.value = 'TRANSMITTING';
    lastDiagnosticResult.value = null;

    const res = SOLIDEvaluatorEngine.evaluateLSP('fly', throwsException);

    if (res.isViolating) {
      if (lspTimerId.value !== null) clearTimeout(lspTimerId.value);
      lspTimerId.value = setTimeout(() => {
        isLspShattered.value = true;
        lspPhase.value = 'SHATTERED';
        lastDiagnosticResult.value = res.errorReason ?? 'Vi phạm LSP.';
        triggerGlassBreakSound();
      }, LSP_LASER_DELAY_MS);
    } else {
      if (lspTimerId.value !== null) clearTimeout(lspTimerId.value);
      lspPhase.value = 'PASSED';
      isLspShattered.value = false;
      lastDiagnosticResult.value =
        'LSP ĐẠT: Thay thế đối tượng con hoạt động hoàn hảo!';
    }
  }

  function insertDIPInterface(): void {
    dipState.value = {
      isViolatingDIP: false,
      hasInterfaceInserted: true,
    };
    lastDiagnosticResult.value =
      'DIP ĐẠT: Luồng phụ thuộc đã đảo chiều hội tụ về phía Interface trừu tượng!';
  }

  function resetDIP(): void {
    dipState.value = {
      isViolatingDIP: true,
      hasInterfaceInserted: false,
    };
    lastDiagnosticResult.value = null;
  }

  function resetState(): void {
    classNodes.value = [];
    isSRPSplit.value = false;
    isLspShattered.value = false;
    lspPhase.value = 'IDLE';
    dipState.value = {
      isViolatingDIP: true,
      hasInterfaceInserted: false,
    };
    lastDiagnosticResult.value = null;

    scenarioStepIndex.value = 0;
    activeCodeLineRange.value = null;
    showGoodCode.value = false;
    currentAnimation.value = 'none';
    currentAnimationTarget.value = {};

    pauseAutoplay();

    if (lspTimerId.value !== null) {
      clearTimeout(lspTimerId.value);
      lspTimerId.value = null;
    }
  }

  function resetAll(): void {
    resetState();
    activeLesson.value = 'SRP';
    initializeDemoData();
    loadScenario('SRP');
  }

  function destroyStore(): void {
    resetState();
  }

  // ==========================================
  // SCENARIO PLAYBACK ACTIONS
  // ==========================================

  function loadScenario(scenarioId: SOLIDPrinciple): void {
    scenarioStepIndex.value = 0;
    isPlayingScenario.value = true;
    applyScenarioStep();
  }

  function applyScenarioStep(): void {
    const scenario = currentScenario.value;
    if (!scenario) return;

    const step = scenario.steps[scenarioStepIndex.value];
    if (!step) return;

    activeCodeLineRange.value = step.codeLineRange;
    currentAnimation.value = step.animation;
    currentAnimationTarget.value = step.animationTarget;

    // Explicitly set showGoodCode based on step.appliesTo
    showGoodCode.value = step.appliesTo === 'good';

    // Trigger state transitions on the store automatically
    if (activeLesson.value === 'SRP') {
      if (step.animation === 'srp-split') {
        triggerSRPSplit('user-manager-node');
      } else {
        initializeSRPDemo();
      }
    } else if (activeLesson.value === 'LSP') {
      if (step.animation === 'lsp-laser-fire') {
        executeLSPSubstitution(true);
      } else if (step.animation === 'lsp-refactor' || scenarioStepIndex.value >= 3) {
        executeLSPSubstitution(false);
      } else {
        lspPhase.value = 'IDLE';
        isLspShattered.value = false;
        lastDiagnosticResult.value = null;
        if (lspTimerId.value !== null) {
          clearTimeout(lspTimerId.value);
          lspTimerId.value = null;
        }
      }
    } else if (activeLesson.value === 'DIP') {
      if (step.animation === 'dip-inversion-inserted' || scenarioStepIndex.value >= 2) {
        insertDIPInterface();
      } else {
        resetDIP();
      }
    }
  }

  function nextScenarioStep(): void {
    if (scenarioStepIndex.value >= totalSteps.value - 1) return;
    scenarioStepIndex.value++;
    applyScenarioStep();
  }

  function prevScenarioStep(): void {
    if (scenarioStepIndex.value <= 0) return;
    scenarioStepIndex.value--;
    applyScenarioStep();
  }

  function resetScenario(): void {
    pauseAutoplay();
    scenarioStepIndex.value = 0;
    applyScenarioStep();
  }

  function toggleGoodCode(val?: boolean): void {
    const nextVal = val !== undefined ? val : !showGoodCode.value;
    showGoodCode.value = nextVal;

    const scenario = currentScenario.value;
    if (!scenario) return;

    if (nextVal) {
      // Find the first step that shows the refactored code (usually the last step)
      scenarioStepIndex.value = scenario.steps.length - 1;
      applyScenarioStep();
    } else {
      // Go back to the initial step
      scenarioStepIndex.value = 0;
      applyScenarioStep();
    }
  }

  // ==========================================
  // AUTOPLAY ACTIONS
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
  // VCR ACTIONS (Preserved for compatibility)
  // ==========================================
  const vcrCurrentFrame = computed(() =>
    vcrFrames.value[vcrCurrentIndex.value] ?? null
  );
  const vcrTotalFrames = computed(() => vcrFrames.value.length);

  async function loadVcrScenario(principle: string): Promise<void> {
    isVcrLoading.value = true;
    vcrError.value = null;
    try {
      const frames = await executeSOLIDScenario(principle.toLowerCase());
      vcrFrames.value = frames;
      vcrCurrentIndex.value = 0;
      isVcrMode.value = true;
    } catch (err: unknown) {
      vcrError.value = err instanceof Error ? err.message : 'API call failed';
      isVcrMode.value = false;
    } finally {
      isVcrLoading.value = false;
    }
  }

  function vcrNext(): void {
    if (vcrCurrentIndex.value < vcrFrames.value.length - 1) {
      vcrCurrentIndex.value++;
    }
  }

  function vcrPrev(): void {
    if (vcrCurrentIndex.value > 0) {
      vcrCurrentIndex.value--;
    }
  }

  function vcrReset(): void {
    vcrCurrentIndex.value = 0;
  }

  function exitVcrMode(): void {
    isVcrMode.value = false;
    vcrFrames.value = [];
    vcrCurrentIndex.value = 0;
    vcrError.value = null;
  }

  function triggerCoolDownConfetti(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COOL_DOWN_CONFETTI_EVENT));
    }
  }

  function triggerGlassBreakSound(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(GLASS_BREAK_SOUND_EVENT));
    }
  }

  return {
    // State
    activeLesson,
    classNodes,
    isSRPSplit,
    lspPhase,
    isLspShattered,
    dipState,
    lastDiagnosticResult,
    scenarioStepIndex,
    isPlayingScenario,
    activeCodeLineRange,
    activeCodeLine,
    activeCodeLines,
    showGoodCode,
    isAutoplayRunning,
    playbackSpeed,
    currentAnimation,
    currentAnimationTarget,
    // VCR State
    vcrFrames,
    vcrCurrentIndex,
    isVcrMode,
    isVcrLoading,
    vcrError,
    // Computed
    hasOverheatedNodes,
    overheatedNodeIds,
    totalNodes,
    srpViolationCount,
    isLSPTransmitting,
    isDIPCorrect,
    activeLessonLabel,
    currentScenario,
    currentExplanation,
    totalSteps,
    vcrCurrentFrame,
    vcrTotalFrames,
    // Actions
    setLesson,
    initializeDemoData,
    initializeSRPDemo,
    initializeClassNodes,
    triggerSRPSplit,
    executeLSPSubstitution,
    insertDIPInterface,
    resetDIP,
    resetState,
    resetAll,
    destroyStore,
    // Scenario Actions
    loadScenario,
    applyScenarioStep,
    nextScenarioStep,
    prevScenarioStep,
    resetScenario,
    toggleGoodCode,
    startAutoplay,
    pauseAutoplay,
    changePlaybackSpeed,
    // VCR Actions
    loadVcrScenario,
    vcrNext,
    vcrPrev,
    vcrReset,
    exitVcrMode,
  };
});
