




const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface OrderDto {
  id: string;
  userId: string;
  paymentCode: string;
  amount: number;
  status: string; 
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


export async function getOrderStatus(orderId: string, accessToken: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/api/v1/payments/orders/${orderId}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return handleResponse<OrderDto>(res);
}

