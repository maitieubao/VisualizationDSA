/**
 * useDesignPatternsStore — Pinia Setup Store
 *
 * Manages Design Patterns visualization state: scenario step player,
 * active pattern, playback speed, nodes, links, and animations.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DESIGN_PATTERN_SCENARIOS, type DPScenario, type DPScenarioStep, type DPAnimationType, type DPAnimationTarget, type DPClassNode, type DPLink } from '../scenarios/designPatternsScenarios';
import { parseEmojiToSvg } from '@/utils/emojiParser';

export const useDesignPatternsStore = defineStore('designPatterns', () => {
  // ==========================================
  // STATE
  // ==========================================
  const activePatternId = ref<string>('strategy-pattern');
  const scenarioStepIndex = ref<number>(0);
  
  // Playback Control
  const isAutoplay = ref<boolean>(false);
  const playbackSpeed = ref<number>(1);
  const autoplayTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // Visualization State
  const nodes = ref<DPClassNode[]>([]);
  const links = ref<DPLink[]>([]);

  // Animation State
  const currentAnimation = ref<DPAnimationType>('none');
  const currentAnimationTarget = ref<DPAnimationTarget>({});
  const animationTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // ==========================================
  // COMPUTED
  // ==========================================
  const currentScenario = computed<DPScenario | null>(() => {
    return DESIGN_PATTERN_SCENARIOS.find((s) => s.id === activePatternId.value) ?? null;
  });

  const totalSteps = computed<number>(() => {
    return currentScenario.value?.steps.length ?? 0;
  });

  const currentExplanation = computed<string>(() => {
    if (!currentScenario.value) return '';
    const step = currentScenario.value.steps[scenarioStepIndex.value];
    return step ? parseEmojiToSvg(step.explanation) : '';
  });

  const currentLessonQuestion = computed<string>(() => {
    return currentScenario.value ? parseEmojiToSvg(currentScenario.value.lessonQuestion) : '';
  });

  const activeScenarioTitle = computed<string>(() => currentScenario.value?.title ?? '');

  // ==========================================
  // ACTIONS
  // ==========================================
  function initializeScenario(patternId: string): void {
    const scenario = DESIGN_PATTERN_SCENARIOS.find((s) => s.id === patternId);
    if (!scenario) return;

    activePatternId.value = patternId;
    
    // Deep clone nodes and links so animations can modify them without mutating the scenario definition
    nodes.value = JSON.parse(JSON.stringify(scenario.nodes));
    links.value = JSON.parse(JSON.stringify(scenario.links));
    
    stopAutoplay();
    scenarioStepIndex.value = 0;
    triggerStepAnimation();
  }

  // --- Playback Controls ---
  function vcrNext(): void {
    if (scenarioStepIndex.value < totalSteps.value - 1) {
      scenarioStepIndex.value++;
      triggerStepAnimation();
    } else {
      stopAutoplay();
    }
  }

  function vcrPrev(): void {
    if (scenarioStepIndex.value > 0) {
      scenarioStepIndex.value--;
      triggerStepAnimation();
    }
  }

  function vcrReset(): void {
    scenarioStepIndex.value = 0;
    stopAutoplay();
    triggerStepAnimation();
  }

  function toggleAutoplay(): void {
    isAutoplay.value = !isAutoplay.value;
    if (isAutoplay.value) {
      if (scenarioStepIndex.value === totalSteps.value - 1) {
        scenarioStepIndex.value = 0;
      }
      triggerStepAnimation(); // trigger immediately
      startAutoplayLoop();
    } else {
      stopAutoplay();
    }
  }

  function setSpeed(speed: number): void {
    playbackSpeed.value = speed;
    if (isAutoplay.value) {
      stopAutoplay();
      startAutoplayLoop();
    }
  }

  function startAutoplayLoop(): void {
    if (autoplayTimerId.value) clearTimeout(autoplayTimerId.value);
    const baseInterval = 3500;
    const interval = baseInterval / playbackSpeed.value;
    
    autoplayTimerId.value = setTimeout(() => {
      if (scenarioStepIndex.value < totalSteps.value - 1) {
        scenarioStepIndex.value++;
        triggerStepAnimation();
        startAutoplayLoop();
      } else {
        stopAutoplay();
      }
    }, interval);
  }

  function stopAutoplay(): void {
    isAutoplay.value = false;
    if (autoplayTimerId.value) {
      clearTimeout(autoplayTimerId.value);
      autoplayTimerId.value = null;
    }
  }

  // --- Animation ---
  function triggerStepAnimation(): void {
    if (animationTimerId.value) {
      clearTimeout(animationTimerId.value);
      animationTimerId.value = null;
    }

    const scenario = currentScenario.value;
    if (!scenario) return;

    const step = scenario.steps[scenarioStepIndex.value];
    if (!step) return;

    currentAnimation.value = step.animation;
    currentAnimationTarget.value = { ...step.animationTarget };

    // Reset animation after a duration based on speed
    const duration = 2500 / playbackSpeed.value;
    animationTimerId.value = setTimeout(() => {
      currentAnimation.value = 'none';
      currentAnimationTarget.value = {};
    }, duration);
  }

  function cleanup(): void {
    stopAutoplay();
    if (animationTimerId.value) clearTimeout(animationTimerId.value);
    nodes.value = [];
    links.value = [];
  }

  return {
    activePatternId,
    scenarioStepIndex,
    isAutoplay,
    playbackSpeed,
    nodes,
    links,
    currentAnimation,
    currentAnimationTarget,
    currentScenario,
    totalSteps,
    currentExplanation,
    currentLessonQuestion,
    activeScenarioTitle,
    initializeScenario,
    vcrNext,
    vcrPrev,
    vcrReset,
    toggleAutoplay,
    setSpeed,
    cleanup
  };
});
