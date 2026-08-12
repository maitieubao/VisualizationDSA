import confetti from 'canvas-confetti';

const GOLD_COLORS = ['#ffd700', '#ff8c00', '#ffb347', '#ffeaa7', '#fdcb6e'];
const RAINBOW_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

/** GM-022: tôn trọng prefers-reduced-motion — bỏ qua hoạt ảnh nếu user yêu cầu giảm chuyển động. */
function isReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useConfetti() {
  // CU-016: timer + rAF scope theo TỪNG instance composable — component B unmount
  // không được giết timer/rAF của component A (trước đây pendingTimers là module-level).
  const pendingTimers: ReturnType<typeof setTimeout>[] = [];
  const pendingRafs: number[] = [];

  function schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      const idx = pendingTimers.indexOf(timer);
      if (idx >= 0) pendingTimers.splice(idx, 1);
      callback();
    }, delay);
    pendingTimers.push(timer);
  }

  function trackRaf(rafId: number): void {
    pendingRafs.push(rafId);
  }

  /** CU-016: hủy toàn bộ timer + rAF của instance — dừng confetti ngay khi unmount. */
  function cancel(): void {
    while (pendingTimers.length > 0) {
      const timer = pendingTimers.pop();
      if (timer) clearTimeout(timer);
    }
    while (pendingRafs.length > 0) {
      const rafId = pendingRafs.pop();
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    }
  }

  /** CU-016: trả về cancel handle để caller dừng chuỗi rAF khi unmount. */
  function fireSuccess(): () => void {
    if (isReducedMotion()) return cancel;
    const duration = 2500;
    const end = Date.now() + duration;

    function frame(): void {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: GOLD_COLORS,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: GOLD_COLORS,
      });

      if (Date.now() < end) {
        trackRaf(requestAnimationFrame(frame));
      }
    }
    trackRaf(requestAnimationFrame(frame));
    return cancel;
  }

  /** CU-016: trả về cancel handle để caller dừng timer chờ bắn đợt 2. */
  function fireQuizPass(): () => void {
    if (isReducedMotion()) return cancel;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: RAINBOW_COLORS,
    });

    schedule(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 45,
        origin: { x: 0, y: 0.65 },
        colors: RAINBOW_COLORS,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 45,
        origin: { x: 1, y: 0.65 },
        colors: RAINBOW_COLORS,
      });
    }, 300);
    return cancel;
  }

  /** CU-016: trả về cancel handle để caller dừng rAF + timer khi unmount. */
  function firePremium(): () => void {
    if (isReducedMotion()) return cancel;
    const duration = 3000;
    const end = Date.now() + duration;

    function frame(): void {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.5 },
        colors: GOLD_COLORS,
        shapes: ['circle', 'square'],
        gravity: 0.8,
        scalar: 1.2,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.5 },
        colors: GOLD_COLORS,
        shapes: ['circle', 'square'],
        gravity: 0.8,
        scalar: 1.2,
      });

      if (Date.now() < end) {
        trackRaf(requestAnimationFrame(frame));
      }
    }
    trackRaf(requestAnimationFrame(frame));

    schedule(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: [...GOLD_COLORS, '#ffffff'],
        scalar: 1.5,
      });
    }, 1500);
    return cancel;
  }

  /** Dọn timer/rAF còn treo của instance (gọi trong onUnmounted của component sử dụng). */
  function clearPendingTimers(): void {
    cancel();
  }

  return { fireSuccess, fireQuizPass, firePremium, clearPendingTimers };
}
