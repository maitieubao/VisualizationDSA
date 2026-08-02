import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentApi from '../services/paymentApi';

describe('Payment API Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createOrder should send a POST request with Auth headers', async () => {
    const mockOrder = {
      id: 'order-123',
      paymentCode: 'VDSATEST',
      amount: 199000,
      status: 'Pending',
      qrUrl: 'https://img.vietqr.io/image/...'
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      } as Response)
    );

    const result = await paymentApi.createOrder('mock-token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/payments/order'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
    );
    expect(result).toEqual(mockOrder);
  });

  it('getOrderStatus should send a GET request with Auth headers', async () => {
    const mockOrder = {
      id: 'order-123',
      status: 'Completed'
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      } as Response)
    );

    const result = await paymentApi.getOrderStatus('order-123', 'mock-token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/payments/orders/order-123/status'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      })
    );
    expect(result).toEqual(mockOrder);
  });
});
