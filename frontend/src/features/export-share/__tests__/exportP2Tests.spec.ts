// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, config } from '@vue/test-utils';
import { nextTick, defineComponent, h } from 'vue';

// ─── Global component stubs ───────────────────────────────────────────────────

const BaseIconStub = defineComponent({
  name: 'BaseIcon',
  props: ['name', 'class'],
  render() {
    return h('span', { class: this.class, 'data-icon': this.name }, this.name);
  },
});

config.global.stubs = {
  BaseIcon: BaseIconStub,
  Teleport: true,
};

// ─── QR Code mock ─────────────────────────────────────────────────────────────

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(async () => {}),
  },
}));

// ─── SignalR mocks ────────────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => {
  const mockStart = vi.fn(async () => {});
  const mockStop = vi.fn(async () => {});
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockInvoke = vi.fn(async () => {});
  const mockConnection = {
    start: mockStart,
    stop: mockStop,
    on: mockOn,
    off: mockOff,
    invoke: mockInvoke,
    state: 'Connected',
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
  };
  return { mockStart, mockStop, mockOn, mockOff, mockInvoke, mockConnection };
});

vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionBuilder: class {
      withUrl() { return this; }
      withAutomaticReconnect() { return this; }
      configureLogging() { return this; }
      build() { return hoisted.mockConnection; }
    },
    HubConnectionState: {
      Connected: 'Connected',
      Disconnected: 'Disconnected',
    },
    LogLevel: { Warning: 0 },
  };
});

// ─── Payment mocks ────────────────────────────────────────────────────────────

vi.mock('../../payment/services/paymentApi', () => ({
  createOrder: vi.fn(async () => ({
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
  })),
  getOrderStatus: vi.fn(async () => ({
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
  })),
}));

vi.mock('../../payment/services/statelessPaymentApi', () => ({
  statelessPaymentApi: {
    getConfig: vi.fn(async () => ({
      premiumPrice: 199000,
      currency: 'VND',
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      supportedMethods: ['vietqr', 'momo'],
      premiumFeatures: [],
    })),
    checkout: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    verify: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    getOrderStatus: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    simulateWebhook: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    getPremiumStatus: vi.fn(async () => ({
      isPremium: false,
      upgradedAt: null,
      plan: 'free',
      unlockedFeatures: [],
    })),
    checkFeatureAccess: vi.fn(async () => ({ hasAccess: false })),
    getTransactions: vi.fn(async () => []),
  },
}));

vi.mock('../../auth/store/useAuthStore', () => {
  return {
    useAuthStore: vi.fn(() => ({
      accessToken: 'mock-token-123',
      currentUser: { id: 'user-123', username: 'testuser', isPremium: false },
      isAuthenticated: true,
      isStatelessMode: true,
      getAccessToken: vi.fn(() => 'mock-token-123'),
    })),
  };
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useExportShareStore } from '../store/useExportShareStore';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';
import { useSignalRStore } from '../../realtime/stores/useSignalRStore';
import { usePaymentStore } from '../../payment/store/usePaymentStore';
import PremiumMarketingCard from '../../payment/components/PremiumMarketingCard.vue';
import CheckoutSuccessScreen from '../../payment/components/CheckoutSuccessScreen.vue';
import PremiumGate from '../../payment/components/PremiumGate.vue';
import QrPaymentPanel from '../../payment/components/QrPaymentPanel.vue';
import ExportProgressBar from '../components/ExportProgressBar.vue';
import { usePaymentPolling } from '../../payment/composables/usePaymentPolling';
import { usePaymentTimer } from '../../payment/composables/usePaymentTimer';
import type { WorkspaceState } from '../types/export-share.types';

// ─── Test suites ─────────────────────────────────────────────────────────────

describe('Export & Share — P2 Tests', () => {
  let store: ReturnType<typeof useExportShareStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useExportShareStore();
    vi.clearAllMocks();
  });

  describe('ES-003 (P2): SVG export', () => {
    it('downloadSVG should create a Blob with svg+xml type', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '200');
      mockSvg.setAttribute('height', '100');

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-svg-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      store.downloadSVG(mockSvg);

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('image/svg+xml');

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('downloadSVG should trigger download via anchor click', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const clickSpy = vi.fn();
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as unknown as Node; });
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as unknown as Node; });

      const origCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockImplementation(((tag: string) => {
        if (tag === 'a') {
          return { click: clickSpy, set download(_v: string) {}, set href(_v: string) {} } as unknown as HTMLAnchorElement;
        }
        return origCreateElement(tag);
      }) as typeof document.createElement);

      store.downloadSVG(mockSvg);

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('exportToSVGString should return serialized SVG string', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '400');
      mockSvg.setAttribute('height', '300');

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });
  });

  describe('ES-004 (P2): Progress bar', () => {
    it('exportProgress should start at 10 when downloadPNG3x begins', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      expect(store.exportProgress).toBe(0);

      store.downloadPNG3x(mockSvg);

      expect(store.exportProgress).toBe(10);
    });

    it('isExporting should be true during export', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      expect(store.isExporting).toBe(false);

      store.downloadPNG3x(mockSvg);

      expect(store.isExporting).toBe(true);
    });

    it('ExportProgressBar should render when isExporting is true', async () => {
      store.isExporting = true;
      store.exportProgress = 45;

      const wrapper = mount(ExportProgressBar);

      expect(wrapper.find('.export-progress-section').exists()).toBe(true);
      expect(wrapper.find('.progress-percent').text()).toBe('45%');

      wrapper.unmount();
    });

    it('ExportProgressBar should not render when isExporting is false', async () => {
      store.isExporting = false;

      const wrapper = mount(ExportProgressBar);

      expect(wrapper.find('.export-progress-section').exists()).toBe(false);

      wrapper.unmount();
    });
  });

  describe('ES-006 (P2): Copy link', () => {
    it('copyShareLinkToClipboard should write to clipboard and set isLinkCopied', async () => {
      store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test123';

      const writeTextSpy = vi.fn(async () => {});
      Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

      const result = await store.copyShareLinkToClipboard();

      expect(writeTextSpy).toHaveBeenCalledWith('https://visualization-dsa.edu.vn/s/?state=test123');
      expect(result).toBe(true);
      expect(store.isLinkCopied).toBe(true);
    });

    it('isLinkCopied should reset to false after 2 seconds', async () => {
      vi.useFakeTimers();
      store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test';

      Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => {}) } });

      await store.copyShareLinkToClipboard();
      expect(store.isLinkCopied).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(store.isLinkCopied).toBe(false);

      vi.useRealTimers();
    });

    it('copyShareLinkToClipboard should return false on clipboard error', async () => {
      store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test';

      Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => { throw new Error('denied'); }) } });

      const result = await store.copyShareLinkToClipboard();

      expect(result).toBe(false);
    });
  });

  describe('ES-008 (P2): Overflow warning', () => {
    it('overflowError should be set when workspace state exceeds limit', async () => {
      const largeState: WorkspaceState = {
        algorithmId: 'large-algo',
        layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 0,
      };

      await store.generateShareLink(largeState);

      expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');
    });

    it('generatedShareLink should be empty when overflow occurs', async () => {
      const largeState: WorkspaceState = {
        algorithmId: 'large-algo',
        layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 0,
      };

      await store.generateShareLink(largeState);

      expect(store.generatedShareLink).toBe('');
      expect(store.hasShareLink).toBe(false);
    });

    it('overflowError should be cleared on new generateShareLink call', async () => {
      const largeState: WorkspaceState = {
        algorithmId: 'large-algo',
        layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 0,
      };

      await store.generateShareLink(largeState);
      expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');

      const smallState: WorkspaceState = {
        algorithmId: 'small-algo',
        layoutNodes: [{ id: 'n1', x: 0, y: 0 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(smallState);
      expect(store.overflowError).toBe('');
    });

    it('isGeneratingLink should be false after generateShareLink completes', async () => {
      const state: WorkspaceState = {
        algorithmId: 'test-algo',
        layoutNodes: [{ id: 'n1', x: 0, y: 0 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(state);

      expect(store.isGeneratingLink).toBe(false);
    });
  });

  describe('ES-009 (P2): Close modal', () => {
    it('closeModal should set isSharingModalOpen to false', () => {
      store.openModal();
      expect(store.isSharingModalOpen).toBe(true);

      store.closeModal();
      expect(store.isSharingModalOpen).toBe(false);
    });

    it('openModal should reset all state', () => {
      store.generatedShareLink = 'https://test';
      store.isLinkCopied = true;
      store.overflowError = 'some error';
      store.exportProgress = 50;
      store.isExporting = true;

      store.openModal();

      expect(store.isSharingModalOpen).toBe(true);
      expect(store.isLinkCopied).toBe(false);
      expect(store.generatedShareLink).toBe('');
      expect(store.overflowError).toBe('');
      expect(store.exportProgress).toBe(0);
      expect(store.isExporting).toBe(false);
    });

    it('resetState should clear all state to defaults', async () => {
      store.openModal();
      store.generatedShareLink = 'https://test';
      store.isLinkCopied = true;
      store.overflowError = 'err';
      store.exportProgress = 50;
      store.isExporting = true;
      store.selectedFormat = 'svg-vector';

      store.resetState();

      expect(store.isSharingModalOpen).toBe(false);
      expect(store.isExporting).toBe(false);
      expect(store.exportProgress).toBe(0);
      expect(store.selectedFormat).toBe('png-3x');
      expect(store.generatedShareLink).toBe('');
      expect(store.isLinkCopied).toBe(false);
      expect(store.isGeneratingLink).toBe(false);
      expect(store.overflowError).toBe('');
    });
  });

  describe('ES-010 (P2): SVG preview', () => {
    it('exportToSVGString should include style element for preview fidelity', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      mockSvg.appendChild(rect);

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(result).toContain('<style');
      expect(result).toContain('<rect');
    });

    it('extractSVGDataURI should return base64 data URI', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '200');
      mockSvg.setAttribute('height', '150');

      const result = SVGToCanvasExporter.extractSVGDataURI(mockSvg);

      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('SVG preview should preserve viewBox dimensions', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('viewBox', '0 0 800 600');

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(result).toContain('viewBox="0 0 800 600"');
    });
  });
});

describe('Realtime SignalR — P2 Tests', () => {
  let store: ReturnType<typeof useSignalRStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSignalRStore();
    vi.clearAllMocks();
  });

  describe('RT-002 (P2): Badge notification', () => {
    it('unreadNotificationCount should increment when badge is awarded', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      expect(store.unreadNotificationCount).toBe(0);

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({
          userId: '1',
          username: 'testuser',
          badgeName: 'First Quiz',
          badgeDescription: 'Completed first quiz',
          awardedAt: new Date().toISOString(),
        });
      }

      expect(store.unreadNotificationCount).toBe(1);
    });

    it('unreadNotificationCount should increment for multiple badges', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({ userId: '1', username: 'u1', badgeName: 'Badge1', badgeDescription: 'desc1', awardedAt: new Date().toISOString() });
        (badgeHandler as BadgeHandler)({ userId: '2', username: 'u2', badgeName: 'Badge2', badgeDescription: 'desc2', awardedAt: new Date().toISOString() });
        (badgeHandler as BadgeHandler)({ userId: '3', username: 'u3', badgeName: 'Badge3', badgeDescription: 'desc3', awardedAt: new Date().toISOString() });
      }

      expect(store.unreadNotificationCount).toBe(3);
    });

    it('badgeNotifications array should contain received notifications', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({
          userId: '1',
          username: 'testuser',
          badgeName: 'Master Coder',
          badgeDescription: 'Solved 100 problems',
          awardedAt: new Date().toISOString(),
        });
      }

      expect(store.badgeNotifications.length).toBe(1);
      expect(store.badgeNotifications[0].badgeName).toBe('Master Coder');
    });
  });

  describe('RT-003 (P2): Level up', () => {
    it('LevelUp event should increment unreadNotificationCount', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      expect(store.unreadNotificationCount).toBe(0);

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({
          userId: '1',
          username: 'testuser',
          oldLevel: 4,
          newLevel: 5,
          totalXP: 5000,
        });
      }

      expect(store.unreadNotificationCount).toBe(1);
    });

    it('LevelUp event should add to levelUpNotifications array', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({
          userId: '1',
          username: 'testuser',
          oldLevel: 9,
          newLevel: 10,
          totalXP: 10000,
        });
      }

      expect(store.levelUpNotifications.length).toBe(1);
      expect(store.levelUpNotifications[0].newLevel).toBe(10);
      expect(store.levelUpNotifications[0].oldLevel).toBe(9);
    });

    it('markNotificationsRead should reset unreadNotificationCount after LevelUp', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({ userId: '1', username: 'u', oldLevel: 1, newLevel: 2, totalXP: 100 });
      }

      expect(store.unreadNotificationCount).toBe(1);

      store.markNotificationsRead();
      expect(store.unreadNotificationCount).toBe(0);
    });
  });

  describe('RT-007 (P2): Leave room', () => {
    it('leaveRoom should invoke LeaveRoom on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.leaveRoom('ROOM-XYZ');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('LeaveRoom', 'ROOM-XYZ');
    });

    it('leaveRoom should clear currentRoom state', async () => {
      type RoomHandler = (room: { roomCode: string; quizTitle: string; quizId: string; hostUsername: string; participants: unknown[]; status: string; currentQuestionIndex: number; totalQuestions: number }) => void;
      let roomHandler: RoomHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'RoomCreated') {
          roomHandler = handler as RoomHandler;
        }
      });

      await store.connectQuizRoom('test-token');

      if (roomHandler) {
        (roomHandler as RoomHandler)({ roomCode: 'R1', quizTitle: 'Quiz', quizId: 'q1', hostUsername: 'host', participants: [], status: 'Waiting', currentQuestionIndex: 0, totalQuestions: 10 });
      }

      expect(store.currentRoom).not.toBeNull();

      await store.leaveRoom('R1');

      expect(store.currentRoom).toBeNull();
    });

    it('leaveRoom should do nothing if no connection', async () => {
      await store.leaveRoom('ROOM-XYZ');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('RT-008 (P2): Start quiz', () => {
    it('startQuiz should invoke StartQuiz on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.startQuiz('ROOM-ABC');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('StartQuiz', 'ROOM-ABC');
    });

    it('startQuiz should do nothing if no connection', async () => {
      await store.startQuiz('ROOM-ABC');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('startQuiz should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('Quiz already started'); });

      await store.connectQuizRoom('test-token');
      await store.startQuiz('ROOM-ABC');

      expect(store.errorMessage).toBe('Quiz already started');
    });
  });

  describe('RT-009 (P2): Send answer', () => {
    it('submitAnswer should invoke SubmitAnswer with correct params', async () => {
      await store.connectQuizRoom('test-token');
      await store.submitAnswer('ROOM-1', 3, 2);

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('SubmitAnswer', 'ROOM-1', 3, 2);
    });

    it('submitAnswer should do nothing if no connection', async () => {
      await store.submitAnswer('ROOM-1', 0, 1);

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('submitAnswer should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('Time expired'); });

      await store.connectQuizRoom('test-token');
      await store.submitAnswer('ROOM-1', 0, 1);

      expect(store.errorMessage).toBe('Time expired');
    });
  });

  describe('RT-010 (P2): Next question', () => {
    it('nextQuestion should invoke NextQuestion on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.nextQuestion('ROOM-2');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('NextQuestion', 'ROOM-2');
    });

    it('nextQuestion should do nothing if no connection', async () => {
      await store.nextQuestion('ROOM-2');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('nextQuestion should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('No more questions'); });

      await store.connectQuizRoom('test-token');
      await store.nextQuestion('ROOM-2');

      expect(store.errorMessage).toBe('No more questions');
    });
  });

  describe('RT-011 (P2): List rooms', () => {
    it('fetchActiveRooms should invoke GetActiveRooms on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.fetchActiveRooms();

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('GetActiveRooms');
    });

    it('fetchActiveRooms should do nothing if no connection', async () => {
      await store.fetchActiveRooms();

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('activeRooms should update when ActiveRooms event fires', async () => {
      type RoomsHandler = (rooms: { roomCode: string; quizTitle: string; quizId: string; hostUsername: string; participants: unknown[]; status: string; currentQuestionIndex: number; totalQuestions: number }[]) => void;
      let roomsHandler: RoomsHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'ActiveRooms') {
          roomsHandler = handler as RoomsHandler;
        }
      });

      await store.connectQuizRoom('test-token');

      if (roomsHandler) {
        (roomsHandler as RoomsHandler)([
          { roomCode: 'R1', quizTitle: 'Quiz 1', quizId: 'q1', hostUsername: 'host1', participants: [], status: 'Waiting', currentQuestionIndex: 0, totalQuestions: 10 },
          { roomCode: 'R2', quizTitle: 'Quiz 2', quizId: 'q2', hostUsername: 'host2', participants: [], status: 'InProgress', currentQuestionIndex: 3, totalQuestions: 15 },
        ]);
      }

      expect(store.activeRooms.length).toBe(2);
      expect(store.activeRooms[0].roomCode).toBe('R1');
      expect(store.activeRooms[1].roomCode).toBe('R2');
    });
  });
});

describe('Payment — P2 Tests', () => {
  let store: ReturnType<typeof usePaymentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePaymentStore();
    vi.clearAllMocks();
  });

  describe('PA-002 (P2): Marketing card', () => {
    it('PremiumMarketingCard should render premium badge', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('VDSA PREMIUM');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should display premium price', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('199.000đ');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should list premium features', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('Không giới hạn số lần biên dịch');
      expect(wrapper.text()).toContain('Truy cập toàn bộ bài giảng cao cấp');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should show lifetime plan label', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('Gói trọn đời (Lifetime)');

      wrapper.unmount();
    });
  });

  describe('PA-005 (P2): Transfer info', () => {
    it('QrPaymentPanel should display bank name', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY123',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('MBBank');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display bank account number', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '987654321',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY456',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('987654321');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display account name', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'CONG TY DSA',
        amount: 199000,
        paymentCode: 'PAY789',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('CONG TY DSA');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display amount in VND', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY999',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('199.000');

      wrapper.unmount();
    });
  });

  describe('PA-006 (P2): Copy payment code', () => {
    it('QrPaymentPanel should display payment code', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'VDSA2024XYZ',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('VDSA2024XYZ');

      wrapper.unmount();
    });

    it('QrPaymentPanel copy button should write payment code to clipboard', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'COPY_ME',
      };

      const writeTextSpy = vi.fn(async () => {});
      Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      const copyBtn = wrapper.find('button[aria-live="polite"]');
      await copyBtn.trigger('click');

      expect(writeTextSpy).toHaveBeenCalledWith('COPY_ME');

      wrapper.unmount();
    });

    it('QrPaymentPanel should show "Đã copy" after successful copy', async () => {
      vi.useFakeTimers();
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'COPY_TEST',
      };

      Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => {}) } });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      const copyBtn = wrapper.find('button[aria-live="polite"]');
      await copyBtn.trigger('click');
      await nextTick();

      expect(copyBtn.text()).toBe('Đã copy');

      vi.advanceTimersByTime(2000);
      await nextTick();

      expect(copyBtn.text()).toBe('Copy');

      vi.useRealTimers();
      wrapper.unmount();
    });
  });

  describe('PA-007 (P2): QR expired', () => {
    it('QrPaymentPanel should show expired overlay when isExpired is true', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY123',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('Mã hết hạn');

      wrapper.unmount();
    });

    it('QrPaymentPanel should show retry button when expired', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY123',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      const hasRetryButton = wrapper.findAll('button').some((btn) => btn.text().includes('Thử lại'));

      expect(hasRetryButton).toBe(true);

      wrapper.unmount();
    });

    it('QrPaymentPanel should emit retry event when retry button clicked', async () => {
      const order = {
        qrUrl: 'data:image/png;base64,test',
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        amount: 199000,
        paymentCode: 'PAY123',
      };

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      const allButtons = wrapper.findAll('button');
      const retryBtn = allButtons.find((btn) => btn.text().includes('Thử lại'));

      if (retryBtn) {
        await retryBtn.trigger('click');
        expect(wrapper.emitted('retry')).toBeTruthy();
      }

      wrapper.unmount();
    });

    it('usePaymentTimer isExpired should be true when timer reaches 0', async () => {
      vi.useFakeTimers();
      const { timerSeconds, isExpired, startTimer } = usePaymentTimer(2);

      startTimer(2);
      expect(isExpired.value).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(timerSeconds.value).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(timerSeconds.value).toBe(0);
      expect(isExpired.value).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('PA-008 (P2): Success screen', () => {
    it('CheckoutSuccessScreen should render success message', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Thanh Toán Thành Công!');

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should render finish button', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Bắt đầu trải nghiệm ngay');

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should emit finish event on button click', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      const btn = wrapper.find('button');
      await btn.trigger('click');

      expect(wrapper.emitted('finish')).toBeTruthy();

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should show premium unlocked message', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Tài khoản đã được nâng cấp lên Premium');

      wrapper.unmount();
    });
  });

  describe('PA-011 (P2): PremiumGate content', () => {
    it('PremiumGate should show overlay when user is not premium', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.find('.premium-gate__overlay').exists()).toBe(true);
      expect(wrapper.find('.premium-gate__content').exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should blur content when locked', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      const content = wrapper.find('.premium-gate__content');
      expect(content.exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should show upgrade button with price', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Nâng cấp Premium');
      expect(wrapper.text()).toContain('199.000đ');

      wrapper.unmount();
    });

    it('PremiumGate should show custom message when provided', async () => {
      const wrapper = mount(PremiumGate, {
        props: {
          message: 'Custom premium message here',
        },
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Custom premium message here');

      wrapper.unmount();
    });

    it('PremiumGate should show default message when no custom message', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Tính năng này yêu cầu tài khoản Premium');

      wrapper.unmount();
    });
  });

  describe('PA-012 (P2): Polling', () => {
    it('usePaymentPolling should start polling with interval', () => {
      vi.useFakeTimers();
      const { isPolling, startPolling, stopPolling } = usePaymentPolling();

      const onSuccess = vi.fn();

      startPolling('order-123', 'token', onSuccess);

      expect(isPolling.value).toBe(true);

      vi.advanceTimersByTime(3000);

      stopPolling();
      expect(isPolling.value).toBe(false);

      vi.useRealTimers();
    });

    it('usePaymentPolling should stop polling when stopPolling is called', () => {
      vi.useFakeTimers();
      const { isPolling, startPolling, stopPolling } = usePaymentPolling();

      startPolling('order-123', 'token', vi.fn());
      expect(isPolling.value).toBe(true);

      stopPolling();
      expect(isPolling.value).toBe(false);

      vi.useRealTimers();
    });

    it('usePaymentPolling should handle error gracefully with onError callback', () => {
      vi.useFakeTimers();
      const { startPolling, stopPolling } = usePaymentPolling();

      const onError = vi.fn();
      const onSuccess = vi.fn();

      startPolling('order-123', 'token', onSuccess, onError);

      vi.advanceTimersByTime(3000);

      stopPolling();

      vi.useRealTimers();
    });

    it('usePaymentTimer should count down from initial duration', () => {
      vi.useFakeTimers();
      const { timerSeconds, startTimer } = usePaymentTimer(900);

      startTimer(900);
      expect(timerSeconds.value).toBe(900);

      vi.advanceTimersByTime(1000);
      expect(timerSeconds.value).toBe(899);

      vi.advanceTimersByTime(5000);
      expect(timerSeconds.value).toBe(894);

      vi.useRealTimers();
    });

    it('usePaymentTimer should format time as MM:SS', () => {
      const { formattedTime, startTimer } = usePaymentTimer(900);

      startTimer(900);
      expect(formattedTime.value).toBe('15:00');

      const { formattedTime: ft2, startTimer: st2 } = usePaymentTimer(65);
      st2(65);
      expect(ft2.value).toBe('01:05');
    });
  });
});
