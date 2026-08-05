// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useGuidedTourStore } from '../store/useGuidedTourStore';
import GuidedTourOverlay from '../components/GuidedTourOverlay.vue';
import HelpButton from '../components/HelpButton.vue';

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

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/sorting',
  })),
}));

vi.mock('../../../utils/emojiParser', () => ({
  parseEmojiToSvg: vi.fn((text: string) => text),
}));

describe('useGuidedTourStore - P0/P1 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('US-GT-001 (P0): Bấm HelpButton bắt đầu tour', () => {
    it('should activate tour when HelpButton is clicked', async () => {
      const store = useGuidedTourStore();
      expect(store.isActive).toBe(false);

      const wrapper = mount(HelpButton, {
        props: { tourKey: '/sorting' },
      });

      await wrapper.find('button').trigger('click');

      expect(store.isActive).toBe(true);
    });

    it('should start page tour with correct route key', async () => {
      const store = useGuidedTourStore();

      const wrapper = mount(HelpButton, {
        props: { tourKey: '/sorting' },
      });

      await wrapper.find('button').trigger('click');

      expect(store.activePageKey).toBe('/sorting');
      expect(store.currentSteps.length).toBeGreaterThan(0);
    });
  });

  describe('US-GT-002 (P0): Xem overlay tour', () => {
    it('should display GuidedTourOverlay when isActive is true', () => {
      const store = useGuidedTourStore();
      store.startTour();

      const wrapper = mount(GuidedTourOverlay);

      expect(wrapper.find('.guided-tour-overlay-root').exists()).toBe(true);
    });

    it('should not display GuidedTourOverlay when isActive is false', () => {
      const store = useGuidedTourStore();
      expect(store.isActive).toBe(false);

      const wrapper = mount(GuidedTourOverlay);

      expect(wrapper.find('.guided-tour-overlay-root').exists()).toBe(false);
    });
  });

  describe('US-GT-006 (P0): Chuyển bước tour', () => {
    it('should increment currentStepIndex on nextStep', () => {
      const store = useGuidedTourStore();
      store.startTour();
      expect(store.currentStepIndex).toBe(0);

      store.nextStep();

      expect(store.currentStepIndex).toBe(1);
    });

    it('should decrement currentStepIndex on prevStep', () => {
      const store = useGuidedTourStore();
      store.startTour();
      store.nextStep();
      expect(store.currentStepIndex).toBe(1);

      store.prevStep();

      expect(store.currentStepIndex).toBe(0);
    });

    it('should not decrement below 0 on prevStep', () => {
      const store = useGuidedTourStore();
      store.startTour();
      expect(store.currentStepIndex).toBe(0);

      store.prevStep();

      expect(store.currentStepIndex).toBe(0);
    });

    it('should complete tour when nextStep on last step', () => {
      const store = useGuidedTourStore();
      store.startTour();
      store.currentStepIndex = store.currentSteps.length - 1;

      store.nextStep();

      expect(store.isActive).toBe(false);
    });
  });

  describe('US-GT-009 (P1): Bỏ qua tour', () => {
    it('should set isActive to false when skipTour is called', () => {
      const store = useGuidedTourStore();
      store.startTour();
      expect(store.isActive).toBe(true);

      store.skipTour();

      expect(store.isActive).toBe(false);
    });

    it('should mark tour as seen in localStorage when skipped', () => {
      const store = useGuidedTourStore();
      store.startTour();

      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      store.skipTour();

      expect(setItemSpy).toHaveBeenCalledWith('guided_tour_seen', 'true');
    });
  });

  describe('US-GT-010 (P1): Tour cho từng trang', () => {
    it('should have tour steps for /sorting route', () => {
      const store = useGuidedTourStore();
      store.startPageTour('/sorting', true);

      expect(store.activePageKey).toBe('/sorting');
      expect(store.currentSteps.length).toBeGreaterThan(0);
    });

    it('should load correct number of steps for /sorting', () => {
      const store = useGuidedTourStore();
      store.startPageTour('/sorting', true);

      expect(store.currentSteps.length).toBe(12);
    });

    it('should have correct first step title for /sorting', () => {
      const store = useGuidedTourStore();
      store.startPageTour('/sorting', true);

      expect(store.currentSteps[0].title).toBe('1. Bộ chuyển đổi Sandbox / Bài học');
    });

    it('should mark page tour as seen when completed', () => {
      const store = useGuidedTourStore();
      store.startPageTour('/sorting', true);

      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      store.completeTour();

      expect(store.isActive).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('page_tour_sorting_seen', 'true');
    });
  });
});
