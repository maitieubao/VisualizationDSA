import { ref, computed } from 'vue';

export function usePaymentTimer(initialDuration = 900) {
  const timerSeconds = ref(initialDuration);
  let countdownTimer: number | null = null;

  const isExpired = computed(() => timerSeconds.value <= 0);
  const isWarningTime = computed(() => timerSeconds.value < 60);

  const formattedTime = computed(() => {
    const m = Math.floor(timerSeconds.value / 60).toString().padStart(2, '0');
    const s = (timerSeconds.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  function startTimer(duration = initialDuration) {
    stopTimer();
    timerSeconds.value = duration;

    countdownTimer = window.setInterval(() => {
      if (timerSeconds.value > 0) {
        timerSeconds.value--;
      } else {
        stopTimer();
      }
    }, 1000);
  }

  function stopTimer() {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  return {
    timerSeconds,
    isExpired,
    isWarningTime,
    formattedTime,
    startTimer,
    stopTimer,
  };
}
