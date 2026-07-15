/**
 * statelessPaymentApi.ts — HTTP client cho Stateless Payment endpoints.
 * Giao tiếp với: /api/v1/concepts/payment/* (in-memory, không cần PostgreSQL / SePay)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Helper ────────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

// ── API ───────────────────────────────────────────────────────────────────────

export const statelessPaymentApi = {
  async getConfig(): Promise<StatelessPaymentConfig> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/config`);
    return handleResponse<StatelessPaymentConfig>(res);
  },

  async checkout(userId?: string, paymentMethod = 'vietqr'): Promise<StatelessOrderDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/checkout`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ userId, paymentMethod }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async verify(orderId: string, userId?: string): Promise<StatelessOrderDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/verify`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ orderId, userId }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async getOrderStatus(orderId: string, userId?: string): Promise<StatelessOrderDto> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/orders/${orderId}/status${params}`);
    return handleResponse<StatelessOrderDto>(res);
  },

  async simulateWebhook(orderId: string): Promise<StatelessOrderDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/simulate-webhook`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ orderId }),
    });
    return handleResponse<StatelessOrderDto>(res);
  },

  async getPremiumStatus(userId?: string): Promise<StatelessPremiumStatus> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/premium-status${params}`);
    return handleResponse<StatelessPremiumStatus>(res);
  },

  async checkFeatureAccess(featureId: string, userId?: string): Promise<{ hasAccess: boolean }> {
    const userParam = userId ? `&userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/check-access?featureId=${encodeURIComponent(featureId)}${userParam}`);
    return handleResponse<{ hasAccess: boolean }>(res);
  },

  async getTransactions(userId?: string): Promise<StatelessTransactionLog[]> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/payment/transactions${params}`);
    return handleResponse<StatelessTransactionLog[]>(res);
  },
};
