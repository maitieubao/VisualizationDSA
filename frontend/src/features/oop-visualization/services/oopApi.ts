import type { OOPFrame } from '../types/oop-visualization.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

/** Response của GET /scenarios */
interface OOPScenariosResponse {
  conceptId: string;
  name: string;
  category: string;
  scenarios: string[];
}

/**
 * Lấy danh sách kịch bản OOP hỗ trợ.
 * GET /api/v1/concepts/oop/scenarios
 */
export async function fetchOOPScenarios(): Promise<OOPScenariosResponse> {
  const response = await fetch(`${API_BASE}/api/v1/concepts/oop/scenarios`, {
    headers: { 'Accept-Encoding': 'gzip, br' },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json() as Promise<OOPScenariosResponse>;
}

/**
 * Thực thi kịch bản OOP và nhận chuỗi frames mô phỏng.
 * POST /api/v1/concepts/oop/execute
 */
export async function executeOOPScenario(scenarioId: string): Promise<OOPFrame[]> {
  const response = await fetch(`${API_BASE}/api/v1/concepts/oop/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, br',
    },
    body: JSON.stringify({ scenarioId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = (errorBody as { message?: string })?.message ?? `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<OOPFrame[]>;
}
