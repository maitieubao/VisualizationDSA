import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    getAccessToken: () => 'mock-token-123',
  })),
}));

import { statelessPaymentApi } from '../services/statelessPaymentApi';
import type {
  StatelessOrderDto,
  StatelessPaymentConfig,
  StatelessPremiumStatus,
  StatelessTransactionLog,
} from '../services/statelessPaymentApi';

function mockResponse<T>(body: T, ok = true, status = 200, statusText = 'OK'): Response {
  return {
    ok,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const completedOrder: StatelessOrderDto = {
  id: 'order-1',
  userId: 'user-1',
  paymentCode: 'VDSAABC123',
  amount: 199000,
  status: 'Completed',
  createdAt: '2026-08-11T10:00:00.000Z',
  completedAt: '2026-08-11T10:05:00.000Z',
  bankId: 'MBBank',
  bankAccount: '99999999999',
  accountName: 'DSA VISUALIZER ACADEMY',
  qrUrl: 'data:image/png;base64,qr',
};

const config: StatelessPaymentConfig = {
  premiumPrice: 199000,
  currency: 'VND',
  bankId: 'MBBank',
  bankAccount: '99999999999',
  accountName: 'DSA VISUALIZER ACADEMY',
  supportedMethods: ['vietqr', 'bank_transfer', 'momo'],
  premiumFeatures: [
    { id: 'unlimited-runs', name: 'Biên dịch không giới hạn', description: 'Chạy thuật toán tùy ý', icon: '⚡', requiresPremium: true },
    { id: 'advanced-lessons', name: 'Bài giảng cao cấp', description: 'SOLID, Design Patterns', icon: '📚', requiresPremium: true },
    { id: 'premium-sandbox', name: 'Sandbox đặc biệt', description: 'Sân chơi Premium', icon: '🎮', requiresPremium: true },
    { id: 'leaderboard-badge', name: 'Huy hiệu Premium', description: 'Huy hiệu vàng', icon: '👑', requiresPremium: true },
    { id: 'basic-viz', name: 'Trực quan hóa cơ bản', description: 'Sorting, BFS, DFS', icon: '📊', requiresPremium: false },
    { id: 'quiz-basic', name: 'Quiz cơ bản', description: 'Trắc nghiệm 6 chủ đề', icon: '❓', requiresPremium: false },
  ],
};

const premiumStatus: StatelessPremiumStatus = {
  isPremium: true,
  upgradedAt: '2026-08-11T10:05:00.000Z',
  plan: 'premium',
  unlockedFeatures: ['unlimited-runs', 'advanced-lessons'],
};

const transactions: StatelessTransactionLog[] = [
  { id: 'tx-1', orderId: 'order-1', userId: 'user-1', action: 'CHECKOUT_CREATED', amount: 199000, timestamp: '2026-08-11T10:00:00.000Z', status: 'Pending' },
];

// PM-035: khóa toàn bộ contract 8 endpoint của statelessPaymentApi —
// URL, method, body ({paymentMethod}/{orderId}), Bearer header, parse lỗi.
describe('Stateless Payment API Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getConfig should GET /api/v1/concepts/payment/config without auth headers', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(config))
    );

    const result = await statelessPaymentApi.getConfig();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/config'),
      expect.anything()
    );
    // Public endpoint — KHÔNG gắn Authorization header.
    const init = fetchSpy.mock.calls[0][1] as RequestInit | undefined;
    expect(init).not.toHaveProperty('headers');
    expect(result).toEqual(config);
  });

  it('checkout should POST /checkout with { paymentMethod } and Bearer header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(completedOrder))
    );

    const result = await statelessPaymentApi.checkout('vietqr');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/checkout'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-123',
        },
        body: JSON.stringify({ paymentMethod: 'vietqr' }),
      })
    );
    expect(result).toEqual(completedOrder);
  });

  it('verify should POST /verify with { orderId } and Bearer header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(completedOrder))
    );

    const result = await statelessPaymentApi.verify('order-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/verify'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-123',
        },
        body: JSON.stringify({ orderId: 'order-1' }),
      })
    );
    expect(result.status).toBe('Completed');
  });

  it('getOrderStatus should GET /orders/{orderId}/status with Bearer header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(completedOrder))
    );

    const result = await statelessPaymentApi.getOrderStatus('order-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/orders/order-1/status'),
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer mock-token-123' },
      })
    );
    expect(result.id).toBe('order-1');
  });

  it('simulateWebhook should POST /simulate-webhook with { orderId } and Bearer header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(completedOrder))
    );

    const result = await statelessPaymentApi.simulateWebhook('order-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/simulate-webhook'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-123',
        },
        body: JSON.stringify({ orderId: 'order-1' }),
      })
    );
    expect(result.status).toBe('Completed');
  });

  it('getPremiumStatus should GET /premium-status with Bearer header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(premiumStatus))
    );

    const result = await statelessPaymentApi.getPremiumStatus();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/premium-status'),
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer mock-token-123' },
      })
    );
    expect(result.isPremium).toBe(true);
    expect(result.unlockedFeatures).toContain('advanced-lessons');
  });

  it('checkFeatureAccess should GET /check-access?featureId=... with encodeURIComponent', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse({ hasAccess: true }))
    );

    const result = await statelessPaymentApi.checkFeatureAccess('advanced lessons');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/check-access?featureId=advanced%20lessons'),
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer mock-token-123' },
      })
    );
    expect(result).toEqual({ hasAccess: true });
  });

  it('getTransactions should GET /transactions with Bearer header and return array', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(transactions))
    );

    const result = await statelessPaymentApi.getTransactions();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/concepts/payment/transactions'),
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer mock-token-123' },
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe('order-1');
    expect(result[0].action).toBe('CHECKOUT_CREATED');
  });

  it('should throw body.message on non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse({ message: 'Tài khoản đã là Premium' }, false, 400, 'Bad Request'))
    );

    await expect(statelessPaymentApi.checkout('vietqr')).rejects.toThrow('Tài khoản đã là Premium');
  });

  it('should throw HTTP status fallback when non-ok body has no message', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(mockResponse(null, false, 404, 'Not Found'))
    );

    await expect(statelessPaymentApi.getOrderStatus('order-unknown'))
      .rejects.toThrow('HTTP 404: Not Found');
  });
});
