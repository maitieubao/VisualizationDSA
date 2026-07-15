import type { SystemDesignFrame, SystemNode, NetworkLink } from '../types/system-design-viz.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

/** Payload cho endpoint POST /execute */
interface SystemDesignExecuteRequest {
  scenarioId: string;
  replicationLagMs?: number;
}

/** Response của GET /scenarios */
interface ScenariosResponse {
  conceptId: string;
  name: string;
  category: string;
  scenarios: string[];
}

/**
 * Lấy danh sách kịch bản System Design hỗ trợ.
 * GET /api/v1/concepts/system-design/scenarios
 */
export async function fetchScenarios(): Promise<ScenariosResponse> {
  const response = await fetch(`${API_BASE}/api/v1/concepts/system-design/scenarios`, {
    headers: { 'Accept-Encoding': 'gzip, br' },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json() as Promise<ScenariosResponse>;
}

/**
 * Lấy topology khởi tạo từ backend.
 * GET /api/v1/concepts/system-design/topology
 * Trả về nodes và links cho canvas ban đầu.
 */
export async function fetchTopology(): Promise<{ nodes: SystemNode[]; links: NetworkLink[] }> {
  const response = await fetch(`${API_BASE}/api/v1/concepts/system-design/topology`, {
    headers: { 'Accept-Encoding': 'gzip, br' },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  const frame = (await response.json()) as SystemDesignFrame;
  return { nodes: frame.nodes, links: frame.links };
}

/**
 * Thực thi kịch bản và nhận chuỗi frames mô phỏng.
 * POST /api/v1/concepts/system-design/execute
 */
export async function executeScenario(
  scenarioId: string,
  replicationLagMs?: number,
): Promise<SystemDesignFrame[]> {
  const body: SystemDesignExecuteRequest = { scenarioId };
  if (replicationLagMs !== undefined) {
    body.replicationLagMs = replicationLagMs;
  }

  const response = await fetch(`${API_BASE}/api/v1/concepts/system-design/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, br',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = (errorBody as { message?: string })?.message ?? `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<SystemDesignFrame[]>;
}
