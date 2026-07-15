/**
 * designPatternsApi — Service layer calling backend Design Patterns API.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface DesignPatternFrameResponse {
  stepIndex: number;
  actionType: string;
  patternName: string;
  explanation: string;
  nodes: UMLNodeResponse[];
  links: UMLLinkResponse[];
  activeNodeId: string | null;
  activeLinkId: string | null;
  couplingIndex: number;
}

export interface UMLNodeResponse {
  id: string;
  name: string;
  nodeType: string;
  attributes: string[];
  methods: string[];
  x: number;
  y: number;
  statusLabel: string | null;
}

export interface UMLLinkResponse {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: string;
  isActive: boolean;
}

export async function fetchDesignPatternScenarios(): Promise<{ scenarios: string[] }> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/design-patterns/scenarios`);
  if (!res.ok) throw new Error(`Design Patterns scenarios fetch failed: ${res.status}`);
  return res.json();
}

export async function executeDesignPatternScenario(scenarioId: string): Promise<DesignPatternFrameResponse[]> {
  const res = await fetch(`${API_BASE}/api/v1/concepts/design-patterns/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
  if (!res.ok) throw new Error(`Design Patterns execute failed: ${res.status}`);
  return res.json();
}
