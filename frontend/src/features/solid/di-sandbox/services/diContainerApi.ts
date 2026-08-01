/**
 * diContainerApi — Service layer calling backend DI Container API.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface DIContainerFrameResponse {
  stepIndex: number;
  actionType: string;
  explanation: string;
  registrations: DIServiceRegistrationResponse[];
  instances: DIServiceInstanceResponse[];
  dependencyGraph: DIGraphResponse | null;
  resolvedServiceName: string | null;
  resolvedLifetime: string | null;
  hasCycle: boolean;
}

export interface DIServiceRegistrationResponse {
  interfaceName: string;
  implementationName: string;
  lifetime: string;
  dependencies: string[];
  isRegistered: boolean;
}

export interface DIServiceInstanceResponse {
  serviceName: string;
  instanceId: string;
  lifetime: string;
  resolveCount: number;
  isNew: boolean;
}

export interface DIGraphResponse {
  nodes: string[];
  edges: DIGraphEdgeResponse[];
}

export interface DIGraphEdgeResponse {
  from: string;
  to: string;
}

export async function fetchDIContainerScenarios(): Promise<{ scenarios: string[] }> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/di-container/scenarios`);
  if (!res.ok) throw new Error(`DI Container scenarios fetch failed: ${res.status}`);
  return res.json();
}

export async function executeDIContainerScenario(scenarioId: string): Promise<DIContainerFrameResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/di-container/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
  if (!res.ok) throw new Error(`DI Container execute failed: ${res.status}`);
  return res.json();
}
