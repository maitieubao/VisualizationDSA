export type ServiceLifetime = 'TRANSIENT' | 'SINGLETON' | 'SCOPED';

export interface ServiceRegistration {
  interfaceName: string;
  implementationName: string;
  lifetime: ServiceLifetime;
  dependencies: string[];
}

export interface ServiceInstance {
  interfaceName: string;
  implementationName: string;
  instanceId: string;
  lifetime: ServiceLifetime;
  createdAt: number;
  resolvedDependencies: string[];
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycle: string[] | null;
  message: string;
}

export interface ResolutionResult {
  success: boolean;
  instance?: ServiceInstance;
  error?: string;
  resolutionPath: string[];
  resolutionTimeMs: number;
}
