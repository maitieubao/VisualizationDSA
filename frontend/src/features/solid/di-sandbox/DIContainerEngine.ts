import { registrations, singletonInstances, state } from './diState';
import { detectCycles } from './diCycleDetector';
import { resolve } from './diResolver';
import type {
  ServiceRegistration,
  ServiceInstance,
  CycleDetectionResult,
  ResolutionResult,
  DependencyGraph,
} from './diTypes';

export * from './diTypes';

export class DIContainerEngine {
  public static register(registration: ServiceRegistration): void {
    registrations.set(registration.interfaceName, registration);
  }

  public static getRegistration(interfaceName: string): ServiceRegistration | undefined {
    return registrations.get(interfaceName);
  }

  public static detectCycles(): CycleDetectionResult {
    return detectCycles();
  }

  public static resolve(interfaceName: string): ResolutionResult {
    return resolve(interfaceName);
  }

  public static getDependencyGraph(): DependencyGraph {
    const nodes: string[] = [];
    const edges: Array<{ from: string; to: string }> = [];

    registrations.forEach((reg, name) => {
      nodes.push(name);
      reg.dependencies.forEach((dep) => edges.push({ from: name, to: dep }));
    });

    return { nodes, edges };
  }

  public static getAllRegistrations(): ServiceRegistration[] {
    return Array.from(registrations.values());
  }

  public static getSingletonInstances(): ServiceInstance[] {
    return Array.from(singletonInstances.values());
  }

  public static reset(): void {
    registrations.clear();
    singletonInstances.clear();
    state.transientCounter = 0;
  }

  public static isSingletonCreated(interfaceName: string): boolean {
    const reg = registrations.get(interfaceName);
    if (!reg || reg.lifetime !== 'SINGLETON') return false;
    return singletonInstances.has(interfaceName);
  }
}

export default DIContainerEngine;
