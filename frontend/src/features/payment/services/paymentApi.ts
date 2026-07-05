/**
 * paymentApi.ts — HTTP client kết nối các API thanh toán.
 * Tương ứng backend: api/v1/payments/order | orders/{orderId}/status | sepay-webhook
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface OrderDto {
  id: string;
  userId: string;
  paymentCode: string;
  amount: number;
  status: string; // Pending, Completed, Cancelled
  createdAt: string;
  completedAt: string | null;
  bankId: string;
  bankAccount: string;
  accountName: string;
  qrUrl: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/** Tạo yêu cầu thanh toán (Hóa đơn mới) */
export async function createOrder(accessToken: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/api/v1/payments/order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse<OrderDto>(res);
}

/** Truy vấn trạng thái của hóa đơn (Polling) */
export async function getOrderStatus(orderId: string, accessToken: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/api/v1/payments/orders/${orderId}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return handleResponse<OrderDto>(res);
}

/** Mô phỏng cuộc gọi webhook của SePay từ phía client (chỉ dùng cho môi trường dev/test) */
export async function simulateWebhook(paymentCode: string, amount: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/payments/sepay-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Apikey vdsa_secret_key_for_webhook_verify'
    },
    body: JSON.stringify({
      id: Math.floor(Math.random() * 10000000),
      gateway: 'MBBank',
      transactionDate: new Date().toISOString(),
      accountNumber: '99999999999',
      code: paymentCode,
      content: `Chuyen khoan premium ${paymentCode}`,
      transferType: 'in',
      transferAmount: amount,
      referenceCode: `FT${Math.floor(Math.random() * 10000000)}`,
      description: `Mô phỏng thanh toán hóa đơn ${paymentCode}`
    })
  });
  return handleResponse<{ success: boolean; message?: string }>(res);
}
