import { ref } from 'vue';
import { getOrderStatus } from '../services/paymentApi';

export function usePaymentPolling() {
  const isPolling = ref(false);
  let pollingTimer: number | null = null;

  function startPolling(
    orderId: string,
    token: string,
    onSuccess: () => void,
    onError?: (err: unknown) => void
  ) {
    stopPolling();
    isPolling.value = true;

    pollingTimer = window.setInterval(async () => {
      try {
        const statusRes = await getOrderStatus(orderId, token);
        if (statusRes.status === 'Completed') {
          stopPolling();
          onSuccess();
        }
      } catch (err) {
        if (onError) {
          onError(err);
        }
      }
    }, 3000);
  }

  function stopPolling() {
    isPolling.value = false;
    if (pollingTimer !== null) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}
