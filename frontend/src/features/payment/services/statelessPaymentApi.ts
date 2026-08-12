




const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

import { useAuthStore } from '../../auth/store/useAuthStore';



export interface StatelessOrderDto {
  id:           string;
  userId:       string;
  paymentCode:  string;
  amount:       number;
  status:       string;
  createdAt:    string;
  completedAt:  string | null;
  bankId:       string;
  bankAccount:  string;
  accountName:  string;
  qrUrl:        string;
}

export interface StatelessPremiumFeature {
  id:              string;
  name:            string;
  description:     string;
  icon:            string;
  requiresPremium: boolean;
}

export interface StatelessPaymentConfig {
  premiumPrice:     number;
  currency:         string;
  bankId:           string;
  bankAccount:      string;
  accountName:      string;
  supportedMethods: string[];
  premiumFeatures:  StatelessPremiumFeature[];
}

export interface StatelessPremiumStatus {
  isPremium:        boolean;
  upgradedAt:       string | null;
  plan:             string;
  unlockedFeatures: string[];
}

export interface StatelessTransactionLog {
  id:        string;
  orderId:   string;
  userId:    string;
  action:    string;
  amount:    number;
  timestamp: string;
  status:    string;
}



async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

/**
 * Lấy access token đang hoạt động — backend xác định người dùng từ token
 * (KHÔNG tin userId client gửi, chống IDOR/cấp premium cho người khác).
 * PM-041: Chỉ lấy token từ authStore (qua interceptor chung) — bỏ fallback
 * localStorage.getItem('token') vì key đó không tồn tại trong hệ thống.
 */
function getAuthToken(): string | null {
  try {
    return useAuthStore().getAccessToken();
  } catch {
    // Pinia chưa active (test edge) — không fallback, token chỉ đến từ store.
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { ...JSON_HEADERS, 'Authorization': `Bearer ${token}` } : JSON_HEADERS;
}

function authGetHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// PM-023: Timeout + AbortController cho mọi fetch — tránh startCheckout treo vô hạn
// khi backend không phản hồi (mất mạng/5xx nuốt request).
const REQUEST_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('Yêu cầu thanh toán hết thời gian chờ, vui lòng thử lại.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const statelessPaymentApi = {
  async getConfig(): Promise<StatelessPaymentConfig> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/config`);
    return handleResponse<StatelessPaymentConfig>(res);
  },

  async checkout(paymentMethod = 'vietqr'): Promise<StatelessOrderDto> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ paymentMethod }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async verify(orderId: string): Promise<StatelessOrderDto> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/verify`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ orderId }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async getOrderStatus(orderId: string): Promise<StatelessOrderDto> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/orders/${orderId}/status`, {
      headers: authGetHeaders(),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async simulateWebhook(orderId: string): Promise<StatelessOrderDto> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/simulate-webhook`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ orderId }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async getPremiumStatus(): Promise<StatelessPremiumStatus> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/premium-status`, {
      headers: authGetHeaders(),
    });
    return handleResponse<StatelessPremiumStatus>(res);
  },

  async checkFeatureAccess(featureId: string): Promise<{ hasAccess: boolean }> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/check-access?featureId=${encodeURIComponent(featureId)}`, {
      headers: authGetHeaders(),
    });
    return handleResponse<{ hasAccess: boolean }>(res);
  },

  async getTransactions(): Promise<StatelessTransactionLog[]> {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/concepts/payment/transactions`, {
      headers: authGetHeaders(),
    });
    return handleResponse<StatelessTransactionLog[]>(res);
  },
};
