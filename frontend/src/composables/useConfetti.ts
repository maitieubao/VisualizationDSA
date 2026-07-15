/**
 * useConfetti.ts — Full-screen confetti celebration composable.
 * Uses canvas-confetti for epic reward moments.
 */

import confetti from 'canvas-confetti';

const GOLD_COLORS = ['#ffd700', '#ff8c00', '#ffb347', '#ffeaa7', '#fdcb6e'];
const RAINBOW_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function useConfetti() {
  function fireSuccess(): void {
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
        requestAnimationFrame(frame);
      }
    }
    frame();
  }

  function fireQuizPass(): void {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: RAINBOW_COLORS,
    });

    setTimeout(() => {
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
  }

  function firePremium(): void {
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
        requestAnimationFrame(frame);
      }
    }
    frame();

    // Grand finale burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: [...GOLD_COLORS, '#ffffff'],
        scalar: 1.5,
      });
    }, 1500);
  }

  return { fireSuccess, fireQuizPass, firePremium };
}
