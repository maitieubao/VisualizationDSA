// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useGuidedTourStore } from '../store/useGuidedTourStore';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const localStorageMock = new LocalStorageMock();
global.localStorage = localStorageMock as unknown as Storage;

describe('useGuidedTourStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with default inactive state', () => {
    const store = useGuidedTourStore();
    expect(store.isActive).toBe(false);
    expect(store.currentStepIndex).toBe(0);
    expect(store.steps.length).toBeGreaterThan(0);
  });

  it('should start the tour and reset step index to 0', () => {
    const store = useGuidedTourStore();
    store.currentStepIndex = 3;
    store.startTour();
    expect(store.isActive).toBe(true);
    expect(store.currentStepIndex).toBe(0);
  });

  it('should advance to next step', () => {
    const store = useGuidedTourStore();
    store.startTour();
    store.nextStep();
    expect(store.currentStepIndex).toBe(1);
  });

  it('should complete tour when calling nextStep on the last step', () => {
    const store = useGuidedTourStore();
    store.startTour();
    // Go to last step
    store.currentStepIndex = store.steps.length - 1;
    
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    
    store.nextStep();
    expect(store.isActive).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith('guided_tour_seen', 'true');
  });

  it('should go to previous step and prevent going below 0', () => {
    const store = useGuidedTourStore();
    store.startTour();
    store.nextStep(); // index 1
    store.prevStep(); // index 0
    expect(store.currentStepIndex).toBe(0);

    store.prevStep(); // clamp to 0
    expect(store.currentStepIndex).toBe(0);
  });

  it('should skip tour and write to localStorage', () => {
    const store = useGuidedTourStore();
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    
    store.startTour();
    store.skipTour();
    
    expect(store.isActive).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith('guided_tour_seen', 'true');
  });

  it('should automatically init and start tour if guided_tour_seen is not set', () => {
    const store = useGuidedTourStore();
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
    
    store.initTour();
    
    expect(getItemSpy).toHaveBeenCalledWith('guided_tour_seen');
    expect(store.isActive).toBe(true);
  });

  it('should not start tour during init if guided_tour_seen is set to true', () => {
    const store = useGuidedTourStore();
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
    
    store.initTour();
    
    expect(getItemSpy).toHaveBeenCalledWith('guided_tour_seen');
    expect(store.isActive).toBe(false);
  });

  describe('page-specific tours', () => {
    it('should start page tour if not seen yet', () => {
      const store = useGuidedTourStore();
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      
      store.startPageTour('/sorting');
      
      expect(getItemSpy).toHaveBeenCalledWith('page_tour_sorting_seen');
      expect(store.isActive).toBe(true);
      expect(store.activePageKey).toBe('/sorting');
      expect(store.currentSteps.length).toBe(12); // 12 steps defined for /sorting
    });

    it('should not start page tour if already seen and not forced', () => {
      const store = useGuidedTourStore();
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
      
      store.startPageTour('/sorting');
      
      expect(getItemSpy).toHaveBeenCalledWith('page_tour_sorting_seen');
      expect(store.isActive).toBe(false);
    });

    it('should start page tour if already seen but forced', () => {
      const store = useGuidedTourStore();
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
      
      store.startPageTour('/sorting', true);
      
      expect(store.isActive).toBe(true);
      expect(store.activePageKey).toBe('/sorting');
    });

    it('should mark page-specific tour as seen when completed', () => {
      const store = useGuidedTourStore();
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      store.startPageTour('/sorting', true);
      store.completeTour();
      
      expect(store.isActive).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('page_tour_sorting_seen', 'true');
    });

    it('should mark page-specific tour as seen when skipped', () => {
      const store = useGuidedTourStore();
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      store.startPageTour('/sorting', true);
      store.skipTour();
      
      expect(store.isActive).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('page_tour_sorting_seen', 'true');
    });

    it('should correctly load tour steps for newly added academic routes', () => {
      const store = useGuidedTourStore();
      
      const testCases = [
        { path: '/sorting', expectedLength: 12, firstTitle: '1. Bộ chuyển đổi Sandbox / Bài học 🔄' },
        { path: '/code-ide', expectedLength: 12, firstTitle: '1. Monaco Code Editor 💻' },
        { path: '/solid', expectedLength: 12, firstTitle: '1. Trực quan hóa Nguyên lý SOLID 🏗️' },
        { path: '/oop', expectedLength: 12, firstTitle: '1. Trực quan hóa Hướng đối tượng 📐' },
        { path: '/graph', expectedLength: 12, firstTitle: '1. Sân chơi Đồ thị & Cây 🌳' },
        { path: '/di', expectedLength: 12, firstTitle: '1. Dependency Injection & IoC Container 🧪' },
        { path: '/patterns', expectedLength: 12, firstTitle: '1. Bộ sưu tập Design Patterns 🎭' },
        { path: '/state', expectedLength: 12, firstTitle: '1. Giám sát Trạng thái & Đệ quy 🔍' },
        { path: '/system', expectedLength: 12, firstTitle: '1. Thiết kế Hệ thống phân tán 🌐' },
        { path: '/quiz', expectedLength: 12, firstTitle: '1. Trắc nghiệm kiến thức nâng cao 📝' },
        { path: '/compare', expectedLength: 12, firstTitle: '1. So sánh hiệu năng thuật toán 🆚' },
        { path: '/concurrency', expectedLength: 12, firstTitle: '1. Trực quan hóa Đa luồng 🧵' },
      ];

      testCases.forEach(({ path, expectedLength, firstTitle }) => {
        store.startPageTour(path, true);
        expect(store.isActive).toBe(true);
        expect(store.activePageKey).toBe(path);
        expect(store.currentSteps.length).toBe(expectedLength);
        expect(store.currentSteps[0].title).toBe(firstTitle);
      });
    });

    it('should support action scripts and run simulation successfully', async () => {
      const store = useGuidedTourStore();
      
      const dummyBtn = document.createElement('button');
      dummyBtn.id = 'dummy-btn';
      document.body.appendChild(dummyBtn);

      store.startPageTour('/sorting', true);
      // inject an action script step dynamically for testing
      store.currentSteps[0].actionScript = [
        { type: 'click', targetSelector: '#dummy-btn' }
      ];

      const clickSpy = vi.spyOn(dummyBtn, 'click');

      const runPromise = store.runCurrentStepScript();
      expect(store.isExecutingScript).toBe(true);
      expect(store.virtualCursor).not.toBeNull();

      await runPromise;

      expect(store.isExecutingScript).toBe(false);
      expect(clickSpy).toHaveBeenCalled();
      
      document.body.removeChild(dummyBtn);
    });
  });
});

