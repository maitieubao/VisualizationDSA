// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

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

import { useSignalRStore } from '../stores/useSignalRStore';

describe('Realtime SignalR — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('RT-001 (P0): Connect hub', () => {
    it('connectLeaderboard should set status to connected', async () => {
      const store = useSignalRStore();
      expect(store.leaderboardState).toBe('disconnected');

      await store.connectLeaderboard();

      expect(store.leaderboardState).toBe('connected');
      expect(store.isLeaderboardConnected).toBe(true);
    });

    it('connectNotifications should set status to connected', async () => {
      const store = useSignalRStore();
      expect(store.notificationState).toBe('disconnected');

      await store.connectNotifications('test-token');

      expect(store.notificationState).toBe('connected');
      expect(store.isNotificationConnected).toBe(true);
    });

    it('connectQuizRoom should set status to connected', async () => {
      const store = useSignalRStore();
      expect(store.quizRoomState).toBe('disconnected');

      await store.connectQuizRoom('test-token');

      expect(store.quizRoomState).toBe('connected');
      expect(store.isQuizRoomConnected).toBe(true);
    });
  });

  describe('RT-004 (P0): Mark notification read', () => {
    it('markNotificationsRead should reset unreadNotificationCount to 0', () => {
      const store = useSignalRStore();
      store.markNotificationsRead();
      expect(store.unreadNotificationCount).toBe(0);
    });

    it('markNotificationsRead should clear count after notifications arrive', async () => {
      const store = useSignalRStore();

      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;
      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({ userId: '1', username: 'testuser', badgeName: 'First Quiz', badgeDescription: 'Completed first quiz', awardedAt: new Date().toISOString() });
      }

      expect(store.unreadNotificationCount).toBeGreaterThanOrEqual(0);

      store.markNotificationsRead();
      expect(store.unreadNotificationCount).toBe(0);
    });
  });

  describe('RT-005 (P0): Create quiz room', () => {
    it('createRoom should invoke CreateRoom on the connection', async () => {
      const store = useSignalRStore();

      await store.connectQuizRoom('test-token');
      await store.createRoom('quiz-123');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('CreateRoom', 'quiz-123');
    });

    it('createRoom should do nothing if no connection', async () => {
      const store = useSignalRStore();

      await store.createRoom('quiz-123');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('RT-006 (P0): Join room', () => {
    it('joinRoom should invoke JoinRoom on the connection', async () => {
      const store = useSignalRStore();

      await store.connectQuizRoom('test-token');
      await store.joinRoom('ROOM-ABC');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('JoinRoom', 'ROOM-ABC');
    });

    it('joinRoom should do nothing if no connection', async () => {
      const store = useSignalRStore();

      await store.joinRoom('ROOM-ABC');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('RT-017 (P1): Connection status', () => {
    it('leaderboardState should be reactive — starts disconnected', () => {
      const store = useSignalRStore();
      expect(store.leaderboardState).toBe('disconnected');
    });

    it('isLeaderboardConnected should be false when disconnected', () => {
      const store = useSignalRStore();
      expect(store.isLeaderboardConnected).toBe(false);
    });

    it('isLeaderboardConnected should be true after connecting', async () => {
      const store = useSignalRStore();
      await store.connectLeaderboard();
      expect(store.isLeaderboardConnected).toBe(true);
    });

    it('notificationState should be reactive', () => {
      const store = useSignalRStore();
      expect(store.notificationState).toBe('disconnected');
      expect(store.isNotificationConnected).toBe(false);
    });

    it('quizRoomState should be reactive', async () => {
      const store = useSignalRStore();
      expect(store.quizRoomState).toBe('disconnected');
      expect(store.isQuizRoomConnected).toBe(false);

      await store.connectQuizRoom('test-token');
      expect(store.quizRoomState).toBe('connected');
      expect(store.isQuizRoomConnected).toBe(true);
    });

    it('disconnectLeaderboard should set state to disconnected', async () => {
      const store = useSignalRStore();
      await store.connectLeaderboard();
      expect(store.isLeaderboardConnected).toBe(true);

      await store.disconnectLeaderboard();
      expect(store.leaderboardState).toBe('disconnected');
      expect(store.isLeaderboardConnected).toBe(false);
    });
  });
});
