import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CallStackEngine } from '../engine/CallStackEngine';
import { DSLEngine } from '../engine/DSLEngine';
import { runSampleScenario } from '../scenarios/scenarios';
import type { StackFrame3D, HeapNode3D, DSLCompileResult, DSLAnimationFrame } from '../types/state-sandbox.types';

export const useStateSandboxStore = defineStore('stateSandbox', () => {
  const activeTab = ref('visualization');

  // Visualization State
  const stackFrames = ref<StackFrame3D[]>([]);
  const heapNodes = ref<HeapNode3D[]>([]);
  const pointerPaths = ref<Array<{ path: string; id: string; isActive: boolean }>>([]);

  // DSL State
  const dslScript = ref(`# Simple function call example
CALL main
CALL calculate a 10 b 20
ALLOC result 16 Result
PUSH frame-2 sum 30
LINK frame-2.ptr -> result
RETURN result
POP frame-2
POP frame-1`);
  const dslResult = ref<DSLCompileResult | null>(null);
  const currentStep = ref(0);
  const currentFrame = ref<DSLAnimationFrame | null>(null);

  function runScenario(sc: string): void {
    const map: Record<string, string> = { 'Simple Call': 'function-call', 'Linked List': 'linked-list', 'Complex': 'complex' };
    runSampleScenario(map[sc] || 'function-call');
    updateVis();
  }

  function resetVisualization(): void {
    CallStackEngine.reset();
    updateVis();
  }

  function updateVis(): void {
    const state = CallStackEngine.getCurrentState();
    stackFrames.value = state.stackFrames;
    heapNodes.value = state.heapNodes;
    pointerPaths.value = CallStackEngine.getAllPointerPaths();
  }

  function loadScript(script: string): void { dslScript.value = script; }

  function compileDSL(): void {
    dslResult.value = DSLEngine.compile(dslScript.value);
    currentStep.value = 0;
    if (dslResult.value.success && dslResult.value.frames) {
      currentFrame.value = dslResult.value.frames[0];
    }
  }

  function stepDSL(): void {
    if (!dslResult.value?.success || !dslResult.value.frames) return;
    if (currentStep.value < dslResult.value.frames.length - 1) {
      currentStep.value++;
      currentFrame.value = dslResult.value.frames[currentStep.value];
    }
  }

  function resetDSL(): void { currentStep.value = 0; currentFrame.value = null; }

  return {
    activeTab, stackFrames, heapNodes, pointerPaths, dslScript, dslResult, currentStep, currentFrame,
    runScenario, resetVisualization, updateVis, loadScript, compileDSL, stepDSL, resetDSL
  };
});
