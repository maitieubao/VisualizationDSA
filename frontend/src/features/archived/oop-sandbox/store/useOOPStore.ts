import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HeapObjectInstance, MethodDispatchResult, AccessCheckResult } from '../types/oop-sandbox.types';
import { OOPReflectionEngine } from '../engine/OOPReflectionEngine';

export const useOOPStore = defineStore('oopSandbox', () => {
  const heapInstances = ref<HeapObjectInstance[]>([]);
  const selectedMethod = ref<string | null>(null);
  const dispatchResult = ref<MethodDispatchResult | null>(null);
  const accessViolation = ref<AccessCheckResult | null>(null);

  function instantiateObject(): void {
    try {
      const instance = OOPReflectionEngine.instantiateObject('Circle');
      heapInstances.value.push(instance);
    } catch (e) {
      console.error('Failed to instantiate:', e);
    }
  }

  function removeInstance(address: string): void {
    heapInstances.value = heapInstances.value.filter((i) => i.address !== address);
  }

  function selectMethod(className: string, methodName: string): void {
    selectedMethod.value = `${className}.${methodName}`;
    const instance = heapInstances.value.find((i) => i.className === 'Circle');
    if (instance) {
      const result = OOPReflectionEngine.dispatchMethod(instance, methodName);
      if (result) dispatchResult.value = result;
    }
  }

  function tryAccessPrivate(memberName: string): void {
    const result = OOPReflectionEngine.checkAccess('Circle', memberName, 'ExternalClass');
    if (!result.allowed) {
      accessViolation.value = { ...result, memberName };
      setTimeout(() => {
        if (accessViolation.value?.memberName === memberName) {
          accessViolation.value = null;
        }
      }, 3000);
    }
  }

  function clearSandbox(): void {
    heapInstances.value = [];
    selectedMethod.value = null;
    dispatchResult.value = null;
    accessViolation.value = null;
  }

  return {
    heapInstances,
    selectedMethod,
    dispatchResult,
    accessViolation,
    instantiateObject,
    removeInstance,
    selectMethod,
    tryAccessPrivate,
    clearSandbox,
  };
});
