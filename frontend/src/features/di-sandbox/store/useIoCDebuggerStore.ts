import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  IoCRegistration,
  ResolutionStep,
  ResolutionTreeNode,
  DIScenarioPayload,
  Lifetime,
} from '../types/ioc.types';
import { IoCContainerSimulator } from '../engine/IoCContainerSimulator';
import { ALL_SCENARIOS, WEB_API_SCENARIO } from '../scenarios/scenarioData';

export type ResolutionStatus =
  | 'IDLE'
  | 'RESOLVING'
  | 'RESOLVED'
  | 'ERROR_CIRCULAR'
  | 'ERROR_NOT_FOUND';

export const useIoCDebuggerStore = defineStore('iocDebugger', () => {
  const registrations = ref<Record<string, IoCRegistration>>({});
  const instancedSingletons = ref<Record<string, string>>({});
  const resolutionSteps = ref<ResolutionStep[]>([]);
  const currentStepIndex = ref(-1);
  const resolutionTree = ref<ResolutionTreeNode | null>(null);

  const status = ref<ResolutionStatus>('IDLE');
  const selectedServiceToResolve = ref('');
  const isCircularErrorDetected = ref(false);
  const isCaptiveDependencyWarning = ref(false);
  const captiveWarningMessage = ref('');
  const errorMessage = ref('');
  const cyclePath = ref<string[]>([]);

  const activeScenarioId = ref('web-api-standard');
  const scenarios = ref<DIScenarioPayload[]>(ALL_SCENARIOS);

  let simulator = new IoCContainerSimulator();
  let playbackTimer: ReturnType<typeof setTimeout> | null = null;

  const totalSteps = computed(() => resolutionSteps.value.length);

  const currentStep = computed<ResolutionStep | null>(() => {
    if (
      currentStepIndex.value < 0 ||
      currentStepIndex.value >= resolutionSteps.value.length
    ) {
      return null;
    }
    return resolutionSteps.value[currentStepIndex.value];
  });

  const isResolving = computed(() => status.value === 'RESOLVING');
  const isResolved = computed(() => status.value === 'RESOLVED');
  const isError = computed(
    () =>
      status.value === 'ERROR_CIRCULAR' ||
      status.value === 'ERROR_NOT_FOUND',
  );

  const registrationList = computed(() =>
    Object.values(registrations.value),
  );

  const singletonCount = computed(
    () => Object.keys(instancedSingletons.value).length,
  );

  const transientCount = computed(() => {
    let count = 0;
    for (let i = 0; i <= currentStepIndex.value; i++) {
      const step = resolutionSteps.value[i];
      if (step && step.type === 'INSTANTIATE') {
        const reg = registrations.value[step.serviceType];
        if (reg && reg.lifetime === 'TRANSIENT') {
          count++;
        }
      }
    }
    return count;
  });

  const activeScenario = computed(() =>
    scenarios.value.find((s) => s.scenarioId === activeScenarioId.value),
  );

  function registerService(
    serviceType: string,
    implementationType: string,
    lifetime: Lifetime,
    dependencies: string[],
  ): void {
    simulator.register(serviceType, implementationType, lifetime, dependencies);
    registrations.value = {
      ...registrations.value,
      [serviceType]: {
        serviceType,
        implementationType,
        lifetime,
        dependencies,
      },
    };
  }

  function removeService(serviceType: string): void {
    const newRegs = { ...registrations.value };
    delete newRegs[serviceType];
    registrations.value = newRegs;

    simulator.reset();
    for (const reg of Object.values(registrations.value)) {
      simulator.register(
        reg.serviceType,
        reg.implementationType,
        reg.lifetime,
        reg.dependencies,
      );
    }
  }

  function loadScenario(scenarioId: string): void {
    const scenario = scenarios.value.find((s) => s.scenarioId === scenarioId);
    if (!scenario) return;

    resetState();
    activeScenarioId.value = scenarioId;

    for (const reg of scenario.registrations) {
      registerService(
        reg.serviceType,
        reg.implementationType,
        reg.lifetime,
        reg.dependencies,
      );
    }

    if (scenario.registrations.length > 0) {
      const lastReg = scenario.registrations[scenario.registrations.length - 1];
      selectedServiceToResolve.value = lastReg.serviceType;
    }
  }

  function startResolution(): void {
    if (Object.keys(registrations.value).length === 0) return;
    if (!selectedServiceToResolve.value) return;

    stopPlayback();
    status.value = 'RESOLVING';
    isCircularErrorDetected.value = false;
    isCaptiveDependencyWarning.value = false;
    captiveWarningMessage.value = '';
    errorMessage.value = '';
    cyclePath.value = [];
    resolutionSteps.value = [];
    currentStepIndex.value = -1;
    resolutionTree.value = null;
    instancedSingletons.value = {};

    simulator.reset();
    for (const reg of Object.values(registrations.value)) {
      simulator.register(
        reg.serviceType,
        reg.implementationType,
        reg.lifetime,
        reg.dependencies,
      );
    }
    simulator.clearSteps();

    const circularCheck = IoCContainerSimulator.detectCircularDependency(
      selectedServiceToResolve.value,
      registrations.value,
    );
    if (circularCheck.hasCycle) {
      status.value = 'ERROR_CIRCULAR';
      isCircularErrorDetected.value = true;
      cyclePath.value = circularCheck.cyclePath;
      errorMessage.value = `LỖI PHỤ THUỘC VÒNG TRÒN: ${circularCheck.cyclePath.join(' → ')}`;
      return;
    }

    const captiveCheck = IoCContainerSimulator.checkCaptiveDependency(
      registrations.value,
    );
    if (captiveCheck.hasCaptive) {
      isCaptiveDependencyWarning.value = true;
      captiveWarningMessage.value = `CAPTIVE_DEPENDENCY: Singleton [${captiveCheck.singletonType}] nắm giữ vĩnh viễn Transient [${captiveCheck.transientType}]`;
    }

    try {
      simulator.resolve(selectedServiceToResolve.value);
      resolutionSteps.value = simulator.getResolutionSteps();
      instancedSingletons.value = {};
      for (const [key, val] of Object.entries(simulator.getSingletonVault())) {
        instancedSingletons.value[key] = val._type;
      }
      resolutionTree.value = simulator.buildResolutionTree(
        selectedServiceToResolve.value,
      );
      playNextStep();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('CircularDependencyException')) {
        status.value = 'ERROR_CIRCULAR';
        isCircularErrorDetected.value = true;
        errorMessage.value = message;
      } else {
        status.value = 'ERROR_NOT_FOUND';
        errorMessage.value = message;
      }
    }
  }

  function playNextStep(): void {
    if (currentStepIndex.value >= resolutionSteps.value.length - 1) {
      status.value = 'RESOLVED';
      return;
    }

    currentStepIndex.value++;
    playbackTimer = setTimeout(() => {
      playNextStep();
    }, 800);
  }

  function stepForward(): void {
    stopPlayback();
    if (currentStepIndex.value < resolutionSteps.value.length - 1) {
      currentStepIndex.value++;
    }
    if (currentStepIndex.value >= resolutionSteps.value.length - 1) {
      status.value = 'RESOLVED';
    }
  }

  function stepBackward(): void {
    stopPlayback();
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
      status.value = 'RESOLVING';
    }
  }

  function jumpToStep(index: number): void {
    stopPlayback();
    if (index >= 0 && index < resolutionSteps.value.length) {
      currentStepIndex.value = index;
      status.value =
        index >= resolutionSteps.value.length - 1 ? 'RESOLVED' : 'RESOLVING';
    }
  }

  function stopPlayback(): void {
    if (playbackTimer !== null) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
  }

  function resetState(): void {
    stopPlayback();
    simulator.reset();
    registrations.value = {};
    instancedSingletons.value = {};
    resolutionSteps.value = [];
    currentStepIndex.value = -1;
    resolutionTree.value = null;
    status.value = 'IDLE';
    selectedServiceToResolve.value = '';
    isCircularErrorDetected.value = false;
    isCaptiveDependencyWarning.value = false;
    captiveWarningMessage.value = '';
    errorMessage.value = '';
    cyclePath.value = [];
  }

  function cleanup(): void {
    stopPlayback();
  }

  return {
    registrations,
    instancedSingletons,
    resolutionSteps,
    currentStepIndex,
    resolutionTree,
    status,
    selectedServiceToResolve,
    isCircularErrorDetected,
    isCaptiveDependencyWarning,
    captiveWarningMessage,
    errorMessage,
    cyclePath,
    activeScenarioId,
    scenarios,
    totalSteps,
    currentStep,
    isResolving,
    isResolved,
    isError,
    registrationList,
    singletonCount,
    transientCount,
    activeScenario,
    registerService,
    removeService,
    loadScenario,
    startResolution,
    stepForward,
    stepBackward,
    jumpToStep,
    stopPlayback,
    resetState,
    cleanup,
  };
});
