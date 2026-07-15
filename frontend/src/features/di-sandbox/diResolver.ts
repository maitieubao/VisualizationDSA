import { registrations, singletonInstances, state } from './diState';
import { detectCycles } from './diCycleDetector';
import type { ServiceInstance, ResolutionResult, ServiceLifetime } from './diTypes';

function generateInstanceId(lifetime: ServiceLifetime): string {
  if (lifetime === 'SINGLETON') {
    return `singleton-${Date.now().toString(36)}`;
  }
  state.transientCounter++;
  return `transient-${state.transientCounter}-${Date.now().toString(36).slice(-4)}`;
}

function resolveInternal(
  interfaceName: string,
  resolutionPath: string[],
  resolving: Set<string>
): ServiceInstance {
  if (resolving.has(interfaceName)) {
    throw new Error(`Circular dependency detected during resolution: ${interfaceName}`);
  }
  const reg = registrations.get(interfaceName);
  if (!reg) throw new Error(`Service ${interfaceName} not registered`);

  resolutionPath.push(interfaceName);

  if (reg.lifetime === 'SINGLETON') {
    const existing = singletonInstances.get(interfaceName);
    if (existing) return existing;
  }

  resolving.add(interfaceName);
  const resolvedDeps: string[] = [];

  for (const dep of reg.dependencies) {
    const depInstance = resolveInternal(dep, resolutionPath, resolving);
    resolvedDeps.push(depInstance.instanceId);
  }
  resolving.delete(interfaceName);

  const instance: ServiceInstance = {
    interfaceName,
    implementationName: reg.implementationName,
    instanceId: generateInstanceId(reg.lifetime),
    lifetime: reg.lifetime,
    createdAt: Date.now(),
    resolvedDependencies: resolvedDeps,
  };

  if (reg.lifetime === 'SINGLETON') {
    singletonInstances.set(interfaceName, instance);
  }
  return instance;
}

export function resolve(interfaceName: string): ResolutionResult {
  const startTime = performance.now();
  const resolutionPath: string[] = [];

  if (!registrations.has(interfaceName)) {
    return {
      success: false,
      error: `Service ${interfaceName} chưa được đăng ký trong container`,
      resolutionPath,
      resolutionTimeMs: performance.now() - startTime,
    };
  }

  const cycleCheck = detectCycles();
  if (cycleCheck.hasCycle) {
    return {
      success: false,
      error: cycleCheck.message,
      resolutionPath,
      resolutionTimeMs: performance.now() - startTime,
    };
  }

  try {
    const instance = resolveInternal(interfaceName, resolutionPath, new Set());
    return {
      success: true,
      instance,
      resolutionPath,
      resolutionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      resolutionPath,
      resolutionTimeMs: performance.now() - startTime,
    };
  }
}
