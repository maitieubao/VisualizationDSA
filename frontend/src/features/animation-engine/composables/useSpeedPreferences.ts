import { useAnimationStore } from '../store/useAnimationStore';

export const SPEED_PRESETS = [0.25, 0.5, 1.0, 2.0, 4.0] as const;
export const DSA_PREFERENCES_KEY = 'dsa_preferences';

interface DsaPreferences {
  defaultSpeed: number;
}

export function useSpeedPreferences() {
  const animStore = useAnimationStore();

  function loadSpeed(): number {
    try {
      const raw = localStorage.getItem(DSA_PREFERENCES_KEY);
      if (!raw) return 1.0;
      const parsed: DsaPreferences = JSON.parse(raw);
      if (typeof parsed.defaultSpeed !== 'number' || parsed.defaultSpeed <= 0) return 1.0;
      return parsed.defaultSpeed;
    } catch {
      return 1.0;
    }
  }

  function saveSpeed(speed: number): void {
    try {
      let existing: Record<string, unknown> = {};
      const raw = localStorage.getItem(DSA_PREFERENCES_KEY);
      if (raw) {
        try { existing = JSON.parse(raw); } catch { /* ignore */ }
      }
      existing.defaultSpeed = speed;
      localStorage.setItem(DSA_PREFERENCES_KEY, JSON.stringify(existing));
    } catch {
      // localStorage not available
    }
  }

  function initSpeedFromStorage(): void {
    const saved = loadSpeed();
    animStore.setSpeed(saved);
  }

  return { loadSpeed, saveSpeed, initSpeedFromStorage };
}
