/**
 * solidApi — Service layer calling backend SOLID Principles API.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface SOLIDFrameResponse {
  stepIndex: number;
  actionType: string;
  principle: string;
  explanation: string;
  isViolation: boolean;
  classNodes: SOLIDClassNodeResponse[];
  metrics: SOLIDMetricsResponse | null;
  violationDetail: string | null;
}

export interface SOLIDClassNodeResponse {
  nodeId: string;
  className: string;
  members: SOLIDMemberResponse[];
  cohesionScore: number;
  isViolating: boolean;
  statusLabel: string | null;
}

export interface SOLIDMemberResponse {
  name: string;
  memberType: string;
  accessedFields: string[];
}

export interface SOLIDMetricsResponse {
  lcom4Score: number;
  responsibilityCount: number;
  couplingLevel: string;
}

export async function fetchSOLIDScenarios(): Promise<{ scenarios: string[] }> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/solid/scenarios`);
  if (!res.ok) throw new Error(`SOLID scenarios fetch failed: ${res.status}`);
  return res.json();
}

export async function executeSOLIDScenario(scenarioId: string): Promise<SOLIDFrameResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/solid/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
  if (!res.ok) throw new Error(`SOLID execute failed: ${res.status}`);
  return res.json();
}
