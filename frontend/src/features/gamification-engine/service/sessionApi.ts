import { useAuthStore } from '@/features/auth/store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface HeartRecoveryInfoDto {
  heartRecoverySeconds: number;
  nextHeartAt: string | null;
  adsWatchedToday: number;
  adsMaxPerDay: number;
}

export interface EnterNodeResponseDto {
  resumed: boolean;
  sessionId: string;
  currentStep: string;
  hearts: number;
  maxHearts: number;
  quizScore: number | null;
  labScore: number | null;
}

export interface LearningSessionDto {
  sessionId: string;
  nodeId: string;
  currentStep: string;
  quizScore: number | null;
  labScore: number | null;
  leetCodeScore: number | null;
  expiresAt: string;
  remainingSeconds: number;
}

export interface UpdateStepResponseDto {
  success: boolean;
  currentStep: string;
}

export class OutOfHeartsError extends Error {
  recoveryInfo: HeartRecoveryInfoDto;
  constructor(message: string, recoveryInfo: HeartRecoveryInfoDto) {
    super(message);
    this.name = 'OutOfHeartsError';
    this.recoveryInfo = recoveryInfo;
  }
}

async function getHeaders(): Promise<HeadersInit> {
  const authStore = useAuthStore();
  const token = authStore.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const sessionApi = {
    async enterNode(nodeId: string): Promise<EnterNodeResponseDto> {
      const res = await fetch(`${API_BASE}/api/v1/session/${nodeId}/enter`, {
      method: 'POST',
      headers: await getHeaders()
    });

    if (res.status === 402) {
      const data = await res.json();
      throw new OutOfHeartsError(data.error || 'Out of hearts', data.recoveryInfo);
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to enter node');
    }

    return res.json();
  },

  async getCurrentSession(): Promise<LearningSessionDto> {
    const res = await fetch(`${API_BASE}/api/v1/session/current`, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!res.ok) {
      throw new Error('Failed to get current session');
    }

    return res.json();
  },

  async updateSessionStep(sessionId: string, step: string): Promise<UpdateStepResponseDto> {
    const res = await fetch(`${API_BASE}/api/v1/session/${sessionId}/step`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ step })
    });

    if (!res.ok) {
      throw new Error('Failed to update session step');
    }

    return res.json();
  }
};
